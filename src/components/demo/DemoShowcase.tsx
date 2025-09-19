import React, { useState } from 'react';
import { Card, Button, Space, Switch, Typography, Row, Col, Tag, Alert, Tabs, Divider } from 'antd';
import { 
  DragOutlined, 
  TableOutlined, 
  QrcodeOutlined,
  EyeOutlined,
  InfiniteOutlined,
  CodeOutlined,
  SafetyOutlined,
  PictureOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import ProductTable from '../product/ProductTable';
import DragDropTable from '../product/DragDropTable';
import VirtualScrollTable from '../product/VirtualScrollTable';
import InfiniteProductList from '../product/InfiniteProductList';
import QRCodeModal from '../ui/QRCodeModal';
import ProductFormModal from '../product/ProductFormModal';
import CodeEditor from '../ui/CodeEditor';
import CaptchaInput from '../ui/CaptchaInput';
import WatermarkUpload from '../ui/WatermarkUpload';
import { Product } from '../../types';
import { useAppSelector, useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const DemoShowcase: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list: products } = useAppSelector((state) => state.products);
  const [viewMode, setViewMode] = useState<'normal' | 'drag' | 'virtual' | 'infinite'>('normal');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [codeValue, setCodeValue] = useState('// 这是一个演示代码编辑器\nconst hello = "Hello, World!";\nconsole.log(hello);');
  const [captchaValue, setCaptchaValue] = useState('');

  // 创建演示用的表格列配置
  const columns = [
    {
      title: '商品图片',
      dataIndex: 'images',
      key: 'images',
      width: 80,
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'right' as const,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
    },
  ];

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowQRModal(true);
  };

  const handleLoadMore = async () => {
    // 模拟加载更多数据
    await new Promise(resolve => setTimeout(resolve, 1000));
    dispatch(addNotification({
      type: 'success',
      message: '加载更多数据成功',
    }));
  };

  const renderTable = () => {
    const commonProps = {
      products: products.slice(0, 20), // 只显示前20个商品用于演示
      loading: false,
      selectedIds,
      onSelectionChange: setSelectedIds,
    };

    switch (viewMode) {
      case 'drag':
        return (
          <DragDropTable
            {...commonProps}
            columns={[
              { key: 'dragHandle', width: 40 },
              ...columns,
            ]}
            onProductsReorder={(reorderedProducts) => {
              console.log('Products reordered:', reorderedProducts);
              dispatch(addNotification({
                type: 'success',
                message: '商品排序已更新',
              }));
            }}
          />
        );
      
      case 'virtual':
        return (
          <VirtualScrollTable
            {...commonProps}
            columns={columns}
            height={400}
            onRowClick={handleProductSelect}
          />
        );
        
      case 'infinite':
        return (
          <InfiniteProductList
            products={products.slice(0, 50)}
            hasMore={true}
            loading={false}
            error={null}
            onLoadMore={handleLoadMore}
            onProductClick={handleProductSelect}
            onGenerateQR={handleProductSelect}
          />
        );
      
      default:
        return (
          <ProductTable
            {...commonProps}
            columns={columns}
            pagination={{
              current: 1,
              pageSize: 10,
              total: products.length,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        );
    }
  };

  return (
    <div className="demo-showcase">
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>功能演示</Title>
        <Text type="secondary">
          展示商品后台管理系统的核心功能组件
        </Text>
      </div>

      <Tabs defaultActiveKey="tables" size="large">
        {/* 表格功能演示 */}
        <TabPane tab="表格功能" key="tables">
          {/* 功能介绍 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small" className="feature-card">
                <Space>
                  <TableOutlined style={{ color: '#1890ff', fontSize: 20 }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>常规表格</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      支持分页、筛选、排序
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small" className="feature-card">
                <Space>
                  <DragOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>拖拽排序</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      直观的拖拽重新排序
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small" className="feature-card">
                <Space>
                  <EyeOutlined style={{ color: '#722ed1', fontSize: 20 }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>虚拟滚动</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      高性能大数据渲染
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small" className="feature-card">
                <Space>
                  <InfiniteOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>无限滚动</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      自动加载更多数据
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* 视图模式切换 */}
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>视图模式：</Text>
                <Space style={{ marginLeft: 16 }}>
                  <Button
                    type={viewMode === 'normal' ? 'primary' : 'default'}
                    icon={<TableOutlined />}
                    onClick={() => setViewMode('normal')}
                  >
                    常规表格
                  </Button>
                  <Button
                    type={viewMode === 'drag' ? 'primary' : 'default'}
                    icon={<DragOutlined />}
                    onClick={() => setViewMode('drag')}
                  >
                    拖拽排序
                  </Button>
                  <Button
                    type={viewMode === 'virtual' ? 'primary' : 'default'}
                    icon={<EyeOutlined />}
                    onClick={() => setViewMode('virtual')}
                  >
                    虚拟滚动
                  </Button>
                  <Button
                    type={viewMode === 'infinite' ? 'primary' : 'default'}
                    icon={<InfiniteOutlined />}
                    onClick={() => setViewMode('infinite')}
                  >
                    无限滚动
                  </Button>
                </Space>
              </div>
              
              <div>
                <Space>
                  <Tag color="blue">已选择: {selectedIds.length}</Tag>
                  <Button
                    icon={<QrcodeOutlined />}
                    onClick={() => setShowQRModal(true)}
                    disabled={products.length === 0}
                  >
                    生成二维码
                  </Button>
                  <Button
                    onClick={() => setShowFormModal(true)}
                  >
                    新增商品
                  </Button>
                </Space>
              </div>
            </div>
          </Card>

          {/* 功能说明 */}
          {viewMode === 'drag' && (
            <Alert
              message="拖拽排序模式"
              description="点击并拖拽左侧的手柄图标来重新排列商品顺序。排序结果会自动保存到服务器。"
              type="info"
              style={{ marginBottom: 16 }}
              showIcon
            />
          )}

          {viewMode === 'virtual' && (
            <Alert
              message="虚拟滚动模式"
              description="只渲染可见区域的商品项目，可以高效处理大量数据。点击商品行可以生成该商品的二维码。"
              type="info"
              style={{ marginBottom: 16 }}
              showIcon
            />
          )}

          {viewMode === 'infinite' && (
            <Alert
              message="无限滚动模式"
              description="当滚动到底部时自动加载更多数据，提供连续浏览体验。支持卡片式展示。"
              type="info"
              style={{ marginBottom: 16 }}
              showIcon
            />
          )}

          {/* 表格展示 */}
          <Card>
            {renderTable()}
          </Card>
        </TabPane>

        {/* 工具组件演示 */}
        <TabPane tab="工具组件" key="tools">
          <Row gutter={[16, 16]}>
            {/* 代码编辑器 */}
            <Col span={24}>
              <Card title={<Space><CodeOutlined />代码编辑器</Space>} style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                  支持多种语言语法高亮、自动补全、错误检测等功能
                </Text>
                <CodeEditor
                  value={codeValue}
                  onChange={(value) => setCodeValue(value || '')}
                  language="javascript"
                  height={200}
                  onSave={(value) => {
                    dispatch(addNotification({
                      type: 'success',
                      message: '代码保存成功',
                    }));
                  }}
                />
              </Card>
            </Col>

            {/* 验证码输入 */}
            <Col xs={24} lg={12}>
              <Card title={<Space><SafetyOutlined />验证码输入</Space>} style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                  支持图片验证码、自动验证、防刷新等功能
                </Text>
                <CaptchaInput
                  value={captchaValue}
                  onChange={setCaptchaValue}
                  onValidate={(isValid, token) => {
                    dispatch(addNotification({
                      type: isValid ? 'success' : 'error',
                      message: isValid ? '验证码验证成功' : '验证码验证失败',
                    }));
                  }}
                />
              </Card>
            </Col>

            {/* 二维码生成 */}
            <Col xs={24} lg={12}>
              <Card title={<Space><QrcodeOutlined />二维码生成</Space>} style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                  支持自定义内容、尺寸、颜色等配置选项
                </Text>
                <Button 
                  type="primary" 
                  icon={<QrcodeOutlined />}
                  onClick={() => setShowQRModal(true)}
                  block
                >
                  打开二维码生成器
                </Button>
              </Card>
            </Col>

            {/* 水印上传 */}
            <Col span={24}>
              <Card title={<Space><PictureOutlined />水印处理</Space>}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                  支持图片上传、水印添加、实时预览、参数调整等功能
                </Text>
                <WatermarkUpload
                  onWatermarkApplied={(url) => {
                    dispatch(addNotification({
                      type: 'success',
                      message: '水印应用成功',
                    }));
                  }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 系统信息 */}
        <TabPane tab="系统信息" key="system">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="技术栈" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div><Tag color="blue">React 18</Tag> 现代化前端框架</div>
                  <div><Tag color="green">TypeScript</Tag> 类型安全的JavaScript</div>
                  <div><Tag color="purple">Ant Design 5</Tag> 企业级UI组件库</div>
                  <div><Tag color="orange">Redux Toolkit</Tag> 状态管理</div>
                  <div><Tag color="cyan">React Router 6</Tag> 路由管理</div>
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="已实现功能" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>✅ 拖拽排序表格</div>
                  <div>✅ 虚拟滚动表格</div>
                  <div>✅ 无限滚动列表</div>
                  <div>✅ 二维码生成</div>
                  <div>✅ 代码编辑器</div>
                  <div>✅ 验证码输入</div>
                  <div>✅ 水印处理</div>
                  <div>✅ 响应式设计</div>
                </Space>
              </Card>
            </Col>

            <Col span={24}>
              <Card title="项目统计">
                <Row gutter={16}>
                  <Col xs={12} sm={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>30+</div>
                      <div>核心组件</div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>5000+</div>
                      <div>代码行数</div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>8</div>
                      <div>功能模块</div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>15+</div>
                      <div>API接口</div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* 模态框 */}
      <QRCodeModal
        product={selectedProduct}
        visible={showQRModal}
        onCancel={() => {
          setShowQRModal(false);
          setSelectedProduct(undefined);
        }}
      />

      <ProductFormModal
        visible={showFormModal}
        onCancel={() => setShowFormModal(false)}
        onSuccess={() => {
          setShowFormModal(false);
          dispatch(addNotification({
            type: 'success',
            message: '商品创建成功',
          }));
        }}
      />
    </div>
  );
};

export default DemoShowcase; style={{ fontWeight: 500 }}>常规表格</div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  支持分页、筛选、排序
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small">
            <Space>
              <DragOutlined style={{ color: '#52c41a', fontSize: 20 }} />
              <div>
                <div style={{ fontWeight: 500 }}>拖拽排序</div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  直观的拖拽重新排序
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small">
            <Space>
              <EyeOutlined style={{ color: '#722ed1', fontSize: 20 }} />
              <div>
                <div style={{ fontWeight: 500 }}>虚拟滚动</div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  高性能大数据渲染
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 视图模式切换 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text strong>视图模式：</Text>
            <Space style={{ marginLeft: 16 }}>
              <Button
                type={viewMode === 'normal' ? 'primary' : 'default'}
                icon={<TableOutlined />}
                onClick={() => setViewMode('normal')}
              >
                常规表格
              </Button>
              <Button
                type={viewMode === 'drag' ? 'primary' : 'default'}
                icon={<DragOutlined />}
                onClick={() => setViewMode('drag')}
              >
                拖拽排序
              </Button>
              <Button
                type={viewMode === 'virtual' ? 'primary' : 'default'}
                icon={<EyeOutlined />}
                onClick={() => setViewMode('virtual')}
              >
                虚拟滚动
              </Button>
            </Space>
          </div>
          
          <div>
            <Space>
              <Tag color="blue">已选择: {selectedIds.length}</Tag>
              <Button
                icon={<QrcodeOutlined />}
                onClick={() => setShowQRModal(true)}
                disabled={products.length === 0}
              >
                生成二维码
              </Button>
            </Space>
          </div>
        </div>
      </Card>

      {/* 功能说明 */}
      {viewMode === 'drag' && (
        <Alert
          message="拖拽排序模式"
          description="点击并拖拽左侧的手柄图标来重新排列商品顺序。排序结果会自动保存到服务器。"
          type="info"
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}

      {viewMode === 'virtual' && (
        <Alert
          message="虚拟滚动模式"
          description="只渲染可见区域的商品项目，可以高效处理大量数据。点击商品行可以生成该商品的二维码。"
          type="info"
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}

      {/* 表格展示 */}
      <Card>
        {renderTable()}
      </Card>

      {/* 二维码模态框 */}
      <QRCodeModal
        product={selectedProduct}
        visible={showQRModal}
        onCancel={() => {
          setShowQRModal(false);
          setSelectedProduct(undefined);
        }}
      />
    </div>
  );
};

export default DemoShowcase;