import React, { useState } from 'react';
import { Card, Form, Input, Button, Checkbox, Alert, Space, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store';
import { login } from '../store/slices/authSlice';
import { addNotification } from '../store/slices/uiSlice';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [captchaData, setCaptchaData] = useState<any>(null);

  const handleLogin = async (values: any) => {
    try {
      await dispatch(login({
        username: values.username,
        password: values.password,
        captcha: values.captcha,
      })).unwrap();

      dispatch(addNotification({
        type: 'success',
        message: '登录成功！',
      }));

      navigate('/dashboard');
    } catch (error) {
      // 错误已在 Redux 中处理
    }
  };

  const refreshCaptcha = () => {
    // 模拟刷新验证码
    setCaptchaData({
      image: `data:image/svg+xml;base64,${btoa('<svg width="120" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="40" fill="#f0f0f0"/><text x="60" y="25" text-anchor="middle" fill="#333" font-family="Arial" font-size="16">A8K9</text></svg>')}`,
      token: Math.random().toString(36).substring(2, 15),
    });
  };

  React.useEffect(() => {
    refreshCaptcha();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            商品管理系统
          </Title>
          <Text type="secondary">请登录您的账户</Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item
                name="captcha"
                rules={[{ required: true, message: '请输入验证码!' }]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Input
                  prefix={<SafetyOutlined />}
                  placeholder="验证码"
                  maxLength={4}
                />
              </Form.Item>
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: 8 }}>
                <img
                  src={captchaData?.image}
                  alt="验证码"
                  style={{
                    height: 40,
                    cursor: 'pointer',
                    border: '1px solid #d9d9d9',
                    borderRadius: 4,
                  }}
                  onClick={refreshCaptcha}
                />
              </div>
            </Space.Compact>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <Button type="link" style={{ padding: 0 }}>
                忘记密码？
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            演示账户：admin / admin123
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;