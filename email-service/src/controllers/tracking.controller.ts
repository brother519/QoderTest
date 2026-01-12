import { Request, Response } from 'express';
import { trackingService, unsubscribeService } from '../services/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('tracking-controller');

export class TrackingController {
  /**
   * GET /api/v1/tracking/pixel/:trackingId - 追踪像素
   */
  async trackOpen(req: Request, res: Response): Promise<void> {
    try {
      const { trackingId } = req.params;
      
      // 获取请求元数据
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;
      
      // 异步记录打开事件（不阻塞响应）
      trackingService.recordOpen(trackingId, { userAgent, ipAddress }).catch(err => {
        logger.error({ trackingId, error: err }, 'Failed to record open event');
      });
      
      // 返回 1x1 透明像素
      const pixel = trackingService.getTrackingPixel();
      
      res.set({
        'Content-Type': 'image/gif',
        'Content-Length': pixel.length,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      });
      
      res.send(pixel);
    } catch (error) {
      logger.error({ error }, 'Error serving tracking pixel');
      // 即使出错也返回像素，避免邮件客户端显示错误图标
      const pixel = trackingService.getTrackingPixel();
      res.set('Content-Type', 'image/gif');
      res.send(pixel);
    }
  }
  
  /**
   * GET /api/v1/tracking/click/:trackingId - 点击追踪
   */
  async trackClick(req: Request, res: Response): Promise<void> {
    try {
      const { trackingId } = req.params;
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        res.status(400).json({ error: 'Missing url parameter' });
        return;
      }
      
      // 验证 URL 安全性
      let targetUrl: URL;
      try {
        targetUrl = new URL(url);
        // 只允许 http 和 https 协议
        if (!['http:', 'https:'].includes(targetUrl.protocol)) {
          throw new Error('Invalid protocol');
        }
      } catch {
        res.status(400).json({ error: 'Invalid URL' });
        return;
      }
      
      // 获取请求元数据
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;
      
      // 异步记录点击事件
      trackingService.recordClick(trackingId, url, { userAgent, ipAddress }).catch(err => {
        logger.error({ trackingId, url, error: err }, 'Failed to record click event');
      });
      
      // 重定向到目标 URL
      res.redirect(302, url);
    } catch (error) {
      logger.error({ error }, 'Error handling click tracking');
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * GET /api/v1/tracking/:jobId/stats - 获取追踪统计
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      
      const stats = await trackingService.getTrackingStats(jobId);
      
      if (!stats) {
        res.status(404).json({ error: 'Tracking data not found' });
        return;
      }
      
      res.json(stats);
    } catch (error) {
      logger.error({ error }, 'Failed to get tracking stats');
      res.status(500).json({ error: 'Failed to get tracking stats' });
    }
  }
}

export class UnsubscribeController {
  /**
   * GET /api/v1/unsubscribe/:token - 退订页面
   */
  async showUnsubscribePage(req: Request, res: Response): Promise<void> {
    const { token } = req.params;
    
    // 验证 token
    const payload = unsubscribeService.verifyToken(token);
    
    if (!payload) {
      res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head><title>退订失败</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>链接已过期或无效</h1>
          <p>请联系客服获取帮助。</p>
        </body>
        </html>
      `);
      return;
    }
    
    // 返回确认页面
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>取消订阅</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .container { max-width: 500px; margin: 0 auto; }
          button { background: #dc3545; color: white; border: none; padding: 10px 30px; 
                   font-size: 16px; cursor: pointer; border-radius: 5px; }
          button:hover { background: #c82333; }
          .success { color: green; }
          .error { color: red; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>取消订阅</h1>
          <p>您确定要取消订阅邮件吗？</p>
          <p>邮箱: <strong>${payload.email}</strong></p>
          <form id="unsubForm">
            <p>
              <label>原因（可选）:</label><br>
              <textarea name="reason" rows="3" style="width: 100%;"></textarea>
            </p>
            <button type="submit">确认取消订阅</button>
          </form>
          <div id="result"></div>
        </div>
        <script>
          document.getElementById('unsubForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const reason = e.target.reason.value;
            try {
              const res = await fetch('/api/v1/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: '${token}', reason })
              });
              const data = await res.json();
              if (data.success) {
                document.getElementById('result').innerHTML = 
                  '<p class="success">您已成功取消订阅。</p>';
                document.getElementById('unsubForm').style.display = 'none';
              } else {
                document.getElementById('result').innerHTML = 
                  '<p class="error">操作失败: ' + data.error + '</p>';
              }
            } catch (err) {
              document.getElementById('result').innerHTML = 
                '<p class="error">操作失败，请稍后重试。</p>';
            }
          });
        </script>
      </body>
      </html>
    `);
  }
  
  /**
   * POST /api/v1/unsubscribe - 处理退订请求
   */
  async processUnsubscribe(req: Request, res: Response): Promise<void> {
    try {
      const { token, reason } = req.body;
      
      if (!token) {
        res.status(400).json({ error: 'Missing token' });
        return;
      }
      
      const result = await unsubscribeService.processUnsubscribe(token, reason);
      
      if (!result.success) {
        res.status(400).json({ success: false, error: result.error });
        return;
      }
      
      res.json({ success: true, email: result.email });
    } catch (error) {
      logger.error({ error }, 'Failed to process unsubscribe');
      res.status(500).json({ success: false, error: 'Failed to process unsubscribe' });
    }
  }
  
  /**
   * GET /api/v1/unsubscribe/check/:email - 检查退订状态
   */
  async checkStatus(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      
      const isUnsubscribed = await unsubscribeService.isUnsubscribed(email);
      
      res.json({ email, isUnsubscribed });
    } catch (error) {
      logger.error({ error }, 'Failed to check unsubscribe status');
      res.status(500).json({ error: 'Failed to check status' });
    }
  }
}

export const trackingController = new TrackingController();
export const unsubscribeController = new UnsubscribeController();
