import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockUser } from '../data/mockData.js';

// 用户状态管理
export const useUserStore = create(
  persist(
    (set, get) => ({
      // 状态
      user: null,
      isLoggedIn: false,
      preferences: {
        language: 'zh-CN',
        currency: 'CNY',
        theme: 'light',
        notifications: true
      },
      quickActions: [
        { id: 'profile', name: '个人资料', icon: '👤', path: '/profile' },
        { id: 'orders', name: '我的订单', icon: '📦', path: '/orders' },
        { id: 'favorites', name: '收藏夹', icon: '❤️', path: '/favorites' },
        { id: 'addresses', name: '地址管理', icon: '📍', path: '/addresses' },
        { id: 'settings', name: '账户设置', icon: '⚙️', path: '/settings' }
      ],

      // 动作
      login: async (credentials) => {
        try {
          // 模拟登录API调用
          setTimeout(() => {
            set({ 
              user: mockUser, 
              isLoggedIn: true 
            });
          }, 1000);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isLoggedIn: false 
        });
      },

      updateProfile: (profileData) => {
        const { user } = get();
        if (user) {
          set({ 
            user: { ...user, ...profileData } 
          });
        }
      },

      updatePreferences: (newPreferences) => {
        const { preferences } = get();
        set({ 
          preferences: { ...preferences, ...newPreferences } 
        });
      },

      // 自动登录（如果有存储的用户信息）
      autoLogin: () => {
        const { user } = get();
        if (user && user.id) {
          set({ isLoggedIn: true });
        }
      },

      // 检查用户权限
      hasPermission: (permission) => {
        const { user, isLoggedIn } = get();
        if (!isLoggedIn || !user) return false;
        
        // 这里可以根据用户角色和权限进行判断
        // 简单示例：VIP用户有更多权限
        switch (permission) {
          case 'viewOrders':
            return true;
          case 'manageAddresses':
            return true;
          case 'accessVipFeatures':
            return user.memberLevel === 'VIP';
          default:
            return false;
        }
      },

      // 获取用户统计信息
      getUserStats: () => {
        const { user } = get();
        if (!user) return null;
        
        // 这里可以返回用户的统计信息
        return {
          totalOrders: 12,
          totalSpent: 25680,
          memberSince: '2023-06-15',
          loyaltyPoints: 1200
        };
      }
    }),
    {
      name: 'user-storage',
      getStorage: () => localStorage,
    }
  )
);