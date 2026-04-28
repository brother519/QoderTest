/**
 * 游戏注册表类型定义
 *
 * 定义游戏元数据接口，所有游戏必须提供这些信息以在首页展示。
 * 添加新游戏只需在 registry 中新增一个条目。
 *
 * @module lib/types/registry
 */

/** 单个游戏的元数据 */
export interface GameMeta {
  /** 游戏唯一标识，与路由路径对应 (如 'snake' 对应 /snake) */
  id: string;
  /** 游戏名称 */
  name: string;
  /** 游戏描述 */
  description: string;
  /** 展示图标 (emoji) */
  icon: string;
  /** 标签 */
  tags: string[];
  /** 卡片主题色（Tailwind 渐变 class） */
  gradient: string;
  /** 图标背景色 */
  iconBg: string;
  /** 悬停光晕色 */
  glowColor: string;
}
