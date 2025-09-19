import React from 'react';
import { Layout, Button, Avatar, Dropdown, Space, Switch, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleSidebar, setTheme } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sidebarCollapsed, theme } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleThemeChange = (checked: boolean) => {
    dispatch(setTheme(checked ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: '个人资料',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: '设置',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: theme === 'dark' ? '#001529' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type=\"text\"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={handleToggleSidebar}
          style={{
            fontSize: '16px',
            width: 64,
            height: 64,
          }}
        />
        <Text strong style={{ fontSize: '18px', marginLeft: '16px' }}>
          商品后台管理系统
        </Text>
      </div>

      <Space size=\"middle\">
        <Space>
          <BulbOutlined />
          <Switch
            checked={theme === 'dark'}
            onChange={handleThemeChange}
            checkedChildren=\"🌙\"
            unCheckedChildren=\"☀️\"
            size=\"small\"
          />
        </Space>

        <Button type=\"text\" icon={<BellOutlined />} />

        <Dropdown menu={{ items: userMenuItems }} placement=\"bottomRight\">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              size=\"small\"
              src={user?.avatar}
              icon={<UserOutlined />}
            />
            <Text>{user?.username || '管理员'}</Text>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;