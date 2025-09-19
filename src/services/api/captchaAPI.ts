import { CaptchaData, ApiResponse } from '../../types';

// 模拟验证码API
export const captchaAPI = {
  // 获取验证码
  async getCaptcha(): Promise<ApiResponse<CaptchaData>> {
    // 模拟生成验证码
    const token = Math.random().toString(36).substring(2, 15);
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // 创建验证码图片（简单的canvas绘制）
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 40;
    const ctx = canvas.getContext('2d')!;
    
    // 背景
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 120, 40);
    
    // 干扰线
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `hsl(${Math.random() * 360}, 50%, 50%)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 120, Math.random() * 40);
      ctx.lineTo(Math.random() * 120, Math.random() * 40);
      ctx.stroke();
    }
    
    // 文字
    ctx.font = '20px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(code, 60, 25);
    
    const image = canvas.toDataURL();
    
    return {
      success: true,
      data: {
        token,
        image,
        expiry: Date.now() + 5 * 60 * 1000, // 5分钟后过期
      },
    };
  },

  // 验证验证码
  async verifyCaptcha(token: string, code: string): Promise<ApiResponse<boolean>> {
    // 模拟验证逻辑
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 简单的验证逻辑（实际应该在服务端进行）
    const isValid = code.length === 4 && token.length > 10;
    
    return {
      success: true,
      data: isValid,
    };
  },
};