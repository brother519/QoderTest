import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { type Piece, type Position, GameState, GameMode, PieceType } from '@/types'
import { BOARD_SIZE } from '@/constants/game'
import { generateBoard, swapPieces, isAdjacent } from '@/core/Board'
import { findAllMatches, getMatchedPositions, wouldSwapCreateMatch, hasValidMoves } from '@/core/Matcher'
import { applyGravity, removeMatchedPieces, clearRemovedPieces } from '@/core/Gravity'
import { calculateMatchScore } from '@/core/ScoreCalculator'
import { findIntersections, createSpecialPiece, triggerSpecialPiece, triggerRainbow } from '@/core/SpecialPiece'
import { SpecialType } from '@/types'
import { LEVELS } from '@/constants/levels'

export const useGameStore = defineStore('game', () => {
  const board = ref<Piece[][]>([])
  const score = ref(0)
  const moves = ref(0)
  const maxMoves = ref(20)
  const combo = ref(0)
  const state = ref<GameState>(GameState.IDLE)
  const mode = ref<GameMode>(GameMode.CLASSIC)
  const currentLevel = ref(1)
  const selectedPiece = ref<Position | null>(null)
  const timeLeft = ref(60)
  const targetScore = ref(1000)
  const pieceTypes = ref<PieceType[]>([PieceType.RED, PieceType.BLUE, PieceType.GREEN, PieceType.YELLOW])
  
  const isPlaying = computed(() => state.value === GameState.PLAYING)
  const isAnimating = computed(() => state.value === GameState.ANIMATING)
  const isGameOver = computed(() => state.value === GameState.GAME_OVER)
  const isLevelComplete = computed(() => state.value === GameState.LEVEL_COMPLETE)
  const movesLeft = computed(() => maxMoves.value - moves.value)
  
  function initGame(levelId: number = 1, gameMode: GameMode = GameMode.CLASSIC) {
    const level = LEVELS.find(l => l.id === levelId) || LEVELS[0]
    
    currentLevel.value = levelId
    mode.value = gameMode
    pieceTypes.value = level.pieceTypes
    maxMoves.value = level.moves
    targetScore.value = level.targetScore
    
    board.value = generateBoard(pieceTypes.value)
    score.value = 0
    moves.value = 0
    combo.value = 0
    selectedPiece.value = null
    timeLeft.value = gameMode === GameMode.TIMED ? 60 : 0
    state.value = GameState.PLAYING
  }
  
  function selectPiece(pos: Position) {
    if (state.value !== GameState.PLAYING) return
    
    if (!selectedPiece.value) {
      selectedPiece.value = pos
      return
    }
    
    if (selectedPiece.value.row === pos.row && selectedPiece.value.col === pos.col) {
      selectedPiece.value = null
      return
    }
    
    if (isAdjacent(selectedPiece.value, pos)) {
      trySwap(selectedPiece.value, pos)
      selectedPiece.value = null
    } else {
      selectedPiece.value = pos
    }
  }
  
  async function trySwap(pos1: Position, pos2: Position) {
    const piece1 = board.value[pos1.row][pos1.col]
    const piece2 = board.value[pos2.row][pos2.col]
    
    if (piece1.special === SpecialType.RAINBOW || piece2.special === SpecialType.RAINBOW) {
      state.value = GameState.ANIMATING
      swapPieces(board.value, pos1, pos2)
      
      let affectedPositions: Position[] = []
      if (piece1.special === SpecialType.RAINBOW && piece2.special !== SpecialType.RAINBOW) {
        affectedPositions = triggerRainbow(board.value, piece1, piece2.type)
      } else if (piece2.special === SpecialType.RAINBOW && piece1.special !== SpecialType.RAINBOW) {
        affectedPositions = triggerRainbow(board.value, piece2, piece1.type)
      } else {
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            affectedPositions.push({ row: r, col: c })
          }
        }
      }
      
      moves.value++
      await processMatches(affectedPositions)
      return
    }
    
    if (!wouldSwapCreateMatch(board.value, pos1, pos2)) {
      state.value = GameState.ANIMATING
      swapPieces(board.value, pos1, pos2)
      await delay(150)
      swapPieces(board.value, pos1, pos2)
      state.value = GameState.PLAYING
      return
    }
    
    state.value = GameState.ANIMATING
    swapPieces(board.value, pos1, pos2)
    moves.value++
    
    await processMatchCycle()
  }
  
  async function processMatches(positions: Position[]) {
    removeMatchedPieces(board.value, positions)
    score.value += positions.length * 10 * (1 + combo.value * 0.5)
    combo.value++
    
    await delay(200)
    clearRemovedPieces(board.value)
    applyGravity(board.value, pieceTypes.value)
    
    await delay(300)
    await processMatchCycle()
  }
  
  async function processMatchCycle() {
    let matches = findAllMatches(board.value)
    
    while (matches.length > 0) {
      const intersections = findIntersections(matches)
      
      for (const match of matches) {
        if (match.length >= 4) {
          createSpecialPiece(board.value, match, intersections)
        }
      }
      
      const matchedPositions = getMatchedPositions(matches)
      
      for (const pos of matchedPositions) {
        const piece = board.value[pos.row]?.[pos.col]
        if (piece?.special && piece.special !== SpecialType.NONE && piece.special !== SpecialType.RAINBOW) {
          const specialAffected = triggerSpecialPiece(board.value, piece)
          for (const sp of specialAffected) {
            if (!matchedPositions.some(mp => mp.row === sp.row && mp.col === sp.col)) {
              matchedPositions.push(sp)
            }
          }
        }
      }
      
      score.value += calculateMatchScore(matches, combo.value)
      combo.value++
      
      removeMatchedPieces(board.value, matchedPositions)
      await delay(200)
      
      clearRemovedPieces(board.value)
      applyGravity(board.value, pieceTypes.value)
      await delay(300)
      
      matches = findAllMatches(board.value)
    }
    
    combo.value = 0
    checkGameEnd()
  }
  
  function checkGameEnd() {
    if (mode.value === GameMode.CLASSIC) {
      if (score.value >= targetScore.value) {
        state.value = GameState.LEVEL_COMPLETE
        return
      }
      
      if (moves.value >= maxMoves.value) {
        state.value = GameState.GAME_OVER
        return
      }
    }
    
    if (!hasValidMoves(board.value)) {
      board.value = generateBoard(pieceTypes.value)
    }
    
    state.value = GameState.PLAYING
  }
  
  function pauseGame() {
    if (state.value === GameState.PLAYING) {
      state.value = GameState.PAUSED
    }
  }
  
  function resumeGame() {
    if (state.value === GameState.PAUSED) {
      state.value = GameState.PLAYING
    }
  }
  
  function nextLevel() {
    if (currentLevel.value < LEVELS.length) {
      initGame(currentLevel.value + 1, mode.value)
    }
  }
  
  function restartLevel() {
    initGame(currentLevel.value, mode.value)
  }
  
  return {
    board,
    score,
    moves,
    maxMoves,
    combo,
    state,
    mode,
    currentLevel,
    selectedPiece,
    timeLeft,
    targetScore,
    isPlaying,
    isAnimating,
    isGameOver,
    isLevelComplete,
    movesLeft,
    initGame,
    selectPiece,
    pauseGame,
    resumeGame,
    nextLevel,
    restartLevel
  }
})

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
