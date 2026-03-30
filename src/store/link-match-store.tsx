/**
 * 连连看游戏状态管理模块
 *
 * 独立的 Context + useReducer 架构，与贪吃蛇状态完全解耦。
 * 核心交互逻辑集中在 SELECT_CELL action 的多分支处理中。
 */

import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'

import {
  createInitialState,
  generateBoard,
  findMatchPath,
  hasAnyValidMove,
  DIFFICULTY_CONFIG,
  type LinkMatchState,
  type CellCoord,
  type Difficulty,
} from '@/lib/link-match-utils'

import { saveLinkMatchHighScore } from '@/lib/link-match-persistence'

// ─── Action 类型 ─────────────────────────────────────────

/** 连连看游戏动作联合类型 */
export type LinkMatchAction =
  | { type: 'START' }
  | { type: 'RESET' }
  | { type: 'SELECT_CELL'; coord: CellCoord }
  | { type: 'CLEAR_MATCH' }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }

// ─── Reducer ─────────────────────────────────────────────

/** 连连看游戏 Reducer */
function linkMatchReducer(
  state: LinkMatchState,
  action: LinkMatchAction,
): LinkMatchState {
  switch (action.type) {
    case 'START': {
      const config = DIFFICULTY_CONFIG[state.difficulty]
      const board = generateBoard(config)
      const totalCells = config.rows * config.cols
      return {
        ...state,
        board,
        selected: null,
        status: 'playing',
        score: 0,
        config,
        animation: { path: null, matchedCoords: null },
        remainingPairs: totalCells / 2,
      }
    }

    case 'RESET':
      return createInitialState(state.difficulty)

    case 'SELECT_CELL': {
      // 非 playing 或动画中忽略
      if (state.status !== 'playing') return state
      if (state.animation.path !== null) return state

      const { coord } = action
      const { board, selected } = state
      const cell = board[coord.row][coord.col]

      // 空格忽略
      if (cell.isEmpty) return state

      // 第一次选中
      if (selected === null) {
        return { ...state, selected: coord }
      }

      // 点击同一格，取消选中
      if (selected.row === coord.row && selected.col === coord.col) {
        return { ...state, selected: null }
      }

      // emoji 不同，切换选中
      if (board[selected.row][selected.col].emoji !== cell.emoji) {
        return { ...state, selected: coord }
      }

      // emoji 相同，尝试路径查找
      const path = findMatchPath(board, selected, coord)
      if (!path) {
        // 无法连接，取消选中
        return { ...state, selected: null }
      }

      // 找到路径，启动动画
      return {
        ...state,
        selected: null,
        animation: {
          path,
          matchedCoords: [selected, coord],
        },
      }
    }

    case 'CLEAR_MATCH': {
      if (!state.animation.matchedCoords) return state

      const [c1, c2] = state.animation.matchedCoords
      const newBoard = state.board.map((row) => row.map((cell) => ({ ...cell })))
      newBoard[c1.row][c1.col].isEmpty = true
      newBoard[c2.row][c2.col].isEmpty = true

      const newScore = state.score + 10
      const newRemaining = state.remainingPairs - 1
      let newHighScore = state.highScore
      if (newScore > newHighScore) {
        newHighScore = newScore
        saveLinkMatchHighScore(newHighScore)
      }

      // 胜利检测
      if (newRemaining === 0) {
        return {
          ...state,
          board: newBoard,
          score: newScore,
          highScore: newHighScore,
          remainingPairs: 0,
          status: 'win',
          animation: { path: null, matchedCoords: null },
        }
      }

      // 无可用步骤检测
      if (!hasAnyValidMove(newBoard)) {
        return {
          ...state,
          board: newBoard,
          score: newScore,
          highScore: newHighScore,
          remainingPairs: newRemaining,
          status: 'nomoves',
          animation: { path: null, matchedCoords: null },
        }
      }

      return {
        ...state,
        board: newBoard,
        score: newScore,
        highScore: newHighScore,
        remainingPairs: newRemaining,
        animation: { path: null, matchedCoords: null },
      }
    }

    case 'SET_DIFFICULTY': {
      return createInitialState(action.difficulty)
    }

    default:
      return state
  }
}

// ─── Context + Provider ──────────────────────────────────

const LinkMatchStateContext = createContext<LinkMatchState | null>(null)
const LinkMatchDispatchContext = createContext<Dispatch<LinkMatchAction> | null>(null)

/** 连连看游戏状态 Provider */
export function LinkMatchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(linkMatchReducer, createInitialState())

  return (
    <LinkMatchStateContext.Provider value={state}>
      <LinkMatchDispatchContext.Provider value={dispatch}>
        {children}
      </LinkMatchDispatchContext.Provider>
    </LinkMatchStateContext.Provider>
  )
}

/** 获取连连看游戏状态 */
export function useLinkMatchState(): LinkMatchState {
  const ctx = useContext(LinkMatchStateContext)
  if (!ctx) throw new Error('useLinkMatchState must be used within LinkMatchProvider')
  return ctx
}

/** 获取连连看游戏 dispatch */
export function useLinkMatchDispatch(): Dispatch<LinkMatchAction> {
  const ctx = useContext(LinkMatchDispatchContext)
  if (!ctx) throw new Error('useLinkMatchDispatch must be used within LinkMatchProvider')
  return ctx
}
