import React from 'react';
import { Row, Col, Card, Statistic, Typography, Progress, Space, Tag, List, Tabs } from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  TrendingUpOutlined,
  WarningOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import DemoShowcase from '../components/demo/DemoShowcase';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const DashboardPage: React.FC = () => {
  // 模拟统计数据
  const stats = {
    totalProducts: 1247,
    totalSales: 125680.50,
    totalUsers: 8934,
    totalOrders: 2186,
    todayOrders: 43,
    lowStockProducts: 15,
  };

  // 模拟最近活动数据
  const recentActivities = [
    { id: 1, type: 'order', content: '新订单：#ORDER-2024-001', time: '5分钟前' },
    { id: 2, type: 'product', content: '商品上架：iPhone 15 Pro', time: '15分钟前' },
    { id: 3, type: 'user', content: '新用户注册：张三', time: '1小时前' },
    { id: 4, type: 'stock', content: '库存警告：MacBook Air 库存不足', time: '2小时前' },
  ];

  const getActivityIcon = (type: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      order: <ShoppingCartOutlined style={{ color: '#52c41a' }} />,
      product: <ShoppingOutlined style={{ color: '#1890ff' }} />,
      user: <UserOutlined style={{ color: '#722ed1' }} />,
      stock: <WarningOutlined style={{ color: '#fa8c16' }} />,
    };
    return iconMap[type] || <ShoppingOutlined />;
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>仪表盘</Title>
        <Text type="secondary">欢迎回来！这里是您的业务概览</Text>
      </div>

      <Tabs defaultActiveKey="overview" size="large">
        <TabPane tab="数据概览" key="overview">
          {/* 统计卡片 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="商品总数"
                  value={stats.totalProducts}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="总销售额"
                  value={stats.totalSales}
                  prefix={<DollarOutlined />}
                  precision={2}
                  valueStyle={{ color: '#52c41a' }}
                  suffix="元"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="用户总数"
                  value={stats.totalUsers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="订单总数"
                  value={stats.totalOrders}
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {/* 今日数据 */}
            <Col xs={24} lg={12}>
              <Card title="今日数据" extra={<Tag color="green">实时</Tag>}>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text>今日订单</Text>
                      <Text strong>{stats.todayOrders}</Text>
                    </div>
                    <Progress percent={75} size="small" showInfo={false} />
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text>今日销售额</Text>
                      <Text strong>¥15,680</Text>
                    </div>
                    <Progress percent={60} size="small" showInfo={false} strokeColor="#52c41a" />
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text>新增用户</Text>
                      <Text strong>28</Text>
                    </div>
                    <Progress percent={45} size="small" showInfo={false} strokeColor="#722ed1" />
                  </div>
                </Space>
              </Card>
            </Col>

            {/* 库存警告 */}
            <Col xs={24} lg={12}>
              <Card 
                title="库存预警" 
                extra={
                  <Space>
                    <Tag color="orange">{stats.lowStockProducts} 个商品</Tag>
                    <TrendingUpOutlined />
                  </Space>
                }
              >
                <List
                  size="small"
                  dataSource={[
                    { name: 'iPhone 15 Pro', stock: 5, minStock: 10 },
                    { name: 'MacBook Air M2', stock: 3, minStock: 8 },
                    { name: 'AirPods Pro', stock: 8, minStock: 15 },
                    { name: 'iPad Air', stock: 2, minStock: 10 },
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Text>{item.name}</Text>
                        <Space>
                          <Text type="danger">剩余 {item.stock}</Text>
                          <Text type="secondary">/ 最少 {item.minStock}</Text>
                        </Space>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          {/* 最近活动 */}
          <Row style={{ marginTop: 16 }}>
            <Col span={24}>
              <Card title="最近活动" extra={<Tag>实时更新</Tag>}>
                <List
                  dataSource={recentActivities}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={getActivityIcon(item.type)}
                        title={item.content}
                        description={item.time}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <ExperimentOutlined />
              功能演示
            </span>
          } 
          key="demo"
        >
          <DemoShowcase />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default DashboardPage;