/**
 * 地址管理状态存储模块
 * 
 * @description 基于 Zustand 状态管理库构建的地址管理模块，负责处理用户收货地址的增删改查、
 *              验证、默认地址设置等核心功能。提供完整的地址管理解决方案。
 * 
 * @技术栈:
 * - Zustand: 轻量级状态管理库，提供响应式状态管理
 * - Zustand/middleware: 提供持久化中间件，实现数据本地存储
 * - JavaScript ES6+: 使用现代语法特性
 * 
 * @数据模型:
 * - addresses: Array - 用户地址列表，存储所有收货地址
 * - selectedAddress: Object|null - 当前选中的地址对象
 * - isEditing: Boolean - 是否处于编辑状态的标志
 * - editingAddress: Object|null - 正在编辑的地址对象
 * - loading: Boolean - 加载状态标识符
 * - error: String|null - 错误信息存储
 * 
 * @地址数据结构:
 * - id: String - 地址唯一标识符
 * - recipientName: String - 收货人姓名
 * - phoneNumber: String - 联系电话
 * - province: String - 省份
 * - city: String - 城市
 * - district: String - 区县
 * - detailAddress: String - 详细地址
 * - postalCode: String - 邮政编码(可选)
 * - isDefault: Boolean - 是否为默认地址
 * 
 * @author 地址管理模块
 * @version 1.0.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockAddresses } from '../data/mockData.js';
/**
 * 地址状态管理 Store
 * 
 * 使用 Zustand 创建的状态管理实例，整合了持久化中间件
 * 提供完整的地址管理功能和状态控制
 */
export const useAddressStore = create(
  persist(
    (set, get) => ({
      /**
       * ================================
       * 状态数据定义
       * ================================
       */
      
      /** @type {Array} 用户地址列表 - 存储所有收货地址数据 */
      addresses: [],
      
      /** @type {Object|null} 当前选中的地址对象 - 用于结算页面的地址选择 */
      selectedAddress: null,
      
      /** @type {Boolean} 编辑状态标志 - 控制地址编辑模式的开启和关闭 */
      isEditing: false,
      
      /** @type {Object|null} 正在编辑的地址对象 - 管理当前正在编辑的地址数据 */
      editingAddress: null,
      
      /** @type {Boolean} 加载状态标识符 - 指示异步操作的进行状态 */
      loading: false,
      
      /** @type {String|null} 错误信息存储 - 保存操作过程中的错误信息 */
      error: null,

      /**
       * ================================
       * 核心功能模块
       * ================================
       */
      /**
       * ================================
       * 地址加载模块
       * ================================
       */
      
      /**
       * 加载用户地址列表
       * 
       * @description 从数据源加载地址信息，模拟异步API调用过程
       *              设置加载状态和错误重置，通过定时器模拟网络延迟
       * 
       * @workflow 加载地址流程:
       * 1. 设置 loading 为 true，清除历史错误信息
       * 2. 通过 setTimeout 模拟 500ms 的网络延迟
       * 3. 加载成功后更新 addresses 状态，关闭加载状态
       * 4. 如果发生错误，保存错误信息并关闭加载状态
       * 
       * @usage 使用场景:
       * - 组件初始化时加载地址数据
       * - 用户手动刷新地址列表
       * - 页面重新进入时的数据同步
       * 
       * @returns {Promise<void>} 无返回值的 Promise
       * 
       * @example
       * // 在 React 组件中使用
       * const { loadAddresses, loading, addresses, error } = useAddressStore();
       * 
       * useEffect(() => {
       *   loadAddresses();
       * }, []);
       */
      loadAddresses: async () => {
        // 设置加载状态，清除历史错误
        set({ loading: true, error: null });
        try {
          // 模拟 API 调用 - 通过 setTimeout 模拟网络延迟
          setTimeout(() => {
            // 加载成功，更新地址列表并关闭加载状态
            set({ addresses: mockAddresses, loading: false });
          }, 500); // 500ms 模拟网络延迟
        } catch (error) {
          // 错误处理：保存错误信息，关闭加载状态
          set({ error: error.message, loading: false });
        }
      },

      /**
       * ================================
       * 地址增删改模块
       * ================================
       */
      
      /**
       * 添加新的收货地址
       * 
       * @description 创建一个新的收货地址，并添加到地址列表中
       *              自动处理默认地址逻辑和唯一ID生成
       * 
       * @workflow 添加地址流程:
       * 1. 生成基于时间戳的唯一地址 ID
       * 2. 处理默认地址逻辑：首个地址自动设为默认
       * 3. 如果新地址设为默认，取消其他地址的默认状态
       * 4. 将新地址添加到列表并更新状态
       * 
       * @param {Object} addressData - 地址数据对象
       * @param {string} addressData.recipientName - 收货人姓名
       * @param {string} addressData.phoneNumber - 联系电话
       * @param {string} addressData.province - 省份
       * @param {string} addressData.city - 城市  
       * @param {string} addressData.district - 区县
       * @param {string} addressData.detailAddress - 详细地址
       * @param {string} [addressData.postalCode] - 邮政编码(可选)
       * @param {boolean} [addressData.isDefault=false] - 是否设为默认地址
       * 
       * @returns {Promise<Object>} 返回新创建的地址对象
       * 
       * @example
       * const newAddress = await addAddress({
       *   recipientName: '张三',
       *   phoneNumber: '13800138000',
       *   province: '北京市',
       *   city: '北京市',
       *   district: '朝阳区',
       *   detailAddress: '三里屯路100号',
       *   isDefault: true
       * });
       */
      addAddress: async (addressData) => {
        const { addresses } = get();
        
        // 生成新地址对象，包含唯一ID和默认地址逻辑
        const newAddress = {
          id: `addr-${Date.now()}`, // 基于时间戳生成唯一ID
          ...addressData,
          // 首个地址自动设为默认，否则按用户指定
          isDefault: addresses.length === 0 ? true : addressData.isDefault || false
        };

        // 处理默认地址状态：如果设置为默认，取消其他地址的默认状态
        let updatedAddresses = addresses;
        if (newAddress.isDefault) {
          updatedAddresses = addresses.map(addr => ({ ...addr, isDefault: false }));
        }

        // 将新地址添加到列表并更新状态
        updatedAddresses.push(newAddress);
        set({ addresses: updatedAddresses });
        
        // 返回新创建的地址对象
        return newAddress;
      },

      /**
       * 更新指定的收货地址
       * 
       * @description 根据地址ID定位并更新指定地址的信息
       *              处理默认地址状态切换逻辑，确保同一时间只有一个默认地址
       * 
       * @workflow 更新地址流程:
       * 1. 根据 addressId 定位目标地址
       * 2. 使用展开运算符合并新数据到原地址对象
       * 3. 如果更新的地址设置为默认，取消其他所有地址的默认状态
       * 4. 更新状态并返回更新后的地址对象
       * 
       * @param {string} addressId - 要更新的地址ID
       * @param {Object} addressData - 更新的地址数据(可部分更新)
       * @param {string} [addressData.recipientName] - 收货人姓名
       * @param {string} [addressData.phoneNumber] - 联系电话
       * @param {string} [addressData.province] - 省份
       * @param {string} [addressData.city] - 城市
       * @param {string} [addressData.district] - 区县
       * @param {string} [addressData.detailAddress] - 详细地址
       * @param {string} [addressData.postalCode] - 邮政编码
       * @param {boolean} [addressData.isDefault] - 是否设为默认地址
       * 
       * @returns {Promise<Object|undefined>} 返回更新后的地址对象，如果找不到返回 undefined
       * 
       * @example
       * const updatedAddress = await updateAddress('addr-123456789', {
       *   recipientName: '李四',
       *   phoneNumber: '13900139000',
       *   isDefault: true
       * });
       */
      updateAddress: async (addressId, addressData) => {
        const { addresses } = get();
        
        // 根据 ID 更新指定地址，使用展开运算符合并新数据
        let updatedAddresses = addresses.map(addr => 
          addr.id === addressId 
            ? { ...addr, ...addressData } // 合并新数据到原地址对象
            : addr // 保持其他地址不变
        );

        // 处理默认地址状态：如果更新的地址设置为默认，取消其他地址的默认状态
        if (addressData.isDefault) {
          updatedAddresses = updatedAddresses.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId // 只有当前更新的地址为默认
          }));
        }

        // 更新状态
        set({ addresses: updatedAddresses });
        
        // 返回更新后的地址对象
        return updatedAddresses.find(addr => addr.id === addressId);
      },

      /**
       * 删除指定的收货地址
       * 
       * @description 根据ID从地址列表中移除指定地址
       *              自动处理默认地址删除后的重新分配逻辑
       *              清理相关的选中状态
       * 
       * @workflow 删除地址流程:
       * 1. 查找并保存要删除的地址对象引用
       * 2. 从地址列表中过滤掉指定 ID 的地址
       * 3. 处理默认地址逻辑：如果删除的是默认地址且还有其他地址，将第一个地址设为默认
       * 4. 更新地址列表状态
       * 5. 清理相关状态：如果删除的是当前选中地址，清除选中状态
       * 
       * @param {string} addressId - 要删除的地址ID
       * 
       * @returns {Promise<void>} 无返回值的 Promise
       * 
       * @example
       * // 删除指定地址
       * await deleteAddress('addr-123456789');
       * 
       * @sideEffects 副作用:
       * - 如果删除默认地址，会自动将第一个剩余地址设为默认
       * - 如果删除当前选中地址，会清除 selectedAddress 状态
       */
      deleteAddress: async (addressId) => {
        const { addresses } = get();
        
        // 找到要删除的地址对象，用于后续的默认地址判断
        const addressToDelete = addresses.find(addr => addr.id === addressId);
        
        // 从列表中移除指定地址
        let updatedAddresses = addresses.filter(addr => addr.id !== addressId);

        // 处理默认地址删除逻辑：如果删除的是默认地址且还有其他地址，将第一个地址设为默认
        if (addressToDelete?.isDefault && updatedAddresses.length > 0) {
          updatedAddresses[0].isDefault = true;
        }

        // 更新地址列表状态
        set({ addresses: updatedAddresses });
        
        // 清理相关状态：如果删除的是当前选中的地址，清除选中状态
        const { selectedAddress } = get();
        if (selectedAddress?.id === addressId) {
          get().selectAddress(null); // 调用选择地址方法清除选中状态
        }
      },

      /**
       * ================================
       * 地址选择与状态管理模块
       * ================================
       */
      
      /**
       * 选择指定的收货地址
       * 
       * @description 设置当前选中的地址对象，用于结算页面的地址选择
       *              支持选中或清空选中状态
       * 
       * @param {Object|null} address - 要选中的地址对象，传入 null 清空选中状态
       * @param {string} [address.id] - 地址ID
       * @param {string} [address.recipientName] - 收货人姓名
       * @param {string} [address.phoneNumber] - 联系电话
       * @param {string} [address.province] - 省份
       * @param {string} [address.city] - 城市
       * @param {string} [address.district] - 区县
       * @param {string} [address.detailAddress] - 详细地址
       * @param {boolean} [address.isDefault] - 是否为默认地址
       * 
       * @returns {void} 无返回值
       * 
       * @example
       * // 选中一个地址
       * selectAddress({
       *   id: 'addr-123456789',
       *   recipientName: '张三',
       *   // ... 其他地址信息
       * });
       * 
       * // 清空选中状态
       * selectAddress(null);
       */
      selectAddress: (address) => {
        // 设置当前选中的地址对象
        set({ selectedAddress: address });
      },

      /**
       * 设置指定地址为默认地址
       * 
       * @description 将指定 ID 的地址设置为默认地址
       *              确保唯一性：其他地址的默认状态自动取消
       * 
       * @param {string} addressId - 要设置为默认的地址ID
       * 
       * @returns {Promise<void>} 无返回值的 Promise
       * 
       * @example
       * // 设置指定地址为默认
       * await setDefaultAddress('addr-123456789');
       */
      setDefaultAddress: async (addressId) => {
        const { addresses } = get();
        
        // 更新所有地址的默认状态，确保只有指定地址为默认
        const updatedAddresses = addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId // 只有匹配的 ID 才设为默认
        }));
        
        // 更新状态
        set({ addresses: updatedAddresses });
      },

      /**
       * 获取当前默认地址
       * 
       * @description 从地址列表中查找并返回默认地址对象
       *              如果没有默认地址则返回 null
       * 
       * @returns {Object|null} 默认地址对象或 null
       * 
       * @example
       * const defaultAddr = getDefaultAddress();
       * if (defaultAddr) {
       *   console.log('默认地址:', defaultAddr.recipientName);
       * }
       */
      getDefaultAddress: () => {
        const { addresses } = get();
        // 查找并返回 isDefault 为 true 的地址，没有则返回 null
        return addresses.find(addr => addr.isDefault) || null;
      },

      /**
       * 开始编辑地址模式
       * 
       * @description 开启地址编辑模式，支持新增和编辑两种模式
       *              新增模式：不传入 address 参数或传入 null
       *              编辑模式：传入要编辑的地址对象
       * 
       * @param {Object|null} [address=null] - 要编辑的地址对象，不传入或 null 表示新增模式
       * 
       * @returns {void} 无返回值
       * 
       * @example
       * // 新增地址模式
       * startEditing();
       * // 或
       * startEditing(null);
       * 
       * // 编辑地址模式
       * startEditing(existingAddress);
       */
      startEditing: (address = null) => {
        set({ 
          isEditing: true,        // 开启编辑状态
          editingAddress: address // 设置正在编辑的地址对象
        });
      },

      /**
       * 停止编辑地址模式
       * 
       * @description 关闭地址编辑模式，清空编辑相关的状态
       *              通常在用户取消编辑或保存成功后调用
       * 
       * @returns {void} 无返回值
       * 
       * @example
       * // 取消编辑或保存后关闭编辑模式
       * stopEditing();
       */
      stopEditing: () => {
        set({ 
          isEditing: false,       // 关闭编辑状态
          editingAddress: null    // 清空正在编辑的地址对象
        });
      },

      /**
       * ================================
       * 数据验证模块
       * ================================
       */
      
      /**
       * 验证地址数据的完整性和正确性
       * 
       * @description 对地址数据进行全面验证，包括必填字段检查和格式验证
       *              返回详细的验证结果和错误信息
       * 
       * @validation_rules 验证规则说明:
       * 
       * 必填字段验证:
       * - recipientName: 收货人姓名不能为空
       * - phoneNumber: 联系电话不能为空且必须符合手机号格式
       * - province: 省份不能为空
       * - city: 城市不能为空
       * - district: 区县不能为空
       * - detailAddress: 详细地址不能为空
       * 
       * 格式验证:
       * - phoneNumber: 手机号格式 (1[3-9]\d{9}) - 以1开头，第二位3-9，后饶9位数字
       * - postalCode: 邮政编码格式 (\d{6}) - 6位数字(可选字段)
       * 
       * @param {Object} addressData - 要验证的地址数据对象
       * @param {string} addressData.recipientName - 收货人姓名
       * @param {string} addressData.phoneNumber - 联系电话
       * @param {string} addressData.province - 省份
       * @param {string} addressData.city - 城市
       * @param {string} addressData.district - 区县
       * @param {string} addressData.detailAddress - 详细地址
       * @param {string} [addressData.postalCode] - 邮政编码(可选)
       * 
       * @returns {Object} 验证结果对象
       * @returns {boolean} returns.isValid - 整体验证是否通过
       * @returns {Object} returns.errors - 各字段的错误信息对象
       * @returns {string} [returns.errors.recipientName] - 收货人姓名错误信息
       * @returns {string} [returns.errors.phoneNumber] - 联系电话错误信息
       * @returns {string} [returns.errors.province] - 省份错误信息
       * @returns {string} [returns.errors.city] - 城市错误信息
       * @returns {string} [returns.errors.district] - 区县错误信息
       * @returns {string} [returns.errors.detailAddress] - 详细地址错误信息
       * @returns {string} [returns.errors.postalCode] - 邮政编码错误信息
       * 
       * @example
       * const result = validateAddress({
       *   recipientName: '张三',
       *   phoneNumber: '13800138000',
       *   province: '北京市',
       *   city: '北京市',
       *   district: '朝阳区',
       *   detailAddress: '三里屯路100号',
       *   postalCode: '100020'
       * });
       * 
       * if (result.isValid) {
       *   console.log('地址数据验证通过');
       * } else {
       *   console.log('验证错误:', result.errors);
       * }
       */
      validateAddress: (addressData) => {
        // 初始化错误信息对象
        const errors = {};

        // 验证收货人姓名 - 必填字段
        if (!addressData.recipientName?.trim()) {
          errors.recipientName = '收货人姓名不能为空';
        }

        // 验证联系电话 - 必填字段且必须符合手机号格式
        if (!addressData.phoneNumber?.trim()) {
          errors.phoneNumber = '联系电话不能为空';
        } else if (!/^1[3-9]\d{9}$/.test(addressData.phoneNumber)) {
          // 手机号格式验证：1开头，第二位3-9，后饶9位数字
          errors.phoneNumber = '请输入正确的手机号码';
        }

        // 验证省份 - 必填字段
        if (!addressData.province?.trim()) {
          errors.province = '请选择省份';
        }

        // 验证城市 - 必填字段
        if (!addressData.city?.trim()) {
          errors.city = '请选择城市';
        }

        // 验证区县 - 必填字段
        if (!addressData.district?.trim()) {
          errors.district = '请选择区县';
        }

        // 验证详细地址 - 必填字段
        if (!addressData.detailAddress?.trim()) {
          errors.detailAddress = '详细地址不能为空';
        }

        // 验证邮政编码 - 可选字段，但如果填写必须符合格式
        if (addressData.postalCode && !/^\d{6}$/.test(addressData.postalCode)) {
          errors.postalCode = '请输入正确的邮政编码'; // 6位数字格式
        }

        // 返回验证结果对象
        return {
          isValid: Object.keys(errors).length === 0, // 没有错误则验证通过
          errors // 返回所有错误信息
        };
      },

      /**
       * ================================
       * 工具函数模块
       * ================================
       */
      
      /**
       * 获取完整的地址字符串
       * 
       * @description 将地址对象的省市区和详细地址拼接成完整字符串
       *              用于显示和打印完整地址信息，处理空值情况
       * 
       * @workflow 地址字符串生成流程:
       * 1. 检查地址对象是否存在
       * 2. 如果不存在或为 null/undefined，返回空字符串
       * 3. 按照 “省份 + 城市 + 区县 + 详细地址” 的顺序拼接
       * 4. 返回完整的地址字符串
       * 
       * @param {Object|null|undefined} address - 地址对象
       * @param {string} [address.province] - 省份
       * @param {string} [address.city] - 城市
       * @param {string} [address.district] - 区县
       * @param {string} [address.detailAddress] - 详细地址
       * 
       * @returns {string} 完整的地址字符串，如果地址对象为空则返回空字符串
       * 
       * @example
       * const address = {
       *   province: '北京市',
       *   city: '北京市',
       *   district: '朝阳区',
       *   detailAddress: '三里屯路100号'
       * };
       * 
       * const fullAddress = getFullAddress(address);
       * console.log(fullAddress); // 输出: “北京市北京市朝阳区三里屯路100号”
       * 
       * // 空地址处理
       * console.log(getFullAddress(null)); // 输出: “”
       * console.log(getFullAddress(undefined)); // 输出: “”
       * 
       * @usage 使用场景:
       * - 地址列表显示中展示完整地址
       * - 订单结算页显示选中地址
       * - 打印寄送标签时的地址信息
       * - 地址搜索和匹配功能
       */
      getFullAddress: (address) => {
        // 检查地址对象是否存在，处理 null/undefined 情况
        if (!address) return '';
        
        // 拼接完整地址字符串：省份 + 城市 + 区县 + 详细地址
        return `${address.province}${address.city}${address.district}${address.detailAddress}`;
      }
    }),
    /**
     * ================================
     * 数据持久化配置
     * ================================
     * 
     * @description 使用 Zustand persist 中间件实现状态数据的本地持久化存储
     *              确保用户刷新页面或重新打开应用时数据不丢失
     * 
     * @storage_config 存储配置说明:
     * - 存储介质: localStorage - 浏览器本地存储，支持不同会话间的数据共享
     * - 存储键名: 'address-storage' - 在 localStorage 中的存储键名
     * - 序列化: 自动处理 JavaScript 对象与 JSON 字符串的转换
     * - 反序列化: 自动在应用初始化时恢复存储的状态数据
     * 
     * @persistence_scope 持久化范围:
     * 所有状态数据都会被持久化，包括:
     * - addresses: 地址列表数据
     * - selectedAddress: 当前选中地址
     * - isEditing: 编辑状态信息
     * - editingAddress: 正在编辑的地址
     * - loading: 加载状态
     * - error: 错误信息
     * 
     * @data_lifecycle 数据生命周期:
     * 1. 应用启动时自动从 localStorage 加载数据
     * 2. 状态变更时自动保存到 localStorage
     * 3. 用户清除浏览器数据或切换设备时数据可能丢失
     * 
     * @browser_compatibility 浏览器兼容性:
     * - 支持所有现代浏览器的 localStorage API
     * - 隐私模式下可能受到限制
     * - 存储容量限制：大部分浏览器为 5-10MB
     * 
     * @error_handling 错误处理:
     * - localStorage 不可用时会退回到内存模式
     * - 存储空间不足时会忽略持久化操作
     * - JSON 序列化/反序列化错误时会使用默认状态
     */
    {
      name: 'address-storage',    // localStorage 中的存储键名
      getStorage: () => localStorage, // 指定使用 localStorage 作为存储介质
    }
  )
);