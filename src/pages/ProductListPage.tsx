import React from 'react';
import { Typography } from 'antd';
import ProductListContainer from '../components/product/ProductListContainer';

const { Title } = Typography;

const ProductListPage: React.FC = () => {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>商品管理</Title>
      </div>
      <ProductListContainer />
    </div>
  );
};

export default ProductListPage;