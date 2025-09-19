import React, { useState } from 'react';
import './QRCodeGenerator.css';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
}

const QRCodeGenerator: React.FC = () => {
  const [text, setText] = useState('https://shop.example.com/product/iphone15pro');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('product');
  const [customProduct, setCustomProduct] = useState<Product>({
    id: 'P001',
    name: 'iPhone 15 Pro',
    price: 9999,
    category: '智能手机',
    description: '苹果最新旗舰手机'
  });

  const templates = [
    {
      id: 'product',
      name: '商品链接',
      description: '生成商品详情页链接',
      icon: '📱',
      getValue: () => `https://shop.example.com/product/${customProduct.id.toLowerCase()}`
    },
    {
      id: 'store',
      name: '店铺主页',
      description: '店铺主页链接',
      icon: '🏪',
      getValue: () => 'https://shop.example.com/store'
    },
    {
      id: 'category',
      name: '分类页面',
      description: '商品分类页面',
      icon: '🗒️',
      getValue: () => `https://shop.example.com/category/${encodeURIComponent(customProduct.category)}`
    },
    {
      id: 'contact',
      name: '联系信息',
      description: '商家联系方式',
      icon: '📞',
      getValue: () => 'tel:+86-400-123-4567'
    },
    {
      id: 'wechat',
      name: '微信群',
      description: '微信群聚链接',
      icon: '💬',
      getValue: () => 'weixin://dl/groupchat/?invitecode=ABC123'
    },
    {
      id: 'coupon',
      name: '优惠券',
      description: '优惠券领取链接',
      icon: '🎟️',
      getValue: () => 'https://shop.example.com/coupon/SAVE20'
    }
  ];

  const sampleProducts = [
    { id: 'P001', name: 'iPhone 15 Pro', price: 9999, category: '智能手机', description: '苹果最新旗舰手机' },
    { id: 'P002', name: 'MacBook Pro', price: 19999, category: '笔记本电脑', description: '专业级笔记本电脑' },
    { id: 'P003', name: 'AirPods Pro', price: 1999, category: '耳机', description: '无线蓝牙耳机' },
    { id: 'P004', name: 'iPad Air', price: 4999, category: '平板电脑', description: '轻薄便携平板' }
  ];

  const generateQRCode = (inputText?: string) => {
    const targetText = inputText || text;
    const size = 200;
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(targetText)}&format=png&ecc=M`;
    setQrCodeUrl(apiUrl);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newText = template.getValue();
      setText(newText);
      generateQRCode(newText);
    }
  };

  const handleProductSelect = (product: Product) => {
    setCustomProduct(product);
    if (selectedTemplate === 'product') {
      const newText = `https://shop.example.com/product/${product.id.toLowerCase()}`;
      setText(newText);
      generateQRCode(newText);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `qrcode-${selectedTemplate}-${Date.now()}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    alert('链接已复制到剪贴板！');
  };

  return (
    <div className="qrcode-container">
      <h2>📱 二维码生成器</h2>
      <p className="description">
        为商品和店铺快速生成二维码，方便客户扫码访问
      </p>

      <div className="qrcode-layout">
        <div className="templates-section">
          <h3>模板选择</h3>
          <div className="templates-grid">
            {templates.map(template => (
              <button
                key={template.id}
                className={`template-card ${selectedTemplate === template.id ? 'active' : ''}`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <span className="template-icon">{template.icon}</span>
                <h4>{template.name}</h4>
                <p>{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        {selectedTemplate === 'product' && (
          <div className="products-section">
            <h3>选择商品</h3>
            <div className="products-list">
              {sampleProducts.map(product => (
                <div
                  key={product.id}
                  className={`product-item ${customProduct.id === product.id ? 'active' : ''}`}
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p className="product-price">¥{product.price.toLocaleString()}</p>
                    <p className="product-category">{product.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="input-section">
          <h3>自定义内容</h3>
          <div className="input-controls">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入要生成二维码的文本或URL"
              rows={3}
            />
            <div className="input-actions">
              <button onClick={() => generateQRCode()} className="generate-btn">
                🎨 生成二维码
              </button>
              <button onClick={copyToClipboard} className="copy-btn">
                📎 复制链接
              </button>
            </div>
          </div>
        </div>

        <div className="output-section">
          <h3>二维码结果</h3>
          {qrCodeUrl ? (
            <div className="qrcode-display">
              <div className="qrcode-preview">
                <img src={qrCodeUrl} alt="二维码" />
                <div className="qrcode-info">
                  <p className="qrcode-type">
                    {templates.find(t => t.id === selectedTemplate)?.icon} {' '}
                    {templates.find(t => t.id === selectedTemplate)?.name}
                  </p>
                  {selectedTemplate === 'product' && (
                    <p className="product-name">{customProduct.name}</p>
                  )}
                </div>
              </div>
              <div className="qrcode-actions">
                <button onClick={downloadQRCode} className="download-btn">
                  💾 下载二维码
                </button>
                <button onClick={() => window.print()} className="print-btn">
                  🖨️ 打印二维码
                </button>
              </div>
            </div>
          ) : (
            <div className="placeholder">
              点击生成按钮创建二维码
            </div>
          )}
        </div>
      </div>

      <div className="qrcode-info">
        <h4>💡 二维码功能特点：</h4>
        <ul>
          <li>支持多种常用模板（商品、店铺、联系方式等）</li>
          <li>可以快速选择商品生成专属二维码</li>
          <li>支持自定义内容和链接</li>
          <li>高清图片输出，支持下载和打印</li>
          <li>一键复制链接，方便分享</li>
        </ul>
      </div>
    </div>
  );
};

export default QRCodeGenerator;