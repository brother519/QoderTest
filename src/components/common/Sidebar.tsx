import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  UserOutlined,
  SettingOutlined,
  TagsOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps['items'] = [
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: '商品管理',
      children: [
        {
          key: '/products/list',
          label: '商品列表',
        },
        {
          key: '/products/create',
          label: '新增商品',
        },
        {
          key: '/products/categories',
          label: '商品分类',
        },
      ],
    },
    {
      key: '/inventory',
      icon: <InboxOutlined />,
      label: '库存管理',
    },
    {
      key: '/orders',
      icon: <AppstoreOutlined />,
      label: '订单管理',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: '数据分析',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '/tags',
      icon: <TagsOutlined />,
      label: '标签管理',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const pathname = location.pathname;
    if (pathname.startsWith('/products')) {
      return pathname === '/products' ? ['/products/list'] : [pathname];
    }
    return [pathname];
  };

  // 获取当前展开的菜单项
  const getOpenKeys = () => {
    const pathname = location.pathname;
    if (pathname.startsWith('/products')) {
      return ['/products'];
    }
    return [];
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        {!collapsed && (
          <h2 style={{ color: '#fff', margin: 0 }}>
            PMS
          </h2>
        )}
        {collapsed && (
          <ShoppingOutlined style={{ color: '#fff', fontSize: '24px' }} />
        )}
      </div>
      <Menu
        theme=\"dark\"
        mode=\"inline\"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};

export default Sidebar;