import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Space, Input, Select, ColorPicker, Slider, Card, message } from 'antd';
import { DownloadOutlined, CopyOutlined, PrinterOutlined, ShareAltOutlined } from '@ant-design/icons';
import QRCode, { QRCodeToDataURLOptions } from 'qrcode';
import { Product, QRCodeConfig } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store';
import { closeModal, addNotification } from '../../store/slices/uiSlice';
import { QR_CODE_CONFIG } from '../../constants';

const { Option } = Select;

interface QRCodeModalProps {
  product?: Product;
  visible?: boolean;
  onCancel?: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  product,
  visible,
  onCancel,
}) => {
  const dispatch = useAppDispatch();
  const { modals } = useAppSelector((state) => state.ui);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [config, setConfig] = useState<QRCodeConfig>({
    content: product ? `${window.location.origin}/products/${product.id}` : '',
    size: QR_CODE_CONFIG.DEFAULT_SIZE,
    errorCorrectionLevel: 'M',
    margin: QR_CODE_CONFIG.DEFAULT_MARGIN,
    foregroundColor: QR_CODE_CONFIG.DEFAULT_FOREGROUND_COLOR,
    backgroundColor: QR_CODE_CONFIG.DEFAULT_BACKGROUND_COLOR,
  });
  const [qrDataURL, setQrDataURL] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const isVisible = visible !== undefined ? visible : modals.qrCode;

  // 生成二维码
  const generateQRCode = async () => {
    if (!config.content.trim()) {
      message.warning('请输入二维码内容');
      return;
    }

    setLoading(true);
    try {
      const options: QRCodeToDataURLOptions = {
        width: config.size,
        margin: config.margin,
        color: {
          dark: config.foregroundColor,
          light: config.backgroundColor,
        },
        errorCorrectionLevel: config.errorCorrectionLevel,
      };

      const dataURL = await QRCode.toDataURL(config.content, options);
      setQrDataURL(dataURL);

      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, config.content, options);
      }
    } catch (error) {
      message.error('生成二维码失败');
      console.error('QR Code generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible && config.content) {
      generateQRCode();
    }
  }, [isVisible, config]);

  // 下载二维码
  const handleDownload = () => {
    if (!qrDataURL) {
      message.warning('请先生成二维码');
      return;
    }

    const link = document.createElement('a');
    link.download = `qrcode-${product?.name || 'custom'}-${Date.now()}.png`;
    link.href = qrDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    dispatch(addNotification({
      type: 'success',
      message: '二维码已下载到本地',
    }));
  };

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    } else {
      dispatch(closeModal('qrCode'));
    }
  };

  return (
    <Modal
      title="生成二维码"
      open={isVisible}
      onCancel={handleClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          取消
        </Button>,
        <Button key="generate" type="primary" loading={loading} onClick={generateQRCode}>
          重新生成
        </Button>,
      ]}
    >
      <div style={{ display: 'flex', gap: 24 }}>
        {/* 配置面板 */}
        <div style={{ flex: 1 }}>
          <Card title="二维码配置" size="small">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <label style={{ display: 'block', marginBottom: 8 }}>内容：</label>
                <Input.TextArea
                  value={config.content}
                  onChange={e => setConfig({ ...config, content: e.target.value })}
                  placeholder="输入二维码内容（链接、文本等）"
                  rows={3}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8 }}>尺寸：</label>
                <Select
                  value={config.size}
                  onChange={size => setConfig({ ...config, size })}
                  style={{ width: '100%' }}
                >
                  {QR_CODE_CONFIG.SIZE_OPTIONS.map(size => (
                    <Option key={size} value={size}>
                      {size} x {size} px
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8 }}>纠错级别：</label>
                <Select
                  value={config.errorCorrectionLevel}
                  onChange={level => setConfig({ ...config, errorCorrectionLevel: level })}
                  style={{ width: '100%' }}
                >
                  {QR_CODE_CONFIG.ERROR_CORRECTION_LEVELS.map(level => (
                    <Option key={level.value} value={level.value}>
                      {level.label}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8 }}>边距：{config.margin}</label>
                <Slider
                  min={0}
                  max={10}
                  value={config.margin}
                  onChange={margin => setConfig({ ...config, margin })}
                />
              </div>
            </Space>
          </Card>
        </div>

        {/* 预览面板 */}
        <div style={{ flex: 1 }}>
          <Card title="预览" size="small">
            <div className="qr-code-container">
              {qrDataURL ? (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={qrDataURL}
                    alt="二维码预览"
                    style={{ maxWidth: '100%', border: '1px solid #d9d9d9', borderRadius: 4 }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
              ) : (
                <div
                  style={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fafafa',
                    border: '1px dashed #d9d9d9',
                    borderRadius: 4,
                    color: '#999',
                  }}
                >
                  请输入内容并生成二维码
                </div>
              )}
            </div>

            {qrDataURL && (
              <div className="qr-code-actions" style={{ marginTop: 16 }}>
                <Space wrap>
                  <Button icon={<DownloadOutlined />} onClick={handleDownload}>
                    下载
                  </Button>
                </Space>
              </div>
            )}

            {product && (
              <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
                <div>商品名称：{product.name}</div>
                <div>商品价格：¥{product.price}</div>
                <div>商品链接：{config.content}</div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Modal>
  );
};

export default QRCodeModal;