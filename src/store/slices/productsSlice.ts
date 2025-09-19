import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, PaginationParams, SearchFilters } from '../../types';
import { productAPI } from '../../services/api/productAPI';

// 异步actions
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: { pagination: PaginationParams; filters: SearchFilters }) => {
    const response = await productAPI.getProducts(params);
    return response.data;
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await productAPI.createProduct(productData);
    return response.data;
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }: { id: string; data: Partial<Product> }) => {
    const response = await productAPI.updateProduct(id, data);
    return response.data;
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string) => {
    await productAPI.deleteProduct(id);
    return id;
  }
);

export const reorderProducts = createAsyncThunk(
  'products/reorderProducts',
  async (productIds: string[]) => {
    const response = await productAPI.reorderProducts(productIds);
    return response.data;
  }
);

interface ProductsState {
  list: Product[];
  pagination: PaginationParams;
  filters: SearchFilters;
  loading: boolean;
  error: string | null;
  selectedIds: string[];
}

const initialState: ProductsState = {
  list: [],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
  filters: {},
  loading: false,
  error: null,
  selectedIds: [],
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = action.payload;
      state.pagination.page = 1; // 重置到第一页
    },
    setPagination: (state, action: PayloadAction<Partial<PaginationParams>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSelectedIds: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // 本地更新商品排序（乐观更新）
    updateLocalOrder: (state, action: PayloadAction<string[]>) => {
      const newOrder = action.payload;
      state.list.sort((a, b) => {
        const aIndex = newOrder.indexOf(a.id);
        const bIndex = newOrder.indexOf(b.id);
        return aIndex - bIndex;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取商品列表
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.products;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取商品列表失败';
      })
      // 创建商品
      .addCase(createProduct.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.error = action.error.message || '创建商品失败';
      })
      // 更新商品
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.list.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.error.message || '更新商品失败';
      })
      // 删除商品
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.list = state.list.filter(p => p.id !== action.payload);
        state.pagination.total -= 1;
        state.selectedIds = state.selectedIds.filter(id => id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.error.message || '删除商品失败';
      })
      // 重新排序
      .addCase(reorderProducts.fulfilled, (state, action) => {
        // 服务器确认排序成功，更新商品的sortOrder
        action.payload.forEach((product: Product) => {
          const index = state.list.findIndex(p => p.id === product.id);
          if (index !== -1) {
            state.list[index].sortOrder = product.sortOrder;
          }
        });
      })
      .addCase(reorderProducts.rejected, (state, action) => {
        state.error = action.error.message || '更新排序失败';
        // 排序失败时，重新获取数据恢复状态
      });
  },
});

export const {
  setFilters,
  setPagination,
  setSelectedIds,
  clearError,
  updateLocalOrder,
} = productsSlice.actions;

export default productsSlice.reducer;