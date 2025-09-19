// 产品状态选项
export const PRODUCT_STATUS_OPTIONS = [
  { label: '上架', value: 'active', color: 'success' },
  { label: '下架', value: 'inactive', color: 'default' },
  { label: '草稿', value: 'draft', color: 'warning' },
] as const;

// 分页配置
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100'],
  SHOW_SIZE_CHANGER: true,
  SHOW_QUICK_JUMPER: true,
  SHOW_TOTAL: (total: number, range: [number, number]) =>
    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
} as const;

// 表格列配置
export const TABLE_COLUMNS_CONFIG = {
  SELECTION: {
    width: 50,
    fixed: 'left' as const,
  },
  DRAG_HANDLE: {
    width: 40,
  },
  IMAGE: {
    width: 80,
  },
  NAME: {
    width: 200,
    ellipsis: true,
  },
  PRICE: {
    width: 120,
    align: 'right' as const,
  },
  CATEGORY: {
    width: 120,
  },
  STATUS: {
    width: 100,
  },
  ACTIONS: {
    width: 200,
    fixed: 'right' as const,
  },
} as const;

// 虚拟滚动配置
export const VIRTUAL_SCROLL_CONFIG = {
  ITEM_HEIGHT: 60,
  CONTAINER_HEIGHT: 400,
  BUFFER_SIZE: 10,
  THRESHOLD: 100,
} as const;

// 拖拽配置
export const DRAG_DROP_CONFIG = {
  TYPE: 'PRODUCT_ROW',
  ANIMATION_DURATION: 200,
} as const;

// 验证码配置
export const CAPTCHA_CONFIG = {
  WIDTH: 120,
  HEIGHT: 40,
  LENGTH: 4,
  EXPIRY_TIME: 5 * 60 * 1000, // 5分钟
  MAX_ATTEMPTS: 10,
} as const;

// 文件上传配置
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILES_COUNT: 9,
} as const;

// 水印配置
export const WATERMARK_CONFIG = {
  POSITIONS: [
    { label: '左上', value: 'top-left' },
    { label: '上中', value: 'top-center' },
    { label: '右上', value: 'top-right' },
    { label: '左中', value: 'center-left' },
    { label: '居中', value: 'center' },
    { label: '右中', value: 'center-right' },
    { label: '左下', value: 'bottom-left' },
    { label: '下中', value: 'bottom-center' },
    { label: '右下', value: 'bottom-right' },
  ],
  DEFAULT_OPACITY: 0.5,
  DEFAULT_SIZE: 50,
  DEFAULT_COLOR: '#000000',
  DEFAULT_ROTATION: 0,
} as const;

// 二维码配置
export const QR_CODE_CONFIG = {
  DEFAULT_SIZE: 200,
  SIZE_OPTIONS: [100, 150, 200, 250, 300],
  ERROR_CORRECTION_LEVELS: [
    { label: 'L (7%)', value: 'L' },
    { label: 'M (15%)', value: 'M' },
    { label: 'Q (25%)', value: 'Q' },
    { label: 'H (30%)', value: 'H' },
  ],
  DEFAULT_MARGIN: 4,
  DEFAULT_FOREGROUND_COLOR: '#000000',
  DEFAULT_BACKGROUND_COLOR: '#FFFFFF',
} as const;

// 代码编辑器配置
export const CODE_EDITOR_CONFIG = {
  DEFAULT_LANGUAGE: 'html',
  SUPPORTED_LANGUAGES: [
    { label: 'HTML', value: 'html' },
    { label: 'CSS', value: 'css' },
    { label: 'JavaScript', value: 'javascript' },
    { label: 'JSON', value: 'json' },
    { label: 'Markdown', value: 'markdown' },
  ],
  DEFAULT_THEME: 'vs-dark',
  THEMES: [
    { label: '明亮', value: 'vs' },
    { label: '暗黑', value: 'vs-dark' },
    { label: '高对比度', value: 'hc-black' },
  ],
  DEFAULT_OPTIONS: {
    fontSize: 14,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on' as const,
  },
} as const;

// API 错误码
export const API_ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
} as const;

// 通知配置
export const NOTIFICATION_CONFIG = {
  DURATION: 4.5,
  PLACEMENT: 'topRight' as const,
  MAX_COUNT: 5,
} as const;

// 主题配置
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: '#1890ff',
    SUCCESS: '#52c41a',
    WARNING: '#faad14',
    ERROR: '#f5222d',
    INFO: '#1890ff',
  },
  BORDER_RADIUS: 6,
  BOX_SHADOW: '0 2px 8px rgba(0, 0, 0, 0.15)',
} as const;