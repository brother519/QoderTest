import React from 'react';
import { Layout, Typography } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

const Footer: React.FC = () => {
  return (
    <AntFooter style={{ textAlign: 'center', padding: '12px 50px' }}>
      <Text type=\"secondary\">
        商品后台管理系统 ©2024 Created by Your Company
      </Text>
    </AntFooter>
  );
};

export default Footer;