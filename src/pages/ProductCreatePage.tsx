import React from 'react';
import { Typography, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>新增商品</Title>
        <Text type="secondary">创建新的商品信息</Text>
      </div>
      
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Title level={3}>商品创建页面</Title>
        <Text type="secondary">此页面正在开发中...</Text>
        <br />
        <Space style={{ marginTop: 24 }}>
          <Button type="primary" onClick={() => navigate('/products/list')}>
            返回商品列表
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default ProductCreatePage;