import React from 'react';
import { Typography, Button, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;

const ProductEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>编辑商品</Title>
        <Text type="secondary">编辑商品信息（ID: {id}）</Text>
      </div>
      
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Title level={3}>商品编辑页面</Title>
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

export default ProductEditPage;