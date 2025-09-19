import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockAddresses } from '../data/mockData.js';

// 地址状态管理
export const useAddressStore = create(
  persist(
    (set, get) => ({
      // 状态
      addresses: [],
      selectedAddress: null,
      isEditing: false,
      editingAddress: null,
      loading: false,
      error: null,

      // 动作
      loadAddresses: async () => {
        set({ loading: true, error: null });
        try {
          // 模拟API调用
          setTimeout(() => {
            set({ addresses: mockAddresses, loading: false });
          }, 500);
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      addAddress: async (addressData) => {
        const { addresses } = get();
        const newAddress = {
          id: `addr-${Date.now()}`,
          ...addressData,
          isDefault: addresses.length === 0 ? true : addressData.isDefault || false
        };

        // 如果设置为默认地址，取消其他地址的默认状态
        let updatedAddresses = addresses;
        if (newAddress.isDefault) {
          updatedAddresses = addresses.map(addr => ({ ...addr, isDefault: false }));
        }

        updatedAddresses.push(newAddress);
        set({ addresses: updatedAddresses });
        return newAddress;
      },

      updateAddress: async (addressId, addressData) => {
        const { addresses } = get();
        let updatedAddresses = addresses.map(addr => 
          addr.id === addressId 
            ? { ...addr, ...addressData }
            : addr
        );

        // 如果更新的地址设置为默认，取消其他地址的默认状态
        if (addressData.isDefault) {
          updatedAddresses = updatedAddresses.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId
          }));
        }

        set({ addresses: updatedAddresses });
        return updatedAddresses.find(addr => addr.id === addressId);
      },

      deleteAddress: async (addressId) => {
        const { addresses } = get();
        const addressToDelete = addresses.find(addr => addr.id === addressId);
        let updatedAddresses = addresses.filter(addr => addr.id !== addressId);

        // 如果删除的是默认地址且还有其他地址，将第一个地址设为默认
        if (addressToDelete?.isDefault && updatedAddresses.length > 0) {
          updatedAddresses[0].isDefault = true;
        }

        set({ addresses: updatedAddresses });
        
        // 如果删除的是当前选中的地址，清除选中状态
        const { selectedAddress } = get();
        if (selectedAddress?.id === addressId) {
          get().selectAddress(null);
        }
      },

      selectAddress: (address) => {
        set({ selectedAddress: address });
      },

      setDefaultAddress: async (addressId) => {
        const { addresses } = get();
        const updatedAddresses = addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        }));
        set({ addresses: updatedAddresses });
      },

      getDefaultAddress: () => {
        const { addresses } = get();
        return addresses.find(addr => addr.isDefault) || null;
      },

      startEditing: (address = null) => {
        set({ 
          isEditing: true, 
          editingAddress: address 
        });
      },

      stopEditing: () => {
        set({ 
          isEditing: false, 
          editingAddress: null 
        });
      },

      validateAddress: (addressData) => {
        const errors = {};

        if (!addressData.recipientName?.trim()) {
          errors.recipientName = '收货人姓名不能为空';
        }

        if (!addressData.phoneNumber?.trim()) {
          errors.phoneNumber = '联系电话不能为空';
        } else if (!/^1[3-9]\d{9}$/.test(addressData.phoneNumber)) {
          errors.phoneNumber = '请输入正确的手机号码';
        }

        if (!addressData.province?.trim()) {
          errors.province = '请选择省份';
        }

        if (!addressData.city?.trim()) {
          errors.city = '请选择城市';
        }

        if (!addressData.district?.trim()) {
          errors.district = '请选择区县';
        }

        if (!addressData.detailAddress?.trim()) {
          errors.detailAddress = '详细地址不能为空';
        }

        if (addressData.postalCode && !/^\d{6}$/.test(addressData.postalCode)) {
          errors.postalCode = '请输入正确的邮政编码';
        }

        return {
          isValid: Object.keys(errors).length === 0,
          errors
        };
      },

      // 获取完整地址字符串
      getFullAddress: (address) => {
        if (!address) return '';
        return `${address.province}${address.city}${address.district}${address.detailAddress}`;
      }
    }),
    {
      name: 'address-storage',
      getStorage: () => localStorage,
    }
  )
);