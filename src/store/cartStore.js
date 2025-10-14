/**
 * @fileoverview 购物车管理状态Store
 * @description 基于Zustand和persist中间件实现的购物车系统，支持本地存储持久化
 * @module store/cartStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 购物车管理Store
 * @description 提供购物车相关的状态管理和业务操作
 * 
 * 主要功能：
 * - 商品添加/移除/数量更新
 * - 购物车总价和总数量计算
 * - 购物车显示/隐藏控制
 * - 支持商品规格(variant)选择
 * - 数据localStorage持久化
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      /**
       * 购物车商品列表
       * @type {Array<Object>}
       * @description 购物车中的所有商品项
       * @property {string} productId - 商品ID
       * @property {number} quantity - 购买数量
       * @property {Object|null} selectedVariant - 选中的商品规格
       * @property {Date} addedAt - 添加到购物车的时间
       * @property {Object} product - 完整的商品信息对象
       */
      items: [],
      
      /**
       * 购物车显示状态
       * @type {boolean}
       * @default false
       * @description 购物车是否可见
       */
      isVisible: false,
      
      /**
       * 购物车总金额
       * @type {number}
       * @default 0
       * @description 所有商品的总价格
       */
      totalAmount: 0,
      
      /**
       * 购物车商品总数
       * @type {number}
       * @default 0
       * @description 所有商品的数量总和
       */
      totalItems: 0,

      /**
       * 添加商品到购物车
       * @param {Object} product - 商品对象
       * @param {number} [quantity=1] - 购买数量，默认1
       * @param {Object|null} [selectedVariant=null] - 选中的商品规格
       * @returns {void}
       * @description 如果商品已存在且规格相同，则增加数量；否则添加新项
       */
      addToCart: (product, quantity = 1, selectedVariant = null) => {
        const { items } = get();
        // 查找相同商品和规格的项
        const existingItemIndex = items.findIndex(item => 
          item.productId === product.id && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
        );

        let newItems;
        if (existingItemIndex > -1) {
          // 商品已存在，增加数量
          newItems = items.map((item, index) => 
            index === existingItemIndex 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // 添加新商品项
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
        get().calculateTotals(); // 重新计算总价和总数
      },

      /**
       * 从购物车移除商品
       * @param {string} productId - 商品ID
       * @param {Object|null} [selectedVariant=null] - 商品规格
       * @returns {void}
       * @description 根据商品ID和规格移除指定项
       */
      removeFromCart: (productId, selectedVariant = null) => {
        const { items } = get();
        const newItems = items.filter(item => 
          !(item.productId === productId && 
            JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant))
        );
        set({ items: newItems });
        get().calculateTotals();
      },

      /**
       * 更新商品数量
       * @param {string} productId - 商品ID
       * @param {number} quantity - 新数量
       * @param {Object|null} [selectedVariant=null] - 商品规格
       * @returns {void}
       * @description 更新指定商品的购买数量，如果数量<=0则移除该商品
       */
      updateQuantity: (productId, quantity, selectedVariant = null) => {
        const { items } = get();
        if (quantity <= 0) {
          // 数量不合法，直接移除该商品
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

      /**
       * 清空购物车
       * @returns {void}
       * @description 移除购物车中的所有商品，重置总价和总数
       */
      clearCart: () => {
        set({ items: [], totalAmount: 0, totalItems: 0 });
      },

      /**
       * 计算购物车总价和总数
       * @returns {void}
       * @description 遍历购物车项，计算总数量和总金额（考虑规格价格）
       */
      calculateTotals: () => {
        const { items } = get();
        // 计算商品总数量
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        // 计算总金额（优先使用规格价格）
        const totalAmount = items.reduce((sum, item) => {
          const price = item.selectedVariant?.price || item.product.price;
          return sum + (price * item.quantity);
        }, 0);
        set({ totalItems, totalAmount });
      },

      /**
       * 切换购物车显示状态
       * @returns {void}
       */
      toggleCartVisibility: () => {
        const { isVisible } = get();
        set({ isVisible: !isVisible });
      },

      /**
       * 显示购物车
       * @returns {void}
       */
      showCart: () => set({ isVisible: true }),
      
      /**
       * 隐藏购物车
       * @returns {void}
       */
      hideCart: () => set({ isVisible: false }),

      /**
       * 获取购物车中的指定商品项
       * @param {string} productId - 商品ID
       * @param {Object|null} [selectedVariant=null] - 商品规格
       * @returns {Object|undefined} 购物车项对象，未找到返回undefined
       */
      getCartItem: (productId, selectedVariant = null) => {
        const { items } = get();
        return items.find(item => 
          item.productId === productId && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
        );
      },

      /**
       * 获取指定商品在购物车中的数量
       * @param {string} productId - 商品ID
       * @param {Object|null} [selectedVariant=null] - 商品规格
       * @returns {number} 购买数量，不存在返回0
       */
      getCartItemCount: (productId, selectedVariant = null) => {
        const item = get().getCartItem(productId, selectedVariant);
        return item ? item.quantity : 0;
      }
    }),
    {
      name: 'shopping-cart', // localStorage中的键名
      getStorage: () => localStorage, // 使用localStorage进行数据持久化
    }
  )
);