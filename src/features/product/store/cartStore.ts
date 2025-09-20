import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CartItem, Product, ProductVariant } from '@/shared/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  loading: boolean;
}

interface CartActions {
  // 购物车操作
  addToCart: (product: Product, quantity: number, variant?: ProductVariant) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  
  // UI状态
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  
  // 计算方法
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getCartItemCount: (productId: string, variant?: ProductVariant) => number;
}

type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        items: [],
        isOpen: false,
        loading: false,

        // 购物车操作
        addToCart: (product, quantity, variant) => {
          const { items } = get();
          const existingItemIndex = items.findIndex(
            item => item.productId === product.id && 
                   item.selectedVariant?.id === variant?.id
          );

          if (existingItemIndex >= 0) {
            // 更新现有商品数量
            const updatedItems = [...items];
            updatedItems[existingItemIndex].quantity += quantity;
            set({ items: updatedItems });
          } else {
            // 添加新商品
            const newItem: CartItem = {
              productId: product.id,
              quantity,
              selectedVariant: variant,
              addedAt: new Date()
            };
            set({ items: [...items, newItem] });
          }
        },

        removeFromCart: (productId, variantId) => {
          const { items } = get();
          const updatedItems = items.filter(
            item => !(item.productId === productId && 
                     item.selectedVariant?.id === variantId)
          );
          set({ items: updatedItems });
        },

        updateQuantity: (productId, quantity, variantId) => {
          const { items } = get();
          if (quantity <= 0) {
            get().removeFromCart(productId, variantId);
            return;
          }

          const updatedItems = items.map(item => {
            if (item.productId === productId && 
                item.selectedVariant?.id === variantId) {
              return { ...item, quantity };
            }
            return item;
          });
          set({ items: updatedItems });
        },

        clearCart: () => set({ items: [] }),

        // UI状态管理
        toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
        setCartOpen: (open) => set({ isOpen: open }),

        // 计算方法
        getTotalItems: () => {
          const { items } = get();
          return items.reduce((total, item) => total + item.quantity, 0);
        },

        getTotalPrice: () => {
          const { items } = get();
          // 这里需要从产品store获取价格信息
          // 暂时返回0，实际实现中需要结合产品数据
          return 0;
        },

        getCartItemCount: (productId, variant) => {
          const { items } = get();
          const item = items.find(
            item => item.productId === productId && 
                   item.selectedVariant?.id === variant?.id
          );
          return item?.quantity || 0;
        }
      }),
      {
        name: 'cart-storage',
        partialize: (state) => ({ items: state.items }),
      }
    ),
    {
      name: 'cart-store',
    }
  )
);