/** 坐标点 */
export interface Point {
  x: number
  y: number
}

/** 移动方向 */
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

/** 游戏状态枚举 */
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover'

/** 游戏难度 */
export type Difficulty = 'easy' | 'normal' | 'hard'

/** 游戏配置 */
export interface GameConfig {
  gridSize: number       // 网格大小（格子数）
  cellSize: number       // 每个格子的像素大小
  initialSpeed: number   // 初始速度（ms 间隔，越小越快）
  initialSnakeLength: number
}

/** 游戏完整状态 */
export interface GameState {
  snake: Point[]
  food: Point
  direction: Direction
  nextDirection: Direction
  status: GameStatus
  score: number
  highScore: number
  speed: number
  difficulty: Difficulty
  config: GameConfig
}

/** 难度对应的速度配置 */
const DIFFICULTY_SPEED: Record<Difficulty, number> = {
  easy: 180,
  normal: 120,
  hard: 75,
}

/** 默认游戏配置 */
export const DEFAULT_CONFIG: GameConfig = {
  gridSize: 20,
  cellSize: 20,
  initialSpeed: 120,
  initialSnakeLength: 3,
}

/** 方向向量映射 */
const DIRECTION_VECTORS: Record<Direction, Point> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
}

/** 反方向映射，用于防止蛇掉头 */
const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
}

/** 生成初始蛇身 */
export function createInitialSnake(config: GameConfig): Point[] {
  const centerX = Math.floor(config.gridSize / 2)
  const centerY = Math.floor(config.gridSize / 2)
  const snake: Point[] = []
  for (let i = 0; i < config.initialSnakeLength; i++) {
    snake.push({ x: centerX - i, y: centerY })
  }
  return snake
}

/** 在空位置生成食物 */
export function generateFood(snake: Point[], gridSize: number): Point {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`))
  const available: Point[] = []
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (!occupied.has(`${x},${y}`)) {
        available.push({ x, y })
      }
    }
  }
  if (available.length === 0) {
    return { x: 0, y: 0 }
  }
  return available[Math.floor(Math.random() * available.length)]
}

/** 计算蛇头下一个位置 */
export function getNextHead(head: Point, direction: Direction, gridSize: number): Point {
  const vector = DIRECTION_VECTORS[direction]
  return {
    x: (head.x + vector.x + gridSize) % gridSize,
    y: (head.y + vector.y + gridSize) % gridSize,
  }
}

/** 检测蛇是否撞到自身 */
export function checkSelfCollision(head: Point, body: Point[]): boolean {
  return body.some((segment) => segment.x === head.x && segment.y === head.y)
}

/** 检查方向变更是否合法（不能直接掉头） */
export function isValidDirectionChange(current: Direction, next: Direction): boolean {
  return OPPOSITE_DIRECTION[current] !== next
}

/** 根据难度获取速度 */
export function getSpeedByDifficulty(difficulty: Difficulty): number {
  return DIFFICULTY_SPEED[difficulty]
}

/** 根据得分动态加速（每得 5 分加速一次） */
export function getSpeedByScore(baseSpeed: number, score: number): number {
  const speedReduction = Math.floor(score / 5) * 8
  return Math.max(baseSpeed - speedReduction, 50)
}

/** 创建初始游戏状态 */
export function createInitialState(
  difficulty: Difficulty = 'normal',
  config: GameConfig = DEFAULT_CONFIG
): GameState {
  const snake = createInitialSnake(config)
  const speed = getSpeedByDifficulty(difficulty)
  return {
    snake,
    food: generateFood(snake, config.gridSize),
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    status: 'idle',
    score: 0,
    highScore: loadHighScore(),
    speed,
    difficulty,
    config: { ...config, initialSpeed: speed },
  }
}

/** 执行一步游戏逻辑，返回新状态 */
export function gameTick(state: GameState): GameState {
  if (state.status !== 'playing') return state

  const direction = state.nextDirection
  const head = state.snake[0]
  const nextHead = getNextHead(head, direction, state.config.gridSize)

  // 检测自身碰撞（排除尾部，因为尾部会移动走）
  const bodyWithoutTail = state.snake.slice(0, -1)
  if (checkSelfCollision(nextHead, bodyWithoutTail)) {
    return { ...state, status: 'gameover', direction }
  }

  const ateFood = nextHead.x === state.food.x && nextHead.y === state.food.y
  const newSnake = [nextHead, ...state.snake]

  if (!ateFood) {
    newSnake.pop()
  }

  const newScore = ateFood ? state.score + 1 : state.score
  const newHighScore = Math.max(newScore, state.highScore)
  const newSpeed = ateFood
    ? getSpeedByScore(state.config.initialSpeed, newScore)
    : state.speed
  const newFood = ateFood
    ? generateFood(newSnake, state.config.gridSize)
    : state.food

  if (ateFood && newHighScore > state.highScore) {
    saveHighScore(newHighScore)
  }

  return {
    ...state,
    snake: newSnake,
    food: newFood,
    direction,
    score: newScore,
    highScore: newHighScore,
    speed: newSpeed,
  }
}

/** 键盘按键映射为方向 */
export function keyToDirection(key: string): Direction | null {
  const mapping: Record<string, Direction> = {
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
    w: 'UP',
    W: 'UP',
    s: 'DOWN',
    S: 'DOWN',
    a: 'LEFT',
    A: 'LEFT',
    d: 'RIGHT',
    D: 'RIGHT',
  }
  return mapping[key] ?? null
}

const HIGH_SCORE_KEY = 'snake-game-high-score'

function loadHighScore(): number {
  try {
    const val = localStorage.getItem(HIGH_SCORE_KEY)
    return val ? parseInt(val, 10) : 0
  } catch {
    return 0
  }
}

function saveHighScore(score: number): void {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score))
  } catch {
    // localStorage 不可用时忽略
  }
}
