// Mock商品数据
export const mockProducts = [
  {
    id: 'prod-001',
    name: 'iPhone 15 Pro',
    description: '采用钛金属设计的专业级智能手机，搭载A17 Pro芯片，支持专业摄影和游戏。',
    price: 8999,
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
      'https://images.unsplash.com/photo-1512499617640-c2f999943c84?w=500'
    ],
    category: '手机数码',
    stock: 150,
    rating: 4.8,
    tags: ['新品', '热销', '5G'],
    variants: [
      { id: 'var-001', name: '128GB 钛原色', price: 8999, stock: 50, attributes: { storage: '128GB', color: '钛原色' } },
      { id: 'var-002', name: '256GB 钛原色', price: 9999, stock: 40, attributes: { storage: '256GB', color: '钛原色' } },
      { id: 'var-003', name: '512GB 钛蓝色', price: 11999, stock: 30, attributes: { storage: '512GB', color: '钛蓝色' } }
    ]
  },
  {
    id: 'prod-002',
    name: 'MacBook Pro 14英寸',
    description: '搭载M3芯片的专业笔记本电脑，为创意工作者量身打造。',
    price: 14999,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'
    ],
    category: '电脑办公',
    stock: 75,
    rating: 4.9,
    tags: ['专业', '高性能'],
    variants: [
      { id: 'var-004', name: '8GB+512GB 深空灰色', price: 14999, stock: 25, attributes: { ram: '8GB', storage: '512GB', color: '深空灰色' } },
      { id: 'var-005', name: '16GB+1TB 银色', price: 18999, stock: 20, attributes: { ram: '16GB', storage: '1TB', color: '银色' } }
    ]
  },
  {
    id: 'prod-003',
    name: 'Nike Air Max 270',
    description: '经典运动鞋，舒适透气，适合日常穿着和运动。',
    price: 1299,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500'
    ],
    category: '运动户外',
    stock: 200,
    rating: 4.6,
    tags: ['舒适', '透气'],
    variants: [
      { id: 'var-006', name: '42码 黑白', price: 1299, stock: 50, attributes: { size: '42', color: '黑白' } },
      { id: 'var-007', name: '43码 蓝白', price: 1299, stock: 45, attributes: { size: '43', color: '蓝白' } },
      { id: 'var-008', name: '44码 红白', price: 1299, stock: 40, attributes: { size: '44', color: '红白' } }
    ]
  },
  {
    id: 'prod-004',
    name: '小米空气净化器4',
    description: '高效过滤PM2.5，智能家居必备，支持App远程控制。',
    price: 999,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'
    ],
    category: '家用电器',
    stock: 120,
    rating: 4.7,
    tags: ['智能', '健康'],
    variants: []
  },
  {
    id: 'prod-005',
    name: '索尼WH-1000XM5头戴式耳机',
    description: '业界领先的降噪技术，30小时续航，支持无线充电。',
    price: 2399,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500'
    ],
    category: '数码配件',
    stock: 85,
    rating: 4.8,
    tags: ['降噪', '高音质'],
    variants: [
      { id: 'var-009', name: '黑色', price: 2399, stock: 45, attributes: { color: '黑色' } },
      { id: 'var-010', name: '银色', price: 2399, stock: 40, attributes: { color: '银色' } }
    ]
  }
];

// Mock评论数据
export const mockComments = [
  {
    id: 'comment-001',
    userId: 'user-001',
    productId: 'prod-001',
    rating: 5,
    content: '手机很棒，拍照效果非常出色，钛金属材质手感很好！',
    images: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300'],
    createdAt: new Date('2024-01-15'),
    likesCount: 12,
    userInfo: {
      username: '数码爱好者',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
    }
  },
  {
    id: 'comment-002',
    userId: 'user-002',
    productId: 'prod-001',
    rating: 4,
    content: '性能很强，就是价格有点贵，不过物有所值。',
    images: [],
    createdAt: new Date('2024-01-10'),
    likesCount: 8,
    userInfo: {
      username: '手机发烧友',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100'
    }
  },
  {
    id: 'comment-003',
    userId: 'user-003',
    productId: 'prod-002',
    rating: 5,
    content: 'M3芯片性能真的很强，视频剪辑丝滑流畅，散热控制也很好。',
    images: [],
    createdAt: new Date('2024-01-12'),
    likesCount: 15,
    userInfo: {
      username: '视频创作者',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'
    }
  }
];

// Mock用户数据
export const mockUser = {
  id: 'user-001',
  username: '张三',
  email: 'zhangsan@example.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
  memberLevel: 'VIP',
  profile: '资深数码爱好者，喜欢尝试最新的科技产品。',
  isLoggedIn: true
};

// Mock地址数据
export const mockAddresses = [
  {
    id: 'addr-001',
    recipientName: '张三',
    phoneNumber: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detailAddress: '建国路1号院2号楼3单元101',
    postalCode: '100025',
    isDefault: true
  },
  {
    id: 'addr-002',
    recipientName: '李四',
    phoneNumber: '13900139000',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detailAddress: '陆家嘴金融中心写字楼A座1201',
    postalCode: '200120',
    isDefault: false
  }
];

// Mock支付方式数据
export const mockPaymentMethods = [
  {
    id: 'pay-001',
    name: '支付宝',
    type: 'alipay',
    icon: '💰',
    isAvailable: true
  },
  {
    id: 'pay-002',
    name: '微信支付',
    type: 'wechat',
    icon: '💚',
    isAvailable: true
  },
  {
    id: 'pay-003',
    name: '信用卡',
    type: 'credit_card',
    icon: '💳',
    isAvailable: true
  },
  {
    id: 'pay-004',
    name: '银行转账',
    type: 'bank_transfer',
    icon: '🏦',
    isAvailable: true
  }
];