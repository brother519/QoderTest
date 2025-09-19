import React, { useState } from 'react';
import './QRCodeGenerator.css';

const QRCodeGenerator: React.FC = () => {
  const [text, setText] = useState('https://example.com');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const generateQRCode = () => {
    // 使用在线API生成二维码
    const size = 200;
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
    setQrCodeUrl(apiUrl);
  };

  return (
    <div className="qrcode-container">
      <h2>二维码生成器</h2>
      <p className="description">
        快速生成和解析二维码，便于信息分享和访问
      </p>

      <div className="qrcode-layout">
        <div className="input-section">
          <h3>输入内容</h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入要生成二维码的文本或URL"
            rows={4}
          />
          <button onClick={generateQRCode} className="generate-btn">
            生成二维码
          </button>
        </div>

        <div className="output-section">
          <h3>二维码</h3>
          {qrCodeUrl ? (
            <div className="qrcode-display">
              <img src={qrCodeUrl} alt="二维码" />
              <a href={qrCodeUrl} download="qrcode.png" className="download-btn">
                下载二维码
              </a>
            </div>
          ) : (
            <div className="placeholder">
              点击生成按钮创建二维码
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;