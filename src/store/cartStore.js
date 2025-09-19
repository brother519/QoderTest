import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 购物车状态管理
export const useCartStore = create(
  persist(
    (set, get) => ({
      // 状态
      items: [],
      isVisible: false,
      totalAmount: 0,
      totalItems: 0,

      // 动作
      addToCart: (product, quantity = 1, selectedVariant = null) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(item => 
          item.productId === product.id && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
        );

        let newItems;
        if (existingItemIndex > -1) {
          // 如果商品已存在，增加数量
          newItems = items.map((item, index) => 
            index === existingItemIndex 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // 添加新商品
          const newItem = {
            productId: product.id,
            quantity,
            selectedVariant,
            addedAt: new Date(),
            product: product // 存储完整商品信息以便显示
          };
          newItems = [...items, newItem];
        }

        set({ items: newItems });
        get().calculateTotals();
      },

      removeFromCart: (productId, selectedVariant = null) => {
        const { items } = get();
        const newItems = items.filter(item => 
          !(item.productId === productId && 
            JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant))
        );
        set({ items: newItems });
        get().calculateTotals();
      },

      updateQuantity: (productId, quantity, selectedVariant = null) => {
        const { items } = get();
        if (quantity <= 0) {
          get().removeFromCart(productId, selectedVariant);
          return;
        }

        const newItems = items.map(item => 
          item.productId === productId && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
            ? { ...item, quantity }
            : item
        );
        set({ items: newItems });
        get().calculateTotals();
      },

      clearCart: () => {
        set({ items: [], totalAmount: 0, totalItems: 0 });
      },

      calculateTotals: () => {
        const { items } = get();
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = items.reduce((sum, item) => {
          const price = item.selectedVariant?.price || item.product.price;
          return sum + (price * item.quantity);
        }, 0);
        set({ totalItems, totalAmount });
      },

      toggleCartVisibility: () => {
        const { isVisible } = get();
        set({ isVisible: !isVisible });
      },

      showCart: () => set({ isVisible: true }),
      hideCart: () => set({ isVisible: false }),

      getCartItem: (productId, selectedVariant = null) => {
        const { items } = get();
        return items.find(item => 
          item.productId === productId && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
        );
      },

      getCartItemCount: (productId, selectedVariant = null) => {
        const item = get().getCartItem(productId, selectedVariant);
        return item ? item.quantity : 0;
      }
    }),
    {
      name: 'shopping-cart', // 本地存储的key
      getStorage: () => localStorage, // 使用localStorage
    }
  )
);