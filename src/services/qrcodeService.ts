import QRCode from 'qrcode';

/**
 * 生成二维码（Base64格式）
 * @param url 要生成二维码的URL
 * @returns Base64格式的二维码图片
 */
export async function generateQRCode(url: string): Promise<string> {
  try {
    const qrCode = await QRCode.toDataURL(url, {
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    
    return qrCode;
  } catch (error) {
    console.error('生成二维码失败:', error);
    throw new Error('无法生成二维码');
  }
}
