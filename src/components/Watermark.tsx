import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Watermark.css';

interface WatermarkConfig {
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  angle: number;
  spacing: number;
}

const Watermark: React.FC = () => {
  const [config, setConfig] = useState<WatermarkConfig>({
    text: '商品管理系统',
    fontSize: 16,
    color: '#000000',
    opacity: 0.1,
    angle: -45,
    spacing: 200,
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 创建水印画布
  const createWatermarkCanvas = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 设置画布大小
    canvas.width = config.spacing * 2;
    canvas.height = config.spacing * 2;

    // 设置文字样式
    ctx.font = `${config.fontSize}px Arial`;
    ctx.fillStyle = config.color;
    ctx.globalAlpha = config.opacity;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 保存状态并旋转
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((config.angle * Math.PI) / 180);
    
    // 绘制水印文字
    ctx.fillText(config.text, 0, 0);
    ctx.restore();

    return canvas;
  }, [config]);

  // 应用水印到图片
  const applyWatermarkToImage = useCallback(async (imageUrl: string) => {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          reject(new Error('Canvas not found'));
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not found'));
          return;
        }

        // 设置画布大小为图片大小
        canvas.width = img.width;
        canvas.height = img.height;

        // 绘制原图
        ctx.drawImage(img, 0, 0);

        // 创建水印图案
        const watermarkCanvas = createWatermarkCanvas();
        if (!watermarkCanvas) {
          reject(new Error('Failed to create watermark'));
          return;
        }

        // 创建水印图案
        const pattern = ctx.createPattern(watermarkCanvas, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 转换为图片URL
        const watermarkedUrl = canvas.toDataURL('image/png');
        resolve(watermarkedUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = imageUrl;
    });
  }, [createWatermarkCanvas]);

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setSelectedImage(imageUrl);
      setWatermarkedImage(null);
    };
    reader.readAsDataURL(file);
  };

  // 生成水印图片
  const generateWatermark = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    try {
      const watermarked = await applyWatermarkToImage(selectedImage);
      setWatermarkedImage(watermarked);
    } catch (error) {
      console.error('Error generating watermark:', error);
      alert('生成水印失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 下载水印图片
  const downloadWatermarkedImage = () => {
    if (!watermarkedImage) return;

    const link = document.createElement('a');
    link.download = 'watermarked-image.png';
    link.href = watermarkedImage;
    link.click();
  };

  // 更新配置
  const updateConfig = (key: keyof WatermarkConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // 实时预览水印效果
  useEffect(() => {
    if (containerRef.current) {
      const watermarkCanvas = createWatermarkCanvas();
      if (watermarkCanvas) {
        const pattern = `url(${watermarkCanvas.toDataURL()})`;
        containerRef.current.style.backgroundImage = pattern;
      }
    }
  }, [createWatermarkCanvas]);

  const sampleImages = [
    'https://picsum.photos/400/300?random=1',
    'https://picsum.photos/400/300?random=2',
    'https://picsum.photos/400/300?random=3',
  ];

  return (
    <div className="watermark-container">
      <h2>水印功能</h2>
      <p className="description">
        为图片添加水印保护，支持自定义水印文字、样式和透明度
      </p>

      <div className="watermark-layout">
        <div className="config-panel">
          <h3>水印配置</h3>
          
          <div className="config-section">
            <div className="config-item">
              <label>水印文字:</label>
              <input
                type="text"
                value={config.text}
                onChange={(e) => updateConfig('text', e.target.value)}
                placeholder="输入水印文字"
              />
            </div>

            <div className="config-item">
              <label>字体大小:</label>
              <input
                type="range"
                min="10"
                max="30"
                value={config.fontSize}
                onChange={(e) => updateConfig('fontSize', parseInt(e.target.value))}
              />
              <span>{config.fontSize}px</span>
            </div>

            <div className="config-item">
              <label>文字颜色:</label>
              <input
                type="color"
                value={config.color}
                onChange={(e) => updateConfig('color', e.target.value)}
              />
            </div>

            <div className="config-item">
              <label>透明度:</label>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={config.opacity}
                onChange={(e) => updateConfig('opacity', parseFloat(e.target.value))}
              />
              <span>{Math.round(config.opacity * 100)}%</span>
            </div>

            <div className="config-item">
              <label>旋转角度:</label>
              <input
                type="range"
                min="-90"
                max="90"
                value={config.angle}
                onChange={(e) => updateConfig('angle', parseInt(e.target.value))}
              />
              <span>{config.angle}°</span>
            </div>

            <div className="config-item">
              <label>间距:</label>
              <input
                type="range"
                min="100"
                max="300"
                value={config.spacing}
                onChange={(e) => updateConfig('spacing', parseInt(e.target.value))}
              />
              <span>{config.spacing}px</span>
            </div>
          </div>

          <div className="preview-section">
            <h4>水印预览</h4>
            <div 
              ref={containerRef}
              className="watermark-preview"
              style={{
                backgroundRepeat: 'repeat',
                backgroundSize: `${config.spacing}px ${config.spacing}px`,
              }}
            >
              <div className="preview-content">
                <p>这里是内容区域</p>
                <p>水印将覆盖在内容上方</p>
              </div>
            </div>
          </div>
        </div>

        <div className="image-panel">
          <h3>图片水印处理</h3>
          
          <div className="upload-section">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="upload-btn"
            >
              📁 选择图片
            </button>
          </div>

          <div className="sample-images">
            <h4>或选择示例图片：</h4>
            <div className="samples-grid">
              {sampleImages.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`示例图片 ${index + 1}`}
                  className="sample-image"
                  onClick={() => setSelectedImage(url)}
                />
              ))}
            </div>
          </div>

          {selectedImage && (
            <div className="image-processing">
              <h4>原图预览</h4>
              <div className="image-preview">
                <img src={selectedImage} alt="原图" />
              </div>
              
              <button 
                onClick={generateWatermark}
                className="generate-btn"
                disabled={isProcessing}
              >
                {isProcessing ? '处理中...' : '🎨 生成水印'}
              </button>
            </div>
          )}

          {watermarkedImage && (
            <div className="result-section">
              <h4>水印效果</h4>
              <div className="image-preview">
                <img src={watermarkedImage} alt="水印图片" />
              </div>
              
              <button 
                onClick={downloadWatermarkedImage}
                className="download-btn"
              >
                💾 下载图片
              </button>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="watermark-info">
        <h4>💡 水印功能特点：</h4>
        <ul>
          <li>支持自定义水印文字和样式</li>
          <li>可调节透明度、角度和间距</li>
          <li>实时预览水印效果</li>
          <li>支持图片上传和批量处理</li>
          <li>高质量图片输出</li>
        </ul>
      </div>
    </div>
  );
};

export default Watermark;