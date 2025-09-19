import { ApiResponse } from '../../types';

// 文件上传API
export const uploadAPI = {
  // 上传单个文件
  async uploadFile(file: File): Promise<ApiResponse<{ url: string; filename: string }>> {
    // 模拟文件上传
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟上传成功后返回的URL
    const mockUrl = `https://example.com/uploads/${Date.now()}_${file.name}`;
    
    return {
      success: true,
      data: {
        url: mockUrl,
        filename: file.name,
      },
    };
  },

  // 批量上传文件
  async uploadFiles(files: File[]): Promise<ApiResponse<Array<{ url: string; filename: string }>>> {
    // 模拟批量上传
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results = files.map(file => ({
      url: `https://example.com/uploads/${Date.now()}_${file.name}`,
      filename: file.name,
    }));
    
    return {
      success: true,
      data: results,
    };
  },

  // 删除文件
  async deleteFile(url: string): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: undefined,
    };
  },
};

// 水印处理API
export const watermarkAPI = {
  // 添加水印
  async addWatermark(
    imageUrl: string,
    watermarkConfig: {
      text?: string;
      imageUrl?: string;
      position: string;
      opacity: number;
      size: number;
      color: string;
      rotation: number;
    }
  ): Promise<ApiResponse<{ url: string }>> {
    // 模拟水印处理
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 在实际应用中，这里会调用图片处理服务
    const processedUrl = `${imageUrl}?watermark=true&t=${Date.now()}`;
    
    return {
      success: true,
      data: {
        url: processedUrl,
      },
    };
  },
};