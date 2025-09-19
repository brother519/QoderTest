// 商品数据类型定义
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  tags: string[];
  images: string[];
  specifications: Record<string, any>;
  status: 'active' | 'inactive' | 'draft';
  stock: number;
  sku: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
}

// 分页参数类型
export interface PaginationParams {
  page: number;
  pageSize: number;
  total: number;
}

// 搜索和筛选参数类型
export interface SearchFilters {
  keyword?: string;
  category?: string;
  status?: string;
  priceRange?: [number, number];
  tags?: string[];
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

// 表格列配置类型
export interface TableColumn {
  key: string;
  title: string;
  width?: number;
  sortable?: boolean;
  render?: (value: any, record: Product) => React.ReactNode;
}

// 拖拽项目类型
export interface DragItem {
  id: string;
  index: number;
  type: string;
}

// 验证码类型
export interface CaptchaData {
  token: string;
  image: string;
  expiry: number;
}

// 水印配置类型
export interface WatermarkConfig {
  text?: string;
  image?: string;
  position: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right';
  opacity: number;
  size: number;
  color: string;
  rotation: number;
}

// 二维码配置类型
export interface QRCodeConfig {
  content: string;
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  foregroundColor: string;
  backgroundColor: string;
}

// 全局状态类型
export interface GlobalState {
  auth: {
    isAuthenticated: boolean;
    user: any;
    token: string;
  };
  products: {
    list: Product[];
    pagination: PaginationParams;
    filters: SearchFilters;
    loading: boolean;
    error: string | null;
  };
  ui: {
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark';
    loading: boolean;
    modals: {
      productForm: boolean;
      qrCode: boolean;
      preview: boolean;
    };
  };
}