// 产品相关类型定义
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

// 购物车相关类型
export interface CartItem {
  productId: string;
  quantity: number;
  selectedVariant?: ProductVariant;
  addedAt: Date;
}

// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  memberLevel: string;
  profile: string;
  isLoggedIn: boolean;
}

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

// 评论相关类型
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

// 支付相关类型
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'alipay' | 'wechat' | 'wallet' | 'bank_transfer';
  icon: string;
  isAvailable: boolean;
}

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

// 搜索和筛选相关类型
export interface SearchFilters {
  category?: string;
  priceRange?: [number, number];
  rating?: number;
  brand?: string;
  inStock?: boolean;
}

export interface SearchResult {
  products: Product[];
  total: number;
  currentPage: number;
  totalPages: number;
  filters: SearchFilters;
  sortBy: string;
}