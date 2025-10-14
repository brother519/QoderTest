/**
 * @fileoverview 数据类型定义
 * @description 定义项目中使用的所有数据类型和接口，提供TypeScript类型提示和校验
 * @module types
 */

/**
 * 商品规格数据模型
 * @typedef {Object} ProductVariant
 * @property {string} id - 规格ID
 * @property {string} name - 规格名称（如"128GB 铛原色"）
 * @property {number} price - 规格价格
 * @property {number} stock - 规格库存
 * @property {Record<string, any>} attributes - 规格属性（如颜色、容量等）
 */
export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, any>;
}

/**
 * 商品数据模型
 * @typedef {Object} Product
 * @property {string} id - 商品唯一标识
 * @property {string} name - 商品名称
 * @property {string} description - 商品描述
 * @property {number} price - 商品基础价格
 * @property {string[]} images - 商品图片URL数组
 * @property {string} category - 商品分类
 * @property {number} stock - 库存数量
 * @property {number} rating - 商品评分 (1-5)
 * @property {string[]} tags - 商品标签数组
 * @property {ProductVariant[]} [variants] - 商品规格数组（可选）
 */
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

/**
 * 购物车项数据模型
 * @typedef {Object} CartItem
 * @property {string} productId - 商品ID
 * @property {number} quantity - 购买数量
 * @property {ProductVariant} [selectedVariant] - 选中的商品规格（可选）
 * @property {Date} addedAt - 添加到购物车的时间
 */
export interface CartItem {
  productId: string;
  quantity: number;
  selectedVariant?: ProductVariant;
  addedAt: Date;
}

/**
 * 用户地址数据模型
 * @typedef {Object} Address
 * @property {string} id - 地址ID
 * @property {string} recipientName - 收件人姓名
 * @property {string} phoneNumber - 联系电话
 * @property {string} province - 省份
 * @property {string} city - 城市
 * @property {string} district - 区/县
 * @property {string} detailAddress - 详细地址
 * @property {string} postalCode - 邮编
 * @property {boolean} isDefault - 是否为默认地址
 */
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

/**
 * 评论数据模型
 * @typedef {Object} Comment
 * @property {string} id - 评论ID
 * @property {string} userId - 用户ID
 * @property {string} productId - 商品ID
 * @property {number} rating - 评分 (1-5)
 * @property {string} content - 评论内容
 * @property {string[]} images - 评论图片URL数组
 * @property {Date} createdAt - 创建时间
 * @property {number} likesCount - 点赞数
 * @property {Object} userInfo - 评论用户信息
 * @property {string} userInfo.username - 用户名
 * @property {string} userInfo.avatar - 用户头像
 */
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

/**
 * 用户数据模型
 * @typedef {Object} User
 * @property {string} id - 用户ID
 * @property {string} username - 用户名
 * @property {string} email - 电子邮箱
 * @property {string} avatar - 用户头像URL
 * @property {string} memberLevel - 会员等级（如"VIP"、"普通会员"）
 * @property {string} profile - 用户简介
 * @property {boolean} isLoggedIn - 是否已登录
 */
export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  memberLevel: string;
  profile: string;
  isLoggedIn: boolean;
}

/**
 * 支付方式数据模型
 * @typedef {Object} PaymentMethod
 * @property {string} id - 支付方式ID
 * @property {string} name - 支付方式名称
 * @property {'credit_card'|'debit_card'|'alipay'|'wechat'|'wallet'|'bank_transfer'} type - 支付方式类型
 * @property {string} icon - 图标
 * @property {boolean} isAvailable - 是否可用
 */
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'alipay' | 'wechat' | 'wallet' | 'bank_transfer';
  icon: string;
  isAvailable: boolean;
}

/**
 * 订单数据模型
 * @typedef {Object} Order
 * @property {string} id - 订单ID
 * @property {string} userId - 用户ID
 * @property {CartItem[]} items - 订单商品项数组
 * @property {number} totalAmount - 订单总金额
 * @property {Address} shippingAddress - 配送地址
 * @property {PaymentMethod} paymentMethod - 支付方式
 * @property {'pending'|'paid'|'shipped'|'delivered'|'cancelled'} status - 订单状态
 * @property {Date} createdAt - 订单创建时间
 */
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

/**
 * 搜索筛选器数据模型
 * @typedef {Object} SearchFilters
 * @property {string} [category] - 商品分类
 * @property {[number, number]} [priceRange] - 价格范围 [min, max]
 * @property {number} [rating] - 最低评分
 * @property {string} [brand] - 品牌
 * @property {boolean} [inStock] - 是否只显示有货商品
 */
export interface SearchFilters {
  category?: string;
  priceRange?: [number, number];
  rating?: number;
  brand?: string;
  inStock?: boolean;
}

/**
 * 搜索结果数据模型
 * @typedef {Object} SearchResult
 * @property {Product[]} products - 搜索到的商品数组
 * @property {number} total - 搜索结果总数
 * @property {number} currentPage - 当前页码
 * @property {number} totalPages - 总页数
 * @property {SearchFilters} filters - 当前筛选条件
 * @property {string} sortBy - 当前排序方式
 */
export interface SearchResult {
  products: Product[];
  total: number;
  currentPage: number;
  totalPages: number;
  filters: SearchFilters;
  sortBy: string;
}