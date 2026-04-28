/**
 * 连连看游戏类型定义文件
 *
 * 定义游戏中所有核心数据结构，包括坐标、卡牌、棋盘状态、
 * 连接路径、游戏配置等接口与类型。
 *
 * @module link-match/types/game
 */

/**
 * 棋盘坐标位置
 *
 * 表示棋盘上的一个格子坐标，用于卡牌定位和路径计算。
 * 坐标系以棋盘左上角为原点，row 向下递增，col 向右递增。
 *
 * @property {number} row - 行索引（0 为外围顶部边界，1~rows 为有效区域）
 * @property {number} col - 列索引（0 为外围左侧边界，1~cols 为有效区域）
 */
export interface Position {
  row: number;
  col: number;
}

/**
 * 单张卡牌数据
 *
 * 描述棋盘上一张卡牌的完整信息，包括唯一标识、显示图标、位置和匹配状态。
 * 每种图标会生成一对卡牌（2 张），玩家需要找到并连接同一图标的两张卡牌完成消除。
 *
 * @property {number} id - 卡牌唯一标识符，在整局游戏中不重复
 * @property {string} icon - 卡牌显示的 emoji 图标
 * @property {number} row - 卡牌在棋盘中的行坐标
 * @property {number} col - 卡牌在棋盘中的列坐标
 * @property {boolean} matched - 是否已被成功消除（消除后保留占位但视觉隐藏）
 */
export interface Card {
  id: number;
  icon: string;
  row: number;
  col: number;
  matched: boolean;
}

/**
 * 游戏状态枚举
 *
 * 表示游戏生命周期中的四种状态：
 * - `'idle'`：初始状态，等待玩家首次点击卡牌开始游戏
 * - `'playing'`：游戏进行中，计时器运行，玩家可以操作
 * - `'paused'`：游戏暂停，计时器停止，棋盘被遮罩覆盖
 * - `'won'`：所有卡牌消除完毕，游戏胜利
 */
export type GameStatus = 'idle' | 'playing' | 'paused' | 'won';

/**
 * 连接路径（用于动画展示）
 *
 * 当两张卡牌成功匹配时，记录连接路径的关键坐标点，
 * 用于在棋盘上绘制 SVG 连接线动画。
 *
 * @property {Position[]} points - 路径上的关键点数组，依次为起点、转弯点（0~2个）、终点
 */
export interface ConnectionPath {
  points: Position[];
}

/**
 * 游戏配置
 *
 * 定义一局游戏的基本参数，用于初始化棋盘。
 *
 * @property {number} rows - 棋盘的有效行数（不含外围边界）
 * @property {number} cols - 棋盘的有效列数（不含外围边界）
 * @property {string[]} icons - 可用的 emoji 图标集合，数量应不少于 (rows * cols) / 2
 */
export interface GameConfig {
  rows: number;
  cols: number;
  icons: string[];
}

/**
 * 游戏难度等级
 */
export type GameLevel = 'easy' | 'medium' | 'hard';

/**
 * 关卡配置
 *
 * 包含关卡显示信息和游戏配置
 *
 * @property {GameLevel} id - 关卡唯一标识
 * @property {string} name - 关卡名称
 * @property {string} description - 关卡描述
 * @property {string} icon - 关卡图标
 * @property {GameConfig} config - 游戏配置
 */
export interface LevelConfig {
  id: GameLevel;
  name: string;
  description: string;
  icon: string;
  config: GameConfig;
}

/**
 * 完整游戏状态
 *
 * 聚合了一局游戏的所有运行时状态数据，供 UI 层渲染和逻辑层处理使用。
 *
 * @property {(Card | null)[][]} board - 二维棋盘数组，null 表示空位（外围边界或已消除的位置）
 * @property {Card[]} selectedCards - 当前玩家选中的卡牌列表（最多 2 张）
 * @property {number} score - 当前游戏得分
 * @property {number} timeElapsed - 游戏已进行的时间（单位：秒）
 * @property {GameStatus} status - 当前游戏状态
 * @property {ConnectionPath | null} connectionPath - 当前正在显示的连接路径动画，无动画时为 null
 * @property {number} combo - 当前连续消除次数，用于计算连击加分
 * @property {number} hintsRemaining - 剩余可用的提示次数
 */
export interface GameState {
  board: (Card | null)[][];
  selectedCards: Card[];
  score: number;
  timeElapsed: number;
  status: GameStatus;
  connectionPath: ConnectionPath | null;
  combo: number;
  hintsRemaining: number;
}
