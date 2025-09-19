import React, { useState, useRef, useEffect } from 'react';
import { Upload, Card, Row, Col, Select, Slider, ColorPicker, Input, Button, Space, message } from 'antd';
import { UploadOutlined, EyeOutlined, DownloadOutlined, ClearOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import { WatermarkConfig } from '../../types';
import { watermarkAPI } from '../../services/api/uploadAPI';
import { WATERMARK_CONFIG } from '../../constants';

const { Option } = Select;

interface WatermarkUploadProps {
  onWatermarkApplied?: (watermarkedImageUrl: string) => void;
  defaultConfig?: Partial<WatermarkConfig>;
  maxFileSize?: number;
  acceptedTypes?: string[];
  className?: string;
  style?: React.CSSProperties;
}

const WatermarkUpload: React.FC<WatermarkUploadProps> = ({
  onWatermarkApplied,
  defaultConfig = {},
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  className = '',
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<WatermarkConfig>({
    text: '水印文字',
    position: 'bottom-right',
    opacity: WATERMARK_CONFIG.DEFAULT_OPACITY,
    size: WATERMARK_CONFIG.DEFAULT_SIZE,
    color: WATERMARK_CONFIG.DEFAULT_COLOR,
    rotation: WATERMARK_CONFIG.DEFAULT_ROTATION,
    ...defaultConfig,
  });

  // 处理文件上传
  const handleUploadChange: UploadProps['onChange'] = (info) => {
    setFileList(info.fileList);
    
    if (info.file.status === 'done' || info.file.originFileObj) {
      const file = info.file.originFileObj || info.file;
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setOriginalImage(imageUrl);
          setWatermarkedImage(null);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // 文件上传前验证
  const beforeUpload = (file: File) => {
    const isValidType = acceptedTypes.includes(file.type);
    if (!isValidType) {
      message.error(`只支持 ${acceptedTypes.join(', ')} 格式的图片！`);
      return false;
    }

    const isLtMaxSize = file.size < maxFileSize;
    if (!isLtMaxSize) {
      message.error(`图片大小不能超过 ${maxFileSize / 1024 / 1024}MB！`);
      return false;
    }

    return false; // 阻止默认上传
  };

  // 应用水印
  const applyWatermark = async () => {
    if (!originalImage) {
      message.warning('请先上传图片');
      return;
    }

    setLoading(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 创建图片对象
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          // 设置画布尺寸
          canvas.width = img.width;
          canvas.height = img.height;

          // 绘制原图
          ctx.drawImage(img, 0, 0);

          // 设置水印样式
          ctx.globalAlpha = config.opacity;
          ctx.fillStyle = config.color;
          ctx.font = `${config.size}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // 计算水印位置
          const { x, y } = calculateWatermarkPosition(img.width, img.height, config.position, config.size);

          // 保存当前状态
          ctx.save();

          // 移动到水印位置并旋转
          ctx.translate(x, y);
          ctx.rotate((config.rotation * Math.PI) / 180);

          // 绘制水印文字
          if (config.text) {
            ctx.fillText(config.text, 0, 0);
          }

          // 恢复状态
          ctx.restore();

          // 生成水印后的图片
          const watermarkedDataUrl = canvas.toDataURL('image/png');
          setWatermarkedImage(watermarkedDataUrl);
          
          resolve(watermarkedDataUrl);
        };
        
        img.onerror = reject;
        img.src = originalImage;
      });

      message.success('水印应用成功');
    } catch (error) {
      message.error('应用水印失败');
      console.error('Watermark application error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 计算水印位置
  const calculateWatermarkPosition = (
    imageWidth: number,
    imageHeight: number,
    position: string,
    fontSize: number
  ) => {
    const margin = fontSize;
    let x = 0;
    let y = 0;

    switch (position) {
      case 'top-left':
        x = margin;
        y = margin + fontSize / 2;
        break;
      case 'top-center':
        x = imageWidth / 2;
        y = margin + fontSize / 2;
        break;
      case 'top-right':
        x = imageWidth - margin;
        y = margin + fontSize / 2;
        break;
      case 'center-left':
        x = margin;
        y = imageHeight / 2;
        break;
      case 'center':
        x = imageWidth / 2;
        y = imageHeight / 2;
        break;
      case 'center-right':
        x = imageWidth - margin;
        y = imageHeight / 2;
        break;
      case 'bottom-left':
        x = margin;
        y = imageHeight - margin;
        break;
      case 'bottom-center':
        x = imageWidth / 2;
        y = imageHeight - margin;
        break;
      case 'bottom-right':
      default:
        x = imageWidth - margin;
        y = imageHeight - margin;
        break;
    }

    return { x, y };
  };

  // 下载水印图片
  const downloadWatermarkedImage = () => {
    if (!watermarkedImage) {
      message.warning('请先应用水印');
      return;
    }

    const link = document.createElement('a');
    link.download = `watermarked-image-${Date.now()}.png`;
    link.href = watermarkedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success('图片下载成功');
  };

  // 清除图片
  const clearImages = () => {
    setOriginalImage(null);
    setWatermarkedImage(null);
    setFileList([]);
  };

  // 配置变化时自动应用水印
  useEffect(() => {
    if (originalImage) {
      const timer = setTimeout(() => {
        applyWatermark();
      }, 300); // 防抖

      return () => clearTimeout(timer);
    }
  }, [config, originalImage]);

  // 通知外部组件
  useEffect(() => {
    if (watermarkedImage && onWatermarkApplied) {
      onWatermarkApplied(watermarkedImage);
    }
  }, [watermarkedImage, onWatermarkApplied]);

  return (
    <div className={`watermark-upload ${className}`} style={style}>
      <Row gutter={16}>
        {/* 配置面板 */}
        <Col xs={24} lg={8}>
          <Card title="水印配置" size="small">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <label style={{ display: 'block', marginBottom: 8 }}>水印文字：</label>
                <Input
                  value={config.text}
                  onChange={(e) => setConfig({ ...config, text: e.target.value })}
                  placeholder="请输入水印文字"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8 }}>水印位置：</label>
                <Select
                  value={config.position}
                  onChange={(position) => setConfig({ ...config, position })}
                  style={{ width: '100%' }}
                >
                  {WATERMARK_CONFIG.POSITIONS.map(pos => (
                    <Option key={pos.value} value={pos.value}>
                      {pos.label}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8 }}>
                  透明度：{Math.round(config.opacity * 100)}%
                </label>
                <Slider
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={config.opacity}
                  onChange={(opacity) => setConfig({ ...config, opacity })}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8 }}>
                  字体大小：{config.size}px
                </label>
                <Slider
                  min={12}
                  max={100}
                  value={config.size}
                  onChange={(size) => setConfig({ ...config, size })}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8 }}>
                  旋转角度：{config.rotation}°
                </label>
                <Slider
                  min={-45}
                  max={45}
                  value={config.rotation}
                  onChange={(rotation) => setConfig({ ...config, rotation })}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8 }}>水印颜色：</label>
                <ColorPicker
                  value={config.color}
                  onChange={(_, hex) => setConfig({ ...config, color: hex })}
                  showText
                />
              </div>
            </Space>
          </Card>
        </Col>

        {/* 图片上传和预览 */}
        <Col xs={24} lg={16}>
          <Card 
            title="图片处理" 
            size="small"
            extra={
              <Space>
                <Button
                  icon={<EyeOutlined />}
                  onClick={applyWatermark}
                  loading={loading}
                  disabled={!originalImage}
                >
                  应用水印
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={downloadWatermarkedImage}
                  disabled={!watermarkedImage}
                >
                  下载
                </Button>
                <Button
                  icon={<ClearOutlined />}
                  onClick={clearImages}
                  disabled={!originalImage}
                >
                  清除
                </Button>
              </Space>
            }
          >
            {/* 上传区域 */}
            {!originalImage && (
              <Upload.Dragger
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={beforeUpload}
                maxCount={1}
                accept={acceptedTypes.join(',')}
                style={{ marginBottom: 16 }}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text">点击或拖拽上传图片</p>
                <p className="ant-upload-hint">
                  支持 JPG、PNG、GIF 格式，文件大小不超过 {maxFileSize / 1024 / 1024}MB
                </p>
              </Upload.Dragger>
            )}

            {/* 图片预览 */}
            {originalImage && (
              <Row gutter={16}>
                <Col span={12}>
                  <div>
                    <h4 style={{ marginBottom: 8 }}>原图</h4>
                    <div className="watermark-preview">
                      <img
                        src={originalImage}
                        alt="原图"
                        style={{
                          width: '100%',
                          maxHeight: 300,
                          objectFit: 'contain',
                          border: '1px solid #d9d9d9',
                          borderRadius: 6,
                        }}
                      />
                    </div>
                  </div>
                </Col>
                
                <Col span={12}>
                  <div>
                    <h4 style={{ marginBottom: 8 }}>水印效果</h4>
                    <div className="watermark-preview">
                      {watermarkedImage ? (
                        <img
                          src={watermarkedImage}
                          alt="水印效果"
                          style={{
                            width: '100%',
                            maxHeight: 300,
                            objectFit: 'contain',
                            border: '1px solid #d9d9d9',
                            borderRadius: 6,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: 200,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px dashed #d9d9d9',
                            borderRadius: 6,
                            color: '#999',
                          }}
                        >
                          {loading ? '正在处理...' : '点击"应用水印"查看效果'}
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            )}

            {/* 隐藏的canvas用于图片处理 */}
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WatermarkUpload;