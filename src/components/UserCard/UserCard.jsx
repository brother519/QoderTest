import React from 'react';
import { useUserStore } from '../../store/userStore.js';
import { UserIcon, SettingsIcon, LogOutIcon, ShoppingBagIcon } from 'lucide-react';

const UserCard = ({ className = '' }) => {
  const { user, isLoggedIn, quickActions, logout, getUserStats } = useUserStore();
  const stats = getUserStats();

  if (!isLoggedIn || !user) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <UserIcon size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">未登录</h3>
          <p className="text-gray-600 mb-4">登录后享受更多功能</p>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            立即登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* 用户基本信息 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-16 h-16 rounded-full border-2 border-white"
          />
          <div>
            <h3 className="text-xl font-bold">{user.username}</h3>
            <p className="text-blue-100">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-medium">
                {user.memberLevel}
              </span>
            </div>
          </div>
        </div>
        {user.profile && (
          <p className="mt-3 text-blue-100">{user.profile}</p>
        )}
      </div>

      {/* 用户统计 */}
      {stats && (
        <div className="p-4 bg-gray-50 border-b">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-blue-600">{stats.totalOrders}</div>
              <div className="text-xs text-gray-600">订单数</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">¥{stats.totalSpent.toLocaleString()}</div>
              <div className="text-xs text-gray-600">总消费</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-600">{stats.loyaltyPoints}</div>
              <div className="text-xs text-gray-600">积分</div>
            </div>
          </div>
        </div>
      )}

      {/* 快捷操作 */}
      <div className="p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">快捷操作</h4>
        <div className="space-y-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => {
                // 这里应该处理路由跳转
                console.log(`跳转到: ${action.path}`);
              }}
            >
              <span className="text-lg">{action.icon}</span>
              <span className="text-gray-700">{action.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 退出登录 */}
      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOutIcon size={16} />
          退出登录
        </button>
      </div>
    </div>
  );
};

export default UserCard;