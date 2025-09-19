import { create } from 'zustand';
import { mockPaymentMethods } from '../data/mockData.js';

// 支付状态管理
export const usePaymentStore = create((set, get) => ({
  // 状态
  paymentMethods: [],
  selectedMethod: null,
  orderAmount: 0,
  orderInfo: null,
  paymentStatus: 'idle', // idle, processing, success, failed
  loading: false,
  error: null,
  securityCode: '',
  paymentHistory: [],

  // 动作
  loadPaymentMethods: async () => {
    set({ loading: true, error: null });
    try {
      // 模拟API调用
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

  selectPaymentMethod: (method) => {
    set({ selectedMethod: method });
  },

  setOrderAmount: (amount) => {
    set({ orderAmount: amount });
  },

  setOrderInfo: (orderInfo) => {
    set({ orderInfo });
  },

  // 处理支付流程
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

  // 模拟支付处理过程
  simulatePaymentProcess: async (paymentData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 90% 成功率模拟
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

  // 验证支付数据
  validatePaymentData: (paymentData) => {
    const { selectedMethod } = get();
    const errors = {};

    if (!selectedMethod) {
      errors.method = '请选择支付方式';
    }

    // 根据不同支付方式进行验证
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
        // 第三方支付通常只需要确认
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

  // 添加到支付历史
  addToPaymentHistory: (paymentRecord) => {
    const { paymentHistory } = get();
    set({ 
      paymentHistory: [paymentRecord, ...paymentHistory] 
    });
  },

  // 重置支付状态
  resetPaymentStatus: () => {
    set({ 
      paymentStatus: 'idle',
      error: null,
      securityCode: '' 
    });
  },

  // 设置安全码
  setSecurityCode: (code) => {
    set({ securityCode: code });
  },

  // 获取支付方式图标
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

  // 格式化金额
  formatAmount: (amount) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  }
}));