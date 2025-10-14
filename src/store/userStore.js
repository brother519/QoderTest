/**
 * @fileoverview 用户管理状态Store
 * @description 基于Zustand和persist中间件实现的用户系统，支持用户信息持久化存储
 * @module store/userStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockUser } from '../data/mockData.js';

/**
 * 用户管理Store
 * @description 提供用户相关的状态管理和业务操作
 * 
 * 主要功能：
 * - 用户登录/登出
 * - 用户信息管理
 * - 用户偏好设置（语言、货币、主题、通知）
 * - 快捷操作菜单
 * - 权限验证和统计信息
 */
export const useUserStore = create(
  persist(
    (set, get) => ({
      /**
       * 当前登录用户信息
       * @type {Object|null}
       * @description 存储当前登录用户的完整信息，null表示未登录
       */
      user: null,
      
      /**
       * 登录状态
       * @type {boolean}
       * @default false
       * @description 用户是否已登录
       */
      isLoggedIn: false,
      
      /**
       * 用户偏好设置
       * @type {Object}
       * @property {string} language - 界面语言，默认'zh-CN'
       * @property {string} currency - 货币单位，默认'CNY'
       * @property {string} theme - 主题模式：'light'或'dark'
       * @property {boolean} notifications - 是否开启通知
       */
      preferences: {
        language: 'zh-CN',
        currency: 'CNY',
        theme: 'light',
        notifications: true
      },
      
      /**
       * 快捷操作菜单项
       * @type {Array<Object>}
       * @property {string} id - 菜单项ID
       * @property {string} name - 显示名称
       * @property {string} icon - 图标
       * @property {string} path - 跳转路径
       */
      quickActions: [
        { id: 'profile', name: '个人资料', icon: '👤', path: '/profile' },
        { id: 'orders', name: '我的订单', icon: '📦', path: '/orders' },
        { id: 'favorites', name: '收藏夹', icon: '❤️', path: '/favorites' },
        { id: 'addresses', name: '地址管理', icon: '📍', path: '/addresses' },
        { id: 'settings', name: '账户设置', icon: '⚙️', path: '/settings' }
      ],

      /**
       * 用户登录
       * @async
       * @param {Object} credentials - 登录凭证
       * @param {string} credentials.username - 用户名
       * @param {string} credentials.password - 密码
       * @returns {Promise<Object>} 登录结果对象
       * @returns {boolean} return.success - 登录是否成功
       * @returns {string} [return.error] - 错误信息（失败时）
       * @description 模拟用户登录，成功后设置用户信息和登录状态
       */
      login: async (credentials) => {
        try {
          // 模拟登录API调用，延迟1秒
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

      /**
       * 用户登出
       * @returns {void}
       * @description 清除用户信息和登录状态
       */
      logout: () => {
        set({ 
          user: null, 
          isLoggedIn: false 
        });
      },

      /**
       * 更新用户资料
       * @param {Object} profileData - 要更新的用户信息字段
       * @returns {void}
       * @description 部分更新用户信息，仅当用户已登录时有效
       */
      updateProfile: (profileData) => {
        const { user } = get();
        if (user) {
          set({ 
            user: { ...user, ...profileData } 
          });
        }
      },

      /**
       * 更新用户偏好设置
       * @param {Object} newPreferences - 要更新的偏好设置字段
       * @returns {void}
       * @description 部分更新用户偏好设置
       */
      updatePreferences: (newPreferences) => {
        const { preferences } = get();
        set({ 
          preferences: { ...preferences, ...newPreferences } 
        });
      },

      /**
       * 自动登录
       * @returns {void}
       * @description 检查localStorage中是否有存储的用户信息，有则自动登录
       */
      autoLogin: () => {
        const { user } = get();
        if (user && user.id) {
          set({ isLoggedIn: true });
        }
      },

      /**
       * 检查用户权限
       * @param {string} permission - 权限名称
       * @returns {boolean} 是否拥有该权限
       * @description 根据用户角色和等级判断是否拥有指定权限
       */
      hasPermission: (permission) => {
        const { user, isLoggedIn } = get();
        if (!isLoggedIn || !user) return false;
        
        // 根据用户角色和权限进行判断
        // 示例：VIP用户拥有更多权限
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

      /**
       * 获取用户统计信息
       * @returns {Object|null} 用户统计数据对象
       * @returns {number} return.totalOrders - 总订单数
       * @returns {number} return.totalSpent - 总消费金额
       * @returns {string} return.memberSince - 成为会员的日期
       * @returns {number} return.loyaltyPoints - 积分
       * @description 返回用户的统计信息，未登录返回null
       */
      getUserStats: () => {
        const { user } = get();
        if (!user) return null;
        
        // 返回用户的统计信息
        return {
          totalOrders: 12,
          totalSpent: 25680,
          memberSince: '2023-06-15',
          loyaltyPoints: 1200
        };
      }
    }),
    {
      name: 'user-storage', // localStorage中的键名
      getStorage: () => localStorage, // 使用localStorage存储用户信息
    }
  )
);