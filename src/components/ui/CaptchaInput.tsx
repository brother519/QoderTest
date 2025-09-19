import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Space, message, Spin } from 'antd';
import { ReloadOutlined, SafetyOutlined } from '@ant-design/icons';
import { captchaAPI } from '../../services/api/captchaAPI';
import { CaptchaData } from '../../types';
import { CAPTCHA_CONFIG } from '../../constants';

interface CaptchaInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onValidate?: (isValid: boolean, token: string) => void;
  size?: 'small' | 'middle' | 'large';
  placeholder?: string;
  disabled?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
  style?: React.CSSProperties;
}

const CaptchaInput: React.FC<CaptchaInputProps> = ({
  value,
  onChange,
  onValidate,
  size = 'middle',
  placeholder = '请输入验证码',
  disabled = false,
  autoRefresh = false,
  refreshInterval = 5 * 60 * 1000, // 5分钟
  className = '',
  style,
}) => {
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [attempts, setAttempts] = useState(0);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 获取验证码
  const fetchCaptcha = async () => {
    setLoading(true);
    try {
      const response = await captchaAPI.getCaptcha();
      setCaptchaData(response.data);
      
      // 清除之前的定时器
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      
      // 如果启用自动刷新，设置定时器
      if (autoRefresh) {
        refreshTimerRef.current = setTimeout(() => {
          fetchCaptcha();
        }, refreshInterval);
      }
    } catch (error) {
      message.error('获取验证码失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 验证验证码
  const validateCaptcha = async (code: string, token: string) => {
    if (!code || code.length !== CAPTCHA_CONFIG.LENGTH) {
      return false;
    }

    try {
      const response = await captchaAPI.verifyCaptcha(token, code);
      return response.data;
    } catch (error) {
      return false;
    }
  };

  // 处理输入变化
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setInputValue(newValue);
    onChange?.(newValue);

    // 如果输入完整验证码，自动验证
    if (newValue.length === CAPTCHA_CONFIG.LENGTH && captchaData) {
      const isValid = await validateCaptcha(newValue, captchaData.token);
      onValidate?.(isValid, captchaData.token);
      
      if (!isValid) {
        setAttempts(prev => prev + 1);
        
        // 超过最大尝试次数，刷新验证码
        if (attempts + 1 >= CAPTCHA_CONFIG.MAX_ATTEMPTS) {
          message.warning('验证失败次数过多，已刷新验证码');
          await fetchCaptcha();
          setAttempts(0);
          setInputValue('');
          onChange?.('');
        } else {
          message.error('验证码错误，请重新输入');
        }
      } else {
        message.success('验证码验证成功');
      }
    }
  };

  // 手动刷新验证码
  const handleRefresh = () => {
    fetchCaptcha();
    setInputValue('');
    onChange?.('');
    setAttempts(0);
  };

  // 点击图片刷新验证码
  const handleImageClick = () => {
    if (!loading) {
      handleRefresh();
    }
  };

  // 初始化获取验证码
  useEffect(() => {
    fetchCaptcha();
    
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  // 监听外部value变化
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // 检查验证码是否过期
  const isCaptchaExpired = () => {
    if (!captchaData) return true;
    return Date.now() > captchaData.expiry;
  };

  // 获取剩余时间
  const getRemainingTime = () => {
    if (!captchaData) return 0;
    const remaining = Math.max(0, captchaData.expiry - Date.now());
    return Math.floor(remaining / 1000);
  };

  const [remainingTime, setRemainingTime] = useState(0);

  // 更新剩余时间
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getRemainingTime();
      setRemainingTime(remaining);
      
      // 如果过期且启用自动刷新，自动获取新验证码
      if (remaining <= 0 && autoRefresh && captchaData) {
        fetchCaptcha();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [captchaData, autoRefresh]);

  return (
    <div className={`captcha-container ${className}`} style={style}>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          prefix={<SafetyOutlined />}
          size={size}
          disabled={disabled || loading}
          maxLength={CAPTCHA_CONFIG.LENGTH}
          style={{ flex: 1 }}
          status={isCaptchaExpired() ? 'warning' : undefined}
        />
        
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 8 }}>
          {loading ? (
            <div style={{ 
              width: CAPTCHA_CONFIG.WIDTH, 
              height: CAPTCHA_CONFIG.HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              background: '#fafafa'
            }}>
              <Spin size="small" />
            </div>
          ) : captchaData ? (
            <img
              src={captchaData.image}
              alt="验证码"
              className="captcha-image"
              style={{
                width: CAPTCHA_CONFIG.WIDTH,
                height: CAPTCHA_CONFIG.HEIGHT,
                cursor: 'pointer',
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                opacity: isCaptchaExpired() ? 0.5 : 1,
              }}
              onClick={handleImageClick}
              title="点击刷新验证码"
            />
          ) : (
            <div style={{ 
              width: CAPTCHA_CONFIG.WIDTH, 
              height: CAPTCHA_CONFIG.HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              background: '#fafafa',
              color: '#999',
              fontSize: 12
            }}>
              获取失败
            </div>
          )}
          
          <Button
            type="link"
            size="small"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
            disabled={disabled}
            title="刷新验证码"
            style={{ marginLeft: 4 }}
          >
            刷新
          </Button>
        </div>
      </Space.Compact>
      
      {/* 验证码信息 */}
      <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
        <Space split="|">
          {captchaData && !isCaptchaExpired() && (
            <span>剩余时间: {remainingTime}s</span>
          )}
          
          {attempts > 0 && (
            <span>
              已尝试 {attempts}/{CAPTCHA_CONFIG.MAX_ATTEMPTS} 次
            </span>
          )}
          
          {isCaptchaExpired() && (
            <span style={{ color: '#fa8c16' }}>验证码已过期，请刷新</span>
          )}
          
          <span style={{ color: '#999' }}>
            点击图片可刷新
          </span>
        </Space>
      </div>
    </div>
  );
};

export default CaptchaInput;