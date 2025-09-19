import React, { useState, useRef, useEffect, useCallback } from 'react';
import './CaptchaInput.css';

interface CaptchaConfig {
  length: number;
  includeNumbers: boolean;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeSpecial: boolean;
}

const CaptchaInput: React.FC = () => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [config, setConfig] = useState<CaptchaConfig>({
    length: 5,
    includeNumbers: true,
    includeUppercase: true,
    includeLowercase: false,
    includeSpecial: false,
  });

  // 生成随机验证码
  const generateCaptcha = useCallback(() => {
    let chars = '';
    if (config.includeNumbers) chars += '0123456789';
    if (config.includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (config.includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (config.includeSpecial) chars += '!@#$%^&*';
    
    if (chars === '') chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // 默认字符集
    
    let result = '';
    for (let i = 0; i < config.length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, [config]);

  // 绘制验证码到画布
  const drawCaptcha = useCallback((text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 设置背景渐变
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(1, '#e9ecef');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 添加噪点
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }
    
    // 添加干扰线
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    
    // 绘制文字
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    ctx.font = 'bold 24px Arial';
    ctx.textBaseline = 'middle';
    
    const letterSpacing = canvas.width / (text.length + 1);
    
    for (let i = 0; i < text.length; i++) {
      const x = letterSpacing * (i + 1);
      const y = canvas.height / 2 + (Math.random() - 0.5) * 10;
      
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.5);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  }, []);

  // 刷新验证码
  const refreshCaptcha = useCallback(() => {
    const newCaptcha = generateCaptcha();
    setCaptchaText(newCaptcha);
    drawCaptcha(newCaptcha);
    setUserInput('');
    setIsVerified(null);
  }, [generateCaptcha, drawCaptcha]);

  // 验证输入
  const verifyCaptcha = async () => {
    setIsLoading(true);
    
    // 模拟验证延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const isCorrect = userInput.toLowerCase() === captchaText.toLowerCase();
    setIsVerified(isCorrect);
    setAttempts(prev => prev + 1);
    setIsLoading(false);
    
    if (!isCorrect) {
      setTimeout(refreshCaptcha, 1500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.length === config.length) {
      verifyCaptcha();
    }
  };

  const updateConfig = (key: keyof CaptchaConfig, value: boolean | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // 初始化验证码
  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  return (
    <div className="captcha-container">
      <h2>验证码输入验证</h2>
      <p className="description">
        安全验证组件，防止自动化程序滥用，保护系统安全
      </p>

      <div className="captcha-demo">
        <div className="captcha-section">
          <h3>验证码设置</h3>
          <div className="config-panel">
            <div className="config-item">
              <label>长度:</label>
              <input
                type="range"
                min="4"
                max="8"
                value={config.length}
                onChange={(e) => updateConfig('length', parseInt(e.target.value))}
              />
              <span>{config.length}</span>
            </div>
            <div className="config-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.includeNumbers}
                  onChange={(e) => updateConfig('includeNumbers', e.target.checked)}
                />
                包含数字
              </label>
            </div>
            <div className="config-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.includeUppercase}
                  onChange={(e) => updateConfig('includeUppercase', e.target.checked)}
                />
                包含大写字母
              </label>
            </div>
            <div className="config-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.includeLowercase}
                  onChange={(e) => updateConfig('includeLowercase', e.target.checked)}
                />
                包含小写字母
              </label>
            </div>
            <div className="config-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.includeSpecial}
                  onChange={(e) => updateConfig('includeSpecial', e.target.checked)}
                />
                包含特殊字符
              </label>
            </div>
          </div>
          <button onClick={refreshCaptcha} className="refresh-btn">
            🔄 重新生成
          </button>
        </div>

        <div className="verification-section">
          <h3>验证码验证</h3>
          <div className="captcha-display">
            <canvas
              ref={canvasRef}
              width="200"
              height="60"
              className="captcha-canvas"
            />
          </div>
          
          <form onSubmit={handleSubmit} className="captcha-form">
            <div className="input-group">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.slice(0, config.length))}
                placeholder={`请输入${config.length}位验证码`}
                className={`captcha-input ${
                  isVerified === true ? 'success' : 
                  isVerified === false ? 'error' : ''
                }`}
                maxLength={config.length}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="verify-btn"
                disabled={userInput.length !== config.length || isLoading}
              >
                {isLoading ? '验证中...' : '验证'}
              </button>
            </div>
          </form>

          <div className="verification-status">
            {isLoading && (
              <div className="status loading">
                <div className="spinner-small"></div>
                <span>正在验证...</span>
              </div>
            )}
            
            {isVerified === true && (
              <div className="status success">
                <span className="icon">✅</span>
                <span>验证成功！</span>
              </div>
            )}
            
            {isVerified === false && (
              <div className="status error">
                <span className="icon">❌</span>
                <span>验证失败，验证码不正确</span>
              </div>
            )}
          </div>

          <div className="stats">
            <div className="stat-item">
              <label>尝试次数:</label>
              <span>{attempts}</span>
            </div>
            <div className="stat-item">
              <label>正确答案:</label>
              <span className="answer">{captchaText}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="captcha-info">
        <h4>💡 验证码功能特点：</h4>
        <ul>
          <li>支持多种字符类型组合（数字、大小写字母、特殊字符）</li>
          <li>动态长度调整（4-8位）</li>
          <li>视觉干扰处理（噪点、干扰线、字符旋转）</li>
          <li>防暴力破解保护</li>
          <li>用户友好的界面反馈</li>
        </ul>
      </div>
    </div>
  );
};

export default CaptchaInput;