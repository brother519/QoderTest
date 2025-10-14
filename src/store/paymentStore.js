/**
 * @fileoverview 支付管理状态Store
 * @description 基于Zustand实现的支付系统状态管理，支持多种支付方式和支付流程管理
 * @module store/paymentStore
 */

import { create } from 'zustand';
import { mockPaymentMethods } from '../data/mockData.js';

/**
 * 支付管理Store
 * @description 提供支付相关的状态管理和业务操作
 * 
 * 主要功能：
 * - 支付方式管理（支付宝、微信、银行卡等）
 * - 支付流程处理
 * - 支付数据验证
 * - 支付历史记录
 * - 金额格式化和支付方式图标
 */
export const usePaymentStore = create((set, get) => ({
  /**
   * 支付方式列表
   * @type {Array<Object>}
   * @description 可用的支付方式数组
   */
  paymentMethods: [],
  
  /**
   * 当前选中的支付方式
   * @type {Object|null}
   */
  selectedMethod: null,
  
  /**
   * 订单金额
   * @type {number}
   * @default 0
   */
  orderAmount: 0,
  
  /**
   * 订单信息
   * @type {Object|null}
   */
  orderInfo: null,
  
  /**
   * 支付状态
   * @type {string}
   * @default 'idle'
   * @description 支付处理状态：'idle'(空闲)、'processing'(处理中)、'success'(成功)、'failed'(失败)
   */
  paymentStatus: 'idle',
  
  /**
   * 加载状态
   * @type {boolean}
   * @default false
   */
  loading: false,
  
  /**
   * 错误信息
   * @type {string|null}
   */
  error: null,
  
  /**
   * 安全验证码
   * @type {string}
   */
  securityCode: '',
  
  /**
   * 支付历史记录
   * @type {Array<Object>}
   */
  paymentHistory: [],

  /**
   * 加载支付方式列表
   * @async
   * @returns {Promise<void>}
   */
  loadPaymentMethods: async () => {
    set({ loading: true, error: null });
    try {
      // 模拟API调用，延迟300ms
      setTimeout(() => {
        set({ 
          paymentMethods: mockPaymentMethods,
          loading: false 
        });
      }, 300);
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  /**
   * 选择支付方式
   * @param {Object} method - 支付方式对象
   * @returns {void}
   */
  selectPaymentMethod: (method) => {
    set({ selectedMethod: method });
  },

  /**
   * 设置订单金额
   * @param {number} amount - 订单金额
   * @returns {void}
   */
  setOrderAmount: (amount) => {
    set({ orderAmount: amount });
  },

  /**
   * 设置订单信息
   * @param {Object} orderInfo - 订单信息对象
   * @returns {void}
   */
  setOrderInfo: (orderInfo) => {
    set({ orderInfo });
  },

  /**
   * 处理支付流程
   * @async
   * @param {Object} paymentData - 支付数据
   * @returns {Promise<Object>} 支付结果
   * @returns {boolean} return.success - 支付是否成功
   * @returns {string} [return.error] - 错误信息（失败时）
   * @returns {string} [return.transactionId] - 交易ID（成功时）
   * @description 执行完整的支付流程，包括验证、处理和记录
   */
  processPayment: async (paymentData) => {
    const { selectedMethod, orderAmount, orderInfo } = get();
    
    if (!selectedMethod) {
      set({ error: '请选择支付方式' });
      return { success: false, error: '请选择支付方式' };
    }

    if (!orderAmount || orderAmount <= 0) {
      set({ error: '订单金额无效' });
      return { success: false, error: '订单金额无效' };
    }

    set({ 
      paymentStatus: 'processing', 
      loading: true, 
      error: null 
    });

    try {
      // 模拟支付处理
      const result = await get().simulatePaymentProcess(paymentData);
      
      if (result.success) {
        // 支付成功
        set({ 
          paymentStatus: 'success',
          loading: false 
        });
        
        // 添加到支付历史
        get().addToPaymentHistory({
          id: `payment-${Date.now()}`,
          orderId: orderInfo?.id || `order-${Date.now()}`,
          amount: orderAmount,
          method: selectedMethod,
          status: 'completed',
          timestamp: new Date(),
          transactionId: result.transactionId
        });
      } else {
        // 支付失败
        set({ 
          paymentStatus: 'failed',
          loading: false,
          error: result.error 
        });
      }

      return result;
    } catch (error) {
      set({ 
        paymentStatus: 'failed',
        loading: false,
        error: error.message 
      });
      return { success: false, error: error.message };
    }
  },

  /**
   * 模拟支付处理过程
   * @async
   * @param {Object} paymentData - 支付数据
   * @returns {Promise<Object>} 支付结果
   * @description 模拟实际支付处理，90%成功率，2秒延迟
   */
  simulatePaymentProcess: async (paymentData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟90%成功率
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
          resolve({
            success: true,
            transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            message: '支付成功'
          });
        } else {
          resolve({
            success: false,
            error: '支付失败，请重试',
            errorCode: 'PAYMENT_FAILED'
          });
        }
      }, 2000); // 模拟2秒处理时间
    });
  },

  /**
   * 验证支付数据合法性
   * @param {Object} paymentData - 待验证的支付数据
   * @returns {Object} 验证结果
   * @returns {boolean} return.isValid - 是否验证通过
   * @returns {Object} return.errors - 错误信息对象
   * @description 根据支付方式验证对应的支付数据字段
   */
  validatePaymentData: (paymentData) => {
    const { selectedMethod } = get();
    const errors = {};

    if (!selectedMethod) {
      errors.method = '请选择支付方式';
    }

    // 根据不同支付方式进行相应的数据验证
    switch (selectedMethod?.type) {
      case 'credit_card':
      case 'debit_card':
        if (!paymentData.cardNumber) {
          errors.cardNumber = '请输入卡号';
        } else if (!/^\d{16}$/.test(paymentData.cardNumber.replace(/\s/g, ''))) {
          errors.cardNumber = '请输入正确的卡号';
        }

        if (!paymentData.expiryDate) {
          errors.expiryDate = '请输入有效期';
        } else if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
          errors.expiryDate = '请输入正确的有效期格式（MM/YY）';
        }

        if (!paymentData.cvv) {
          errors.cvv = '请输入CVV';
        } else if (!/^\d{3,4}$/.test(paymentData.cvv)) {
          errors.cvv = '请输入正确的CVV';
        }

        if (!paymentData.cardholderName) {
          errors.cardholderName = '请输入持卡人姓名';
        }
        break;

      case 'alipay':
      case 'wechat':
        // 第三方支付通常只需要用户确认，无需额外验证
        break;

      case 'bank_transfer':
        if (!paymentData.bankAccount) {
          errors.bankAccount = '请输入银行账户';
        }
        break;

      default:
        break;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * 添加支付记录到历史
   * @param {Object} paymentRecord - 支付记录对象
   * @returns {void}
   */
  addToPaymentHistory: (paymentRecord) => {
    const { paymentHistory } = get();
    set({ 
      paymentHistory: [paymentRecord, ...paymentHistory] 
    });
  },

  /**
   * 重置支付状态
   * @returns {void}
   * @description 将支付状态重置为空闲状态，清除错误信息
   */
  resetPaymentStatus: () => {
    set({ 
      paymentStatus: 'idle',
      error: null,
      securityCode: '' 
    });
  },

  /**
   * 设置安全验证码
   * @param {string} code - 安全验证码
   * @returns {void}
   */
  setSecurityCode: (code) => {
    set({ securityCode: code });
  },

  /**
   * 获取支付方式图标
   * @param {string} type - 支付方式类型
   * @returns {string} 图标emoji
   */
  getPaymentMethodIcon: (type) => {
    const iconMap = {
      alipay: '💰',
      wechat: '💚',
      credit_card: '💳',
      debit_card: '💳',
      wallet: '👛',
      bank_transfer: '🏦'
    };
    return iconMap[type] || '💳';
  },

  /**
   * 格式化金额显示
   * @param {number} amount - 金额
   * @returns {string} 格式化后的金额字符串
   * @description 按照中国货币格式显示金额
   */
  formatAmount: (amount) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  }
}));