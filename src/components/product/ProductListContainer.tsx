import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Input, 
  Select, 
  Button, 
  Space, 
  Row, 
  Col, 
  Slider, 
  Tag,
  message,
  Modal
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
  ExportOutlined,
  FilterOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchProducts,
  setFilters,
  setPagination,
  setSelectedIds,
  deleteProduct,
} from '../../store/slices/productsSlice';
import { openModal, addNotification } from '../../store/slices/uiSlice';
import { Product, SearchFilters } from '../../types';
import ProductTable from './ProductTable';
import { PAGINATION_CONFIG, PRODUCT_STATUS_OPTIONS } from '../../constants';
import { productAPI } from '../../services/api/productAPI';

const { Option } = Select;
const { CheckableTag } = Tag;

const ProductListContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list, pagination, filters, loading, selectedIds } = useAppSelector(
    (state) => state.products
  );

  // 本地状态
  const [searchKeyword, setSearchKeyword] = useState(filters.keyword || '');
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>(filters.priceRange || [0, 1000]);

  // 初始化加载数据
  useEffect(() => {
    loadData();
    loadCategories();
    loadTags();
  }, []);

  // 监听筛选条件和分页变化
  useEffect(() => {
    loadData();
  }, [filters, pagination.page, pagination.pageSize]);

  const loadData = async () => {
    try {
      await dispatch(fetchProducts({ pagination, filters })).unwrap();
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: '加载商品列表失败',
      }));
    }
  };

  const loadCategories = async () => {
    try {
      const response = await productAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await productAPI.getTags();
      setTags(response.data);
    } catch (error) {
      console.error('加载标签失败:', error);
    }
  };

  // 搜索处理
  const handleSearch = (value: string) => {
    dispatch(setFilters({ ...filters, keyword: value }));
  };

  // 筛选处理
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    dispatch(setFilters({ ...filters, [key]: value }));
  };

  // 清除筛选条件
  const handleClearFilters = () => {
    setSearchKeyword('');
    setPriceRange([0, 1000]);
    dispatch(setFilters({}));
  };

  // 刷新数据
  const handleRefresh = () => {
    loadData();
    dispatch(addNotification({
      type: 'success',
      message: '数据已刷新',
    }));
  };

  // 新增商品
  const handleAddProduct = () => {
    dispatch(openModal('productForm'));
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      message.warning('请选择要删除的商品');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedIds.length} 个商品吗？此操作不可恢复。`,
      okType: 'danger',
      onOk: async () => {
        try {
          // 批量删除
          await Promise.all(selectedIds.map(id => dispatch(deleteProduct(id)).unwrap()));
          dispatch(setSelectedIds([]));
          dispatch(addNotification({
            type: 'success',
            message: `成功删除 ${selectedIds.length} 个商品`,
          }));
        } catch (error) {
          dispatch(addNotification({
            type: 'error',
            message: '删除商品失败',
          }));
        }
      },
    });
  };

  // 导出数据
  const handleExport = () => {
    // 模拟导出功能
    dispatch(addNotification({
      type: 'info',
      message: '导出功能开发中...',
    }));
  };

  // 分页处理
  const handlePaginationChange = (page: number, pageSize?: number) => {
    dispatch(setPagination({ 
      page, 
      pageSize: pageSize || pagination.pageSize 
    }));
  };

  return (
    <div className="product-list-container">
      {/* 搜索和筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input.Search
              placeholder="搜索商品名称、SKU..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearch}
              allowClear
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="选择分类"
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
              allowClear
              style={{ width: '100%' }}
            >
              {categories.map(category => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="商品状态"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
              style={{ width: '100%' }}
            >
              {PRODUCT_STATUS_OPTIONS.map(status => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                高级筛选
              </Button>
              <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
                清除筛选
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 高级筛选区域 */}
        {showAdvancedFilters && (
          <div style={{ marginTop: 16, padding: 16, background: '#fafafa', borderRadius: 6 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8 }}>价格区间：</label>
                  <Slider
                    range
                    min={0}
                    max={1000}
                    value={priceRange}
                    onChange={setPriceRange}
                    onAfterChange={(value) => handleFilterChange('priceRange', value)}
                    marks={{
                      0: '¥0',
                      500: '¥500',
                      1000: '¥1000+',
                    }}
                  />
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8 }}>标签筛选：</label>
                  <div>
                    {tags.map(tag => (
                      <CheckableTag
                        key={tag}
                        checked={filters.tags?.includes(tag) || false}
                        onChange={(checked) => {
                          const newTags = checked
                            ? [...(filters.tags || []), tag]
                            : (filters.tags || []).filter(t => t !== tag);
                          handleFilterChange('tags', newTags);
                        }}
                      >
                        {tag}
                      </CheckableTag>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* 操作工具栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddProduct}
              >
                新增商品
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
                disabled={selectedIds.length === 0}
              >
                批量删除 {selectedIds.length > 0 && `(${selectedIds.length})`}
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                导出数据
              </Button>
            </Space>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              刷新
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 商品表格 */}
      <Card>
        <ProductTable
          products={list}
          loading={loading}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          pagination={{
            ...pagination,
            ...PAGINATION_CONFIG,
            onChange: handlePaginationChange,
          }}
        />
      </Card>
    </div>
  );
};

export default ProductListContainer;