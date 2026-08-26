import { useCallback, useState } from 'react';
import { Stone, Player, GomokuStatus, MoveRecord, BoardConfig } from '../types/game';
import { DEFAULT_CONFIG } from '../constants/config';

/**
 * useGomokuGame hook 的返回值类型定义
 * 包含棋盘状态、玩家信息、游戏进度及操作方法
 */
interface UseGomokuGameReturn {
    /** 棋盘状态，二维数组，null 表示空位 */
    board: Stone[][];
    /** 当前轮到的玩家 */
    currentPlayer: Player;
    /** 游戏状态：idle | playing | won | draw */
    status: GomokuStatus;
    /** 胜利者，游戏未结束时为 null */
    winner: Player | null;
    /** 已下棋步数 */
    moveCount: number;
    /** 最近一步落子记录，用于高亮显示 */
    lastMove: MoveRecord | null;
    /** 胜利时连成的线，用于在 UI 上高亮标记 */
    winLine: Array<{ row: number; col: number }> | null;
    /** 开始游戏，重置棋盘并进入 playing 状态 */
    start: () => void;
    /** 重新开始，等同于 start */
    restart: () => void;
    /** 在 (row, col) 落子，返回是否成功 */
    makeMove: (row: number, col: number) => boolean;
    /** 悔棋，撤销最近一步 */
    undo: () => void;
}

/**
 * 创建指定大小的空棋盘
 * @param size - 棋盘边长（如 15 表示 15×15）
 * @returns 全部填充为 null 的二维数组
 */
function createEmptyBoard(size: number): Stone[][] {
    return Array.from({ length: size }, () => Array<Stone>(size).fill(null));
}

/**
 * 检测在 (row, col) 落子后是否形成胜利连线
 *
 * 算法：以落子点为中心，沿四个方向（横、竖、正斜、反斜）
 * 分别向正反两侧延伸，统计同色连续棋子数量。
 * 若任一方向连线长度 >= winLength，则返回该连线坐标。
 *
 * @param board       - 当前棋盘
 * @param row         - 落子行号
 * @param col         - 落子列号
 * @param player      - 刚落子的玩家
 * @param winLength   - 胜利所需连子数（如 5）
 * @returns 胜利连线坐标数组，未胜利则返回 null
 */
function checkWin(
    board: Stone[][],
    row: number,
    col: number,
    player: Player,
    winLength: number
): Array<{ row: number; col: number }> | null {
    // 四个方向：[dr, dc] → 水平、垂直、右下斜、左下斜
    const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1],
    ];

    for (const [dr, dc] of directions) {
        // 落子点本身计入连线
        const line: Array<{ row: number; col: number }> = [{ row, col }];

        // 正方向延伸：从落子点沿 (dr, dc) 方向逐格检查
        for (let i = 1; i < winLength; i++) {
            const r = row + dr * i;
            const c = col + dc * i;
            // 越界或遇到非同色棋子则停止
            if (r < 0 || r >= board.length || c < 0 || c >= board.length) break;
            if (board[r][c] !== player) break;
            line.push({ row: r, col: c });
        }

        // 反方向延伸：从落子点沿 -(dr, dc) 方向逐格检查
        for (let i = 1; i < winLength; i++) {
            const r = row - dr * i;
            const c = col - dc * i;
            if (r < 0 || r >= board.length || c < 0 || c >= board.length) break;
            if (board[r][c] !== player) break;
            line.push({ row: r, col: c });
        }

        // 连线长度达到胜利条件即返回
        if (line.length >= winLength) {
            return line;
        }
    }

    return null;
}

/**
 * 五子棋核心逻辑 hook
 *
 * 管理棋盘状态、轮流落子、胜利/平局检测、悔棋等完整游戏流程。
 *
 * @param config - 棋盘配置（尺寸、胜利连子数），默认使用 DEFAULT_CONFIG
 * @returns 游戏状态和操作方法
 */
export function useGomokuGame(config: BoardConfig = DEFAULT_CONFIG): UseGomokuGameReturn {
    const { boardSize, winLength } = config;

    // 棋盘状态：二维数组，每格为 null | 'black' | 'white'
    const [board, setBoard] = useState<Stone[][]>(() => createEmptyBoard(boardSize));
    // 当前轮到的玩家，黑棋先行
    const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
    // 游戏状态机
    const [status, setStatus] = useState<GomokuStatus>('idle');
    // 胜利者
    const [winner, setWinner] = useState<Player | null>(null);
    // 落子历史，用于悔棋和步数统计
    const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
    // 胜利连线坐标
    const [winLine, setWinLine] = useState<Array<{ row: number; col: number }> | null>(null);

    /**
     * 开始新游戏：清空棋盘，重置所有状态，进入 playing
     */
    const start = useCallback(() => {
        setBoard(createEmptyBoard(boardSize));
        setCurrentPlayer('black');
        setStatus('playing');
        setWinner(null);
        setMoveHistory([]);
        setWinLine(null);
    }, [boardSize]);

    /**
     * 重新开始：直接调用 start
     */
    const restart = useCallback(() => {
        start();
    }, [start]);

    /**
     * 落子操作
     *
     * 流程：
     * 1. 校验游戏状态和目标位置是否为空
     * 2. 在棋盘上放置当前玩家的棋子
     * 3. 记录落子历史
     * 4. 检测是否胜利 → 若胜利则设置 winner 和 winLine
     * 5. 检测是否平局 → 棋盘填满且无人胜利
     * 6. 若未结束，切换到另一位玩家
     *
     * @param row - 落子行号
     * @param col - 落子列号
     * @returns 落子是否成功
     */
    const makeMove = useCallback(
        (row: number, col: number): boolean => {
            // 游戏未进行中或位置已被占用，拒绝落子
            if (status !== 'playing') return false;
            if (board[row][col] !== null) return false;

            // 深拷贝棋盘并落子
            const newBoard = board.map((r) => [...r]);
            newBoard[row][col] = currentPlayer;

            // 记录落子历史
            const move: MoveRecord = { row, col, player: currentPlayer };
            const newHistory = [...moveHistory, move];

            setBoard(newBoard);
            setMoveHistory(newHistory);

            // 检测胜利：以当前落子点为中心检查四个方向
            const line = checkWin(newBoard, row, col, currentPlayer, winLength);
            if (line) {
                setWinLine(line);
                setWinner(currentPlayer);
                setStatus('won');
                return true;
            }

            // 检测平局：所有格子已填满且无人胜利
            if (newHistory.length >= boardSize * boardSize) {
                setStatus('draw');
                return true;
            }

            // 切换玩家
            setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
            return true;
        },
        [status, board, currentPlayer, moveHistory, winLength, boardSize]
    );

    /**
     * 悔棋：撤销最近一步落子
     *
     * 只在 playing 状态且有历史记录时可用。
     * 撤销后棋盘移除对应棋子，当前玩家恢复为该步的落子者。
     */
    const undo = useCallback(() => {
        if (status !== 'playing' || moveHistory.length === 0) return;

        // 移除最后一步记录
        const newHistory = moveHistory.slice(0, -1);
        const lastEntry = moveHistory[moveHistory.length - 1];

        // 在棋盘上清除该位置的棋子
        const newBoard = board.map((r) => [...r]);
        newBoard[lastEntry.row][lastEntry.col] = null;

        setBoard(newBoard);
        setMoveHistory(newHistory);
        // 将当前玩家恢复为被撤销那一步的落子者
        setCurrentPlayer(lastEntry.player);
        setWinLine(null);
        setWinner(null);
    }, [status, moveHistory, board]);

    return {
        board,
        currentPlayer,
        status,
        winner,
        moveCount: moveHistory.length,
        lastMove: moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null,
        winLine,
        start,
        restart,
        makeMove,
        undo,
    };
}
