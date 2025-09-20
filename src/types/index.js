// 商品数据模型
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  tags: string[];
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, any>;
}

// 购物车项数据模型
export interface CartItem {
  productId: string;
  quantity: number;
  selectedVariant?: ProductVariant;
  addedAt: Date;
}

// 用户地址数据模型
export interface Address {
  id: string;
  recipientName: string;
  phoneNumber: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  postalCode: string;
  isDefault: boolean;
}

// 评论数据模型
export interface Comment {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  content: string;
  images: string[];
  createdAt: Date;
  likesCount: number;
  userInfo: {
    username: string;
    avatar: string;
  };
}

// 用户数据模型
export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  memberLevel: string;
  profile: string;
  isLoggedIn: boolean;
}

// 支付方式数据模型
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'alipay' | 'wechat' | 'wallet' | 'bank_transfer';
  icon: string;
  isAvailable: boolean;
}

// 订单数据模型
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

// 搜索筛选器数据模型
export interface SearchFilters {
  category?: string;
  priceRange?: [number, number];
  rating?: number;
  brand?: string;
  inStock?: boolean;
}

// 搜索结果数据模型
export interface SearchResult {
  products: Product[];
  total: number;
  currentPage: number;
  totalPages: number;
  filters: SearchFilters;
  sortBy: string;
}

// 任务优先级枚举
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// 任务状态枚举
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// 任务数据模型
export interface Task {
  /** 任务唯一标识符，使用 UUID 格式 */
  id: string;
  /** 任务标题，长度限制为 1-100 字符 */
  title: string;
  /** 任务详细描述，支持富文本格式 */
  description: string;
  /** 任务负责人，可以是用户名或用户ID */
  assignee: string;
  /** 任务优先级，影响任务排序和显示样式 */
  priority: TaskPriority;
  /** 任务当前状态，决定任务的生命周期流转 */
  status: TaskStatus;
  /** 任务截止日期，null 表示无截止日期 */
  dueDate: Date | null;
  /** 任务标签数组，用于分类和筛选 */
  tags: string[];
  /** 任务创建时间，自动设置为当前时间 */
  createdAt: Date;
  /** 任务最后更新时间，每次修改时自动更新 */
  updatedAt: Date;
}

// 创建任务时的输入数据模型
export interface CreateTaskInput {
  /** 任务标题 */
  title: string;
  /** 任务描述 */
  description: string;
  /** 任务负责人 */
  assignee: string;
  /** 任务优先级，默认为 'medium' */
  priority?: TaskPriority;
  /** 任务截止日期，可选 */
  dueDate?: Date | null;
  /** 任务标签，默认为空数组 */
  tags?: string[];
}

// 更新任务时的输入数据模型
export interface UpdateTaskInput {
  /** 要更新的任务ID */
  id: string;
  /** 任务标题 */
  title?: string;
  /** 任务描述 */
  description?: string;
  /** 任务负责人 */
  assignee?: string;
  /** 任务优先级 */
  priority?: TaskPriority;
  /** 任务状态 */
  status?: TaskStatus;
  /** 任务截止日期 */
  dueDate?: Date | null;
  /** 任务标签 */
  tags?: string[];
}