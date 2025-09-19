import { Product, PaginationParams, SearchFilters, ApiResponse } from '../../types';

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock数据生成器
const generateMockProducts = (count: number): Product[] => {
  const categories = ['电子产品', '服装', '家居用品', '食品', '图书', '运动用品'];
  const statuses: Product['status'][] = ['active', 'inactive', 'draft'];
  const tags = ['热销', '新品', '促销', '精选', '推荐', '限时'];

  return Array.from({ length: count }, (_, index) => ({
    id: `product_${index + 1}`,
    name: `商品 ${index + 1}`,
    description: `这是商品 ${index + 1} 的详细描述，包含了产品的主要特性和优势。`,
    price: Math.floor(Math.random() * 1000) + 10,
    originalPrice: Math.floor(Math.random() * 1200) + 50,
    category: categories[Math.floor(Math.random() * categories.length)],
    tags: tags.slice(0, Math.floor(Math.random() * 3) + 1),
    images: [
      `https://picsum.photos/300/300?random=${index}`,
      `https://picsum.photos/300/300?random=${index + 1000}`,
    ],
    specifications: {
      brand: `品牌${index % 10 + 1}`,
      model: `型号${index}`,
      weight: `${Math.random() * 5 + 0.1}kg`,
      size: ['小', '中', '大'][Math.floor(Math.random() * 3)],
    },
    status: statuses[Math.floor(Math.random() * statuses.length)],
    stock: Math.floor(Math.random() * 1000),
    sku: `SKU${String(index + 1).padStart(6, '0')}`,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    sortOrder: index,
  }));
};

// 模拟数据存储
let mockProducts = generateMockProducts(100);

export const productAPI = {
  // 获取商品列表
  async getProducts(params: {
    pagination: PaginationParams;
    filters: SearchFilters;
  }): Promise<ApiResponse<{ products: Product[]; total: number }>> {
    await delay(500); // 模拟网络延迟

    let filteredProducts = [...mockProducts];

    // 应用筛选条件
    if (params.filters.keyword) {
      const keyword = params.filters.keyword.toLowerCase();
      filteredProducts = filteredProducts.filter(
        product =>
          product.name.toLowerCase().includes(keyword) ||
          product.description.toLowerCase().includes(keyword) ||
          product.sku.toLowerCase().includes(keyword)
      );
    }

    if (params.filters.category) {
      filteredProducts = filteredProducts.filter(
        product => product.category === params.filters.category
      );
    }

    if (params.filters.status) {
      filteredProducts = filteredProducts.filter(
        product => product.status === params.filters.status
      );
    }

    if (params.filters.priceRange) {
      const [min, max] = params.filters.priceRange;
      filteredProducts = filteredProducts.filter(
        product => product.price >= min && product.price <= max
      );
    }

    if (params.filters.tags?.length) {
      filteredProducts = filteredProducts.filter(product =>
        params.filters.tags!.some(tag => product.tags.includes(tag))
      );
    }

    // 排序
    filteredProducts.sort((a, b) => a.sortOrder - b.sortOrder);

    // 分页
    const { page, pageSize } = params.pagination;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const products = filteredProducts.slice(start, end);

    return {
      success: true,
      data: {
        products,
        total: filteredProducts.length,
      },
    };
  },

  // 创建商品
  async createProduct(
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Product>> {
    await delay(300);

    const newProduct: Product = {
      ...productData,
      id: `product_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockProducts.unshift(newProduct);

    return {
      success: true,
      data: newProduct,
    };
  },

  // 更新商品
  async updateProduct(
    id: string,
    data: Partial<Product>
  ): Promise<ApiResponse<Product>> {
    await delay(300);

    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('商品不存在');
    }

    mockProducts[index] = {
      ...mockProducts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: mockProducts[index],
    };
  },

  // 删除商品
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    await delay(200);

    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('商品不存在');
    }

    mockProducts.splice(index, 1);

    return {
      success: true,
      data: undefined,
    };
  },

  // 批量删除商品
  async batchDeleteProducts(ids: string[]): Promise<ApiResponse<void>> {
    await delay(400);

    mockProducts = mockProducts.filter(p => !ids.includes(p.id));

    return {
      success: true,
      data: undefined,
    };
  },

  // 重新排序商品
  async reorderProducts(productIds: string[]): Promise<ApiResponse<Product[]>> {
    await delay(300);

    // 更新排序
    productIds.forEach((id, index) => {
      const product = mockProducts.find(p => p.id === id);
      if (product) {
        product.sortOrder = index;
        product.updatedAt = new Date().toISOString();
      }
    });

    // 重新排序数组
    mockProducts.sort((a, b) => a.sortOrder - b.sortOrder);

    return {
      success: true,
      data: mockProducts.filter(p => productIds.includes(p.id)),
    };
  },

  // 获取商品详情
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    await delay(200);

    const product = mockProducts.find(p => p.id === id);
    if (!product) {
      throw new Error('商品不存在');
    }

    return {
      success: true,
      data: product,
    };
  },

  // 获取分类列表
  async getCategories(): Promise<ApiResponse<string[]>> {
    await delay(100);

    const categories = Array.from(new Set(mockProducts.map(p => p.category)));

    return {
      success: true,
      data: categories,
    };
  },

  // 获取标签列表
  async getTags(): Promise<ApiResponse<string[]>> {
    await delay(100);

    const allTags = mockProducts.flatMap(p => p.tags);
    const uniqueTags = Array.from(new Set(allTags));

    return {
      success: true,
      data: uniqueTags,
    };
  },
};