/**
 * @fileoverview 评论管理状态Store
 * @description 基于Zustand实现的评论系统状态管理模块，负责评论的增删改查、筛选排序、点赞互动等功能
 * @module store/commentStore
 */

import { create } from 'zustand';
import { mockComments } from '../data/mockData.js';

/**
 * 评论管理Store
 * @description 提供评论相关的状态管理和业务操作方法
 * 
 * 主要功能：
 * - 评论加载、分页、筛选和排序
 * - 评论的增删改查操作
 * - 评论点赞/取消点赞
 * - 评论数据验证和统计
 * - 时间格式化和星级显示
 */
export const useCommentStore = create((set, get) => ({
  /**
   * 评论列表数据
   * @type {Array<Object>}
   * @description 当前页的评论数据数组，包含评论内容、评分、用户信息等
   */
  comments: [],
  
  /**
   * 当前页码
   * @type {number}
   * @default 1
   * @description 评论列表当前显示的页码，从1开始
   */
  currentPage: 1,
  
  /**
   * 总页数
   * @type {number}
   * @default 1
   * @description 根据总评论数和每页数量计算得出的总页数
   */
  totalPages: 1,
  
  /**
   * 评论总数
   * @type {number}
   * @default 0
   * @description 当前筛选条件下的评论总数量
   */
  totalComments: 0,
  
  /**
   * 筛选选项配置
   * @type {Object}
   * @property {number|null} rating - 评分筛选，null表示不限，1-5表示最低评分要求
   * @property {string} sortBy - 排序方式：'newest'(最新)、'oldest'(最早)、'helpful'(最有用)、'rating_desc'(评分降序)、'rating_asc'(评分升序)
   * @property {boolean} hasImages - 是否筛选带图评论
   */
  filterOptions: {
    rating: null,
    sortBy: 'newest',
    hasImages: false
  },
  
  /**
   * 加载状态标识
   * @type {boolean}
   * @default false
   * @description 表示是否正在加载评论数据
   */
  loading: false,
  
  /**
   * 错误信息
   * @type {string|null}
   * @description 操作失败时的错误信息，null表示无错误
   */
  error: null,

  /**
   * 加载商品评论列表
   * @async
   * @param {string} productId - 商品ID
   * @param {number} [page=1] - 页码，默认为第1页
   * @param {Object} [filters={}] - 筛选条件对象
   * @param {number} [filters.rating] - 最低评分筛选
   * @param {string} [filters.sortBy] - 排序方式
   * @param {boolean} [filters.hasImages] - 是否只显示带图评论
   * @returns {Promise<void>}
   * @description 根据商品ID和筛选条件加载评论，支持评分筛选、排序和分页功能
   */
  loadComments: async (productId, page = 1, filters = {}) => {
    set({ loading: true, error: null });
    try {
      // 模拟API调用延迟
      setTimeout(() => {
        // 第一步：筛选出指定商品的评论
        let filteredComments = mockComments.filter(comment => 
          comment.productId === productId
        );

        // 第二步：应用评分筛选
        if (filters.rating) {
          filteredComments = filteredComments.filter(comment => 
            comment.rating >= filters.rating
          );
        }

        // 第三步：筛选带图评论
        if (filters.hasImages) {
          filteredComments = filteredComments.filter(comment => 
            comment.images && comment.images.length > 0
          );
        }

        // 第四步：根据sortBy参数排序
        switch (filters.sortBy || 'newest') {
          case 'newest':
            filteredComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
          case 'oldest':
            filteredComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
          case 'helpful':
            filteredComments.sort((a, b) => b.likesCount - a.likesCount);
            break;
          case 'rating_desc':
            filteredComments.sort((a, b) => b.rating - a.rating);
            break;
          case 'rating_asc':
            filteredComments.sort((a, b) => a.rating - b.rating);
            break;
          default:
            break;
        }

        // 第五步：分页处理
        const pageSize = 10; // 每页显示10条评论
        const startIndex = (page - 1) * pageSize; // 计算起始索引
        const endIndex = startIndex + pageSize; // 计算结束索引
        const paginatedComments = filteredComments.slice(startIndex, endIndex); // 截取当前页数据

        set({
          comments: paginatedComments,
          currentPage: page,
          totalPages: Math.ceil(filteredComments.length / pageSize),
          totalComments: filteredComments.length,
          filterOptions: { ...get().filterOptions, ...filters },
          loading: false
        });
      }, 500);
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  /**
   * 添加新评论
   * @async
   * @param {Object} commentData - 评论数据对象
   * @param {string} commentData.productId - 商品ID
   * @param {string} commentData.userId - 用户ID
   * @param {string} commentData.content - 评论内容
   * @param {number} commentData.rating - 评分(1-5)
   * @param {Array<string>} [commentData.images] - 评论图片URL数组
   * @returns {Promise<Object>} 返回新创建的评论对象
   * @description 创建新评论并添加到评论列表顶部，自动生成ID和时间戳
   */
  addComment: async (commentData) => {
    // 构造新评论对象
    const newComment = {
      id: `comment-${Date.now()}`, // 使用时间戳生成唯一ID
      ...commentData,
      createdAt: new Date(), // 创建时间
      likesCount: 0 // 初始点赞数为0
    };

    // TODO: 实际项目中应发送到服务器API
    // 当前模拟添加成功后直接更新本地状态
    const { comments, totalComments } = get();
    set({
      comments: [newComment, ...comments],
      totalComments: totalComments + 1
    });

    return newComment;
  },

  /**
   * 更新评论信息
   * @async
   * @param {string} commentId - 评论ID
   * @param {Object} updateData - 需要更新的字段对象
   * @returns {Promise<void>}
   * @description 根据评论ID更新评论的部分字段，如内容、评分等
   */
  updateComment: async (commentId, updateData) => {
    const { comments } = get();
    const updatedComments = comments.map(comment =>
      comment.id === commentId
        ? { ...comment, ...updateData }
        : comment
    );
    set({ comments: updatedComments });
  },

  /**
   * 删除评论
   * @async
   * @param {string} commentId - 评论ID
   * @returns {Promise<void>}
   * @description 根据评论ID删除评论，并更新评论总数
   */
  deleteComment: async (commentId) => {
    const { comments, totalComments } = get();
    const updatedComments = comments.filter(comment => comment.id !== commentId);
    set({
      comments: updatedComments,
      totalComments: totalComments - 1
    });
  },

  /**
   * 点赞评论
   * @async
   * @param {string} commentId - 评论ID
   * @returns {Promise<void>}
   * @description 为指定评论增加1个点赞数
   */
  likeComment: async (commentId) => {
    const { comments } = get();
    const updatedComments = comments.map(comment =>
      comment.id === commentId
        ? { ...comment, likesCount: comment.likesCount + 1 }
        : comment
    );
    set({ comments: updatedComments });
  },

  /**
   * 取消点赞评论
   * @async
   * @param {string} commentId - 评论ID
   * @returns {Promise<void>}
   * @description 为指定评论减少1个点赞数，最小值为0
   */
  unlikeComment: async (commentId) => {
    const { comments } = get();
    const updatedComments = comments.map(comment =>
      comment.id === commentId
        ? { ...comment, likesCount: Math.max(0, comment.likesCount - 1) } // 确保点赞数不小于0
        : comment
    );
    set({ comments: updatedComments });
  },

  /**
   * 设置单个筛选条件
   * @param {string} filterKey - 筛选条件的键名（如'rating'、'sortBy'、'hasImages'）
   * @param {*} value - 筛选条件的值
   * @returns {void}
   * @description 更新筛选选项中的单个字段值
   */
  setFilter: (filterKey, value) => {
    const { filterOptions } = get();
    set({
      filterOptions: {
        ...filterOptions,
        [filterKey]: value
      }
    });
  },

  /**
   * 清除所有筛选条件
   * @returns {void}
   * @description 将筛选选项重置为默认值
   */
  clearFilters: () => {
    set({
      filterOptions: {
        rating: null,
        sortBy: 'newest',
        hasImages: false
      }
    });
  },

  /**
   * 获取评论统计摘要
   * @returns {Object} 评论统计对象
   * @returns {number} return.totalComments - 评论总数
   * @returns {number} return.averageRating - 平均评分（保留1位小数）
   * @returns {Object} return.ratingDistribution - 评分分布对象，键为1-5星，值为对应数量
   * @description 计算当前评论列表的统计信息，包括总数、平均分和各星级分布
   */
  getCommentSummary: () => {
    const { comments } = get();
    // 计算评分总和
    const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
    // 计算平均评分
    const averageRating = comments.length > 0 ? totalRating / comments.length : 0;

    // 统计各星级评论数量
    const ratingDistribution = {
      5: comments.filter(c => c.rating === 5).length,
      4: comments.filter(c => c.rating === 4).length,
      3: comments.filter(c => c.rating === 3).length,
      2: comments.filter(c => c.rating === 2).length,
      1: comments.filter(c => c.rating === 1).length
    };

    return {
      totalComments: comments.length,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution
    };
  },

  /**
   * 验证评论数据合法性
   * @param {Object} commentData - 待验证的评论数据
   * @param {string} commentData.content - 评论内容
   * @param {number} commentData.rating - 评分
   * @param {Array<string>} [commentData.images] - 图片数组
   * @returns {Object} 验证结果对象
   * @returns {boolean} return.isValid - 是否验证通过
   * @returns {Object} return.errors - 错误信息对象，键为字段名，值为错误提示
   * @description 验证评论内容长度、评分范围、图片数量等，返回详细的错误信息
   */
  validateComment: (commentData) => {
    const errors = {};

    if (!commentData.content?.trim()) {
      errors.content = '评论内容不能为空';
    } else if (commentData.content.length < 5) {
      errors.content = '评论内容至少需要5个字符';
    } else if (commentData.content.length > 500) {
      errors.content = '评论内容不能超过500个字符';
    }

    if (!commentData.rating || commentData.rating < 1 || commentData.rating > 5) {
      errors.rating = '请选择1-5星评分';
    }

    if (commentData.images && commentData.images.length > 9) {
      errors.images = '最多只能上传9张图片';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * 获取评分星星显示数据
   * @param {number} rating - 评分值（支持小数）
   * @returns {Object} 星星显示对象
   * @returns {Array<string>} return.fullStars - 实心星星数组
   * @returns {string} return.halfStar - 半星字符串（如果有）
   * @returns {Array<string>} return.emptyStars - 空心星星数组
   * @description 将数字评分转换为星星显示格式，支持半星显示
   * @example
   * getStarDisplay(3.5) // { fullStars: ['★','★','★'], halfStar: '☆', emptyStars: ['☆'] }
   */
  getStarDisplay: (rating) => {
    const fullStars = Math.floor(rating); // 实心星数量
    const hasHalfStar = rating % 1 >= 0.5; // 是否显示半星（小数部分>=0.5）
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // 空心星数量

    return {
      fullStars: Array(fullStars).fill('★'),
      halfStar: hasHalfStar ? '☆' : '',
      emptyStars: Array(emptyStars).fill('☆')
    };
  },

  /**
   * 格式化评论时间显示
   * @param {Date|string} date - 评论创建时间
   * @returns {string} 格式化后的时间字符串
   * @description 将时间转换为相对时间格式（如"刚刚"、"5分钟前"、"3小时前"、"2天前"）或绝对日期
   * @example
   * formatTime(new Date()) // "刚刚"
   * formatTime(Date.now() - 60000) // "1分钟前"
   */
  formatTime: (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diff = now - commentDate; // 时间差（毫秒）

    // 计算各时间单位的差值
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    
    return commentDate.toLocaleDateString('zh-CN');
  }
}));