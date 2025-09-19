import type { ThemeConfig } from 'antd';

// 亮色主题配置
export const lightTheme: ThemeConfig = {
  algorithm: 'defaultAlgorithm',
  token: {
    // 主色调
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#1890ff',
    
    // 中性色
    colorTextBase: '#000000',
    colorBgBase: '#ffffff',
    
    // 圆角
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    
    // 字体
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeXL: 20,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // 行高
    lineHeight: 1.5715,
    lineHeightLG: 1.5,
    lineHeightSM: 1.66,
    
    // 间距
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,
    
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,
    
    // 阴影
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    boxShadowSecondary: '0 6px 16px rgba(0, 0, 0, 0.08)',
    
    // 动画
    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
    
    // 控件高度
    controlHeight: 32,
    controlHeightSM: 24,
    controlHeightLG: 40,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerColor: '#000000',
      headerHeight: 64,
      siderBg: '#001529',
      triggerBg: '#002140',
      triggerColor: '#ffffff',
      footerBg: '#f0f2f5',
      footerPadding: '24px 50px',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#1890ff',
      darkItemHoverBg: '#1890ff',
      itemSelectedBg: '#e6f7ff',
      itemHoverBg: '#f5f5f5',
    },
    Button: {
      borderRadius: 6,
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 24,
    },
    Input: {
      borderRadius: 6,
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 24,
    },
    Card: {
      borderRadius: 8,
      headerBg: '#ffffff',
      headerHeight: 56,
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: '#000000',
      rowHoverBg: '#f5f5f5',
      borderColor: '#f0f0f0',
    },
    Modal: {
      borderRadius: 8,
      headerBg: '#ffffff',
      contentBg: '#ffffff',
    },
    Drawer: {
      borderRadius: 0,
      headerHeight: 56,
    },
    Notification: {
      borderRadius: 8,
    },
    Message: {
      borderRadius: 6,
    },
    Tooltip: {
      borderRadius: 6,
    },
    Popover: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 6,
      controlHeight: 32,
      optionSelectedBg: '#e6f7ff',
      optionActiveBg: '#f5f5f5',
    },
    DatePicker: {
      borderRadius: 6,
      controlHeight: 32,
    },
    Upload: {
      borderRadius: 6,
    },
    Progress: {
      remainingColor: '#f5f5f5',
    },
    Tag: {
      borderRadius: 4,
    },
    Badge: {
      borderRadius: 10,
    },
    Avatar: {
      borderRadius: 4,
    },
  },
};

// 暗色主题配置
export const darkTheme: ThemeConfig = {
  algorithm: 'darkAlgorithm',
  token: {
    ...lightTheme.token,
    colorTextBase: '#ffffff',
    colorBgBase: '#000000',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45)',
    boxShadowSecondary: '0 6px 16px rgba(0, 0, 0, 0.25)',
  },
  components: {
    ...lightTheme.components,
    Layout: {
      ...lightTheme.components?.Layout,
      headerBg: '#141414',
      headerColor: '#ffffff',
      siderBg: '#001529',
      footerBg: '#141414',
    },
    Card: {
      ...lightTheme.components?.Card,
      headerBg: '#1f1f1f',
    },
    Table: {
      ...lightTheme.components?.Table,
      headerBg: '#1f1f1f',
      headerColor: '#ffffff',
      rowHoverBg: '#262626',
      borderColor: '#303030',
    },
    Modal: {
      ...lightTheme.components?.Modal,
      headerBg: '#1f1f1f',
      contentBg: '#1f1f1f',
    },
    Select: {
      ...lightTheme.components?.Select,
      optionSelectedBg: '#111b26',
      optionActiveBg: '#262626',
    },
    Progress: {
      ...lightTheme.components?.Progress,
      remainingColor: '#262626',
    },
  },
};

// 紧凑主题配置
export const compactTheme: ThemeConfig = {
  ...lightTheme,
  token: {
    ...lightTheme.token,
    controlHeight: 28,
    controlHeightLG: 36,
    controlHeightSM: 20,
    padding: 12,
    paddingLG: 16,
    paddingSM: 8,
    margin: 12,
    marginLG: 16,
    marginSM: 8,
    fontSize: 13,
    fontSizeLG: 15,
    fontSizeSM: 11,
  },
  components: {
    ...lightTheme.components,
    Layout: {
      ...lightTheme.components?.Layout,
      headerHeight: 48,
      footerPadding: '16px 32px',
    },
    Card: {
      ...lightTheme.components?.Card,
      headerHeight: 40,
    },
    Button: {
      ...lightTheme.components?.Button,
      controlHeight: 28,
      controlHeightLG: 36,
      controlHeightSM: 20,
    },
    Input: {
      ...lightTheme.components?.Input,
      controlHeight: 28,
      controlHeightLG: 36,
      controlHeightSM: 20,
    },
    Select: {
      ...lightTheme.components?.Select,
      controlHeight: 28,
    },
    DatePicker: {
      ...lightTheme.components?.DatePicker,
      controlHeight: 28,
    },
  },
};

// 主题映射
export const themes = {
  light: lightTheme,
  dark: darkTheme,
  compact: compactTheme,
};

export type ThemeType = keyof typeof themes;

// 主题工具函数
export const getTheme = (themeType: ThemeType): ThemeConfig => {
  return themes[themeType] || lightTheme;
};

// CSS变量生成
export const generateCSSVariables = (theme: ThemeConfig) => {
  const { token } = theme;
  if (!token) return {};
  
  return {
    '--color-primary': token.colorPrimary,
    '--color-success': token.colorSuccess,
    '--color-warning': token.colorWarning,
    '--color-error': token.colorError,
    '--color-info': token.colorInfo,
    '--color-text-base': token.colorTextBase,
    '--color-bg-base': token.colorBgBase,
    '--border-radius': `${token.borderRadius}px`,
    '--font-size': `${token.fontSize}px`,
    '--line-height': token.lineHeight,
    '--padding': `${token.padding}px`,
    '--margin': `${token.margin}px`,
    '--box-shadow': token.boxShadow,
    '--control-height': `${token.controlHeight}px`,
  };
};

// 断点配置
export const breakpoints = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

// 媒体查询工具函数
export const mediaQuery = {
  xs: `@media (max-width: ${breakpoints.xs}px)`,
  sm: `@media (max-width: ${breakpoints.sm}px)`,
  md: `@media (max-width: ${breakpoints.md}px)`,
  lg: `@media (max-width: ${breakpoints.lg}px)`,
  xl: `@media (max-width: ${breakpoints.xl}px)`,
  xxl: `@media (max-width: ${breakpoints.xxl}px)`,
  
  // 最小宽度
  smUp: `@media (min-width: ${breakpoints.sm + 1}px)`,
  mdUp: `@media (min-width: ${breakpoints.md + 1}px)`,
  lgUp: `@media (min-width: ${breakpoints.lg + 1}px)`,
  xlUp: `@media (min-width: ${breakpoints.xl + 1}px)`,
  xxlUp: `@media (min-width: ${breakpoints.xxl + 1}px)`,
};

export default lightTheme;