import { create } from 'zustand';
import { mockComments } from '../data/mockData.js';

// 评论状态管理
export const useCommentStore = create((set, get) => ({
  // 状态
  comments: [],
  currentPage: 1,
  totalPages: 1,
  totalComments: 0,
  filterOptions: {
    rating: null,
    sortBy: 'newest', // newest, oldest, helpful, rating_desc, rating_asc
    hasImages: false
  },
  loading: false,
  error: null,

  // 动作
  loadComments: async (productId, page = 1, filters = {}) => {
    set({ loading: true, error: null });
    try {
      // 模拟API调用
      setTimeout(() => {
        let filteredComments = mockComments.filter(comment => 
          comment.productId === productId
        );

        // 应用筛选器
        if (filters.rating) {
          filteredComments = filteredComments.filter(comment => 
            comment.rating >= filters.rating
          );
        }

        if (filters.hasImages) {
          filteredComments = filteredComments.filter(comment => 
            comment.images && comment.images.length > 0
          );
        }

        // 排序
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

        // 分页
        const pageSize = 10;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedComments = filteredComments.slice(startIndex, endIndex);

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

  addComment: async (commentData) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      ...commentData,
      createdAt: new Date(),
      likesCount: 0
    };

    // 这里应该发送到服务器
    // 模拟添加成功后更新本地状态
    const { comments, totalComments } = get();
    set({
      comments: [newComment, ...comments],
      totalComments: totalComments + 1
    });

    return newComment;
  },

  updateComment: async (commentId, updateData) => {
    const { comments } = get();
    const updatedComments = comments.map(comment =>
      comment.id === commentId
        ? { ...comment, ...updateData }
        : comment
    );
    set({ comments: updatedComments });
  },

  deleteComment: async (commentId) => {
    const { comments, totalComments } = get();
    const updatedComments = comments.filter(comment => comment.id !== commentId);
    set({
      comments: updatedComments,
      totalComments: totalComments - 1
    });
  },

  likeComment: async (commentId) => {
    const { comments } = get();
    const updatedComments = comments.map(comment =>
      comment.id === commentId
        ? { ...comment, likesCount: comment.likesCount + 1 }
        : comment
    );
    set({ comments: updatedComments });
  },

  unlikeComment: async (commentId) => {
    const { comments } = get();
    const updatedComments = comments.map(comment =>
      comment.id === commentId
        ? { ...comment, likesCount: Math.max(0, comment.likesCount - 1) }
        : comment
    );
    set({ comments: updatedComments });
  },

  setFilter: (filterKey, value) => {
    const { filterOptions } = get();
    set({
      filterOptions: {
        ...filterOptions,
        [filterKey]: value
      }
    });
  },

  clearFilters: () => {
    set({
      filterOptions: {
        rating: null,
        sortBy: 'newest',
        hasImages: false
      }
    });
  },

  getCommentSummary: () => {
    const { comments } = get();
    const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
    const averageRating = comments.length > 0 ? totalRating / comments.length : 0;

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

  // 获取评分星星显示
  getStarDisplay: (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return {
      fullStars: Array(fullStars).fill('★'),
      halfStar: hasHalfStar ? '☆' : '',
      emptyStars: Array(emptyStars).fill('☆')
    };
  },

  // 格式化时间显示
  formatTime: (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diff = now - commentDate;

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