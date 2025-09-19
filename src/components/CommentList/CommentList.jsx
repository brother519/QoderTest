import React, { useState, useEffect } from 'react';
import { useCommentStore } from '../../store/commentStore.js';
import { StarIcon, ThumbsUpIcon, ImageIcon, FilterIcon } from 'lucide-react';

const CommentList = ({ productId, className = '' }) => {
  const {
    comments,
    currentPage,
    totalPages,
    totalComments,
    filterOptions,
    loading,
    loadComments,
    likeComment,
    setFilter,
    getCommentSummary,
    getStarDisplay,
    formatTime
  } = useCommentStore();

  const [showFilters, setShowFilters] = useState(false);
  const summary = getCommentSummary();

  useEffect(() => {
    if (productId) {
      loadComments(productId, 1, filterOptions);
    }
  }, [productId, loadComments]);

  const handleFilterChange = (key, value) => {
    setFilter(key, value);
    loadComments(productId, 1, { ...filterOptions, [key]: value });
  };

  const handlePageChange = (page) => {
    loadComments(productId, page, filterOptions);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          size={16}
          className={i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* 评论统计 */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">用户评价 ({totalComments})</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
          >
            <FilterIcon size={16} />
            筛选
          </button>
        </div>

        {/* 评分概览 */}
        <div className="flex items-center gap-4 mb-4">
          <div className="text-3xl font-bold text-yellow-500">{summary.averageRating}</div>
          <div>
            <div className="flex items-center mb-1">
              {renderStars(summary.averageRating)}
            </div>
            <div className="text-sm text-gray-500">基于 {totalComments} 条评价</div>
          </div>
        </div>

        {/* 评分分布 */}
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = summary.ratingDistribution[rating] || 0;
            const percentage = totalComments > 0 ? (count / totalComments) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-2 text-sm">
                <span className="w-8">{rating}星</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-gray-500">{count}</span>
              </div>
            );
          })}
        </div>

        {/* 筛选器 */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 评分筛选 */}
              <div>
                <label className="block text-sm font-medium mb-2">最低评分</label>
                <select
                  value={filterOptions.rating || ''}
                  onChange={(e) => handleFilterChange('rating', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">全部</option>
                  <option value="5">5星</option>
                  <option value="4">4星及以上</option>
                  <option value="3">3星及以上</option>
                  <option value="2">2星及以上</option>
                  <option value="1">1星及以上</option>
                </select>
              </div>

              {/* 排序方式 */}
              <div>
                <label className="block text-sm font-medium mb-2">排序方式</label>
                <select
                  value={filterOptions.sortBy || 'newest'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="newest">最新</option>
                  <option value="oldest">最早</option>
                  <option value="helpful">最有帮助</option>
                  <option value="rating_desc">评分高到低</option>
                  <option value="rating_asc">评分低到高</option>
                </select>
              </div>

              {/* 图片筛选 */}
              <div>
                <label className="block text-sm font-medium mb-2">内容类型</label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filterOptions.hasImages || false}
                    onChange={(e) => handleFilterChange('hasImages', e.target.checked)}
                    className="mr-2"
                  />
                  有图评价
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 评论列表 */}
      <div className="divide-y">
        {comments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>暂无评价</p>
            <p className="text-sm mt-1">成为第一个评价的用户吧！</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-6">
              {/* 用户信息 */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={comment.userInfo.avatar}
                  alt={comment.userInfo.username}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-medium">{comment.userInfo.username}</div>
                  <div className="text-sm text-gray-500">{formatTime(comment.createdAt)}</div>
                </div>
              </div>

              {/* 评分 */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">{renderStars(comment.rating)}</div>
                <span className="text-sm text-gray-600">{comment.rating}/5</span>
              </div>

              {/* 评论内容 */}
              <p className="text-gray-700 mb-3">{comment.content}</p>

              {/* 评论图片 */}
              {comment.images && comment.images.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {comment.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`评论图片 ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border flex-shrink-0"
                    />
                  ))}
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => likeComment(comment.id)}
                  className="flex items-center gap-1 text-gray-500 hover:text-blue-600 text-sm"
                >
                  <ThumbsUpIcon size={16} />
                  有用 ({comment.likesCount})
                </button>
                {comment.images && comment.images.length > 0 && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <ImageIcon size={16} />
                    {comment.images.length}张图片
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            第 {currentPage} 页，共 {totalPages} 页
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentList;