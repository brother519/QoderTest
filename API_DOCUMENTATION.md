# Photo Upload System

## 项目简介
基于Spring Boot开发的照片上传下载系统，提供完整的图片管理功能。

## 核心特性

### 1. 文件上传功能
- ✅ 单文件和多文件上传
- ✅ 文件类型验证（仅允许图片格式：jpg, jpeg, png, gif, bmp, webp）
- ✅ 文件大小限制（默认最大10MB）
- ✅ 自动生成唯一文件名
- ✅ 上传进度监控

### 2. 文件下载功能
- ✅ 文件下载接口
- ✅ 在线预览功能
- ✅ 访问权限控制（基于Token）
- ✅ 支持断点续传

### 3. 安全特性
- ✅ 文件类型安全检查
- ✅ 文件名安全处理
- ✅ 访问权限控制（Token机制）
- ✅ 防盗链措施
- ✅ XSS防护

### 4. 性能优化
- ✅ 文件上传进度监控
- ✅ 大文件处理优化
- ✅ 图片自动压缩（大于2MB时压缩）
- ✅ Caffeine缓存机制

### 5. 异常处理
- ✅ 完善的异常处理机制
- ✅ 友好的错误提示
- ✅ 详细的日志记录

### 6. 存储管理
- ✅ 可配置的文件存储路径
- ✅ 定期清理机制（定时任务）
- ✅ 存储容量监控

## 技术栈
- Spring Boot 3.2.0
- Java 17
- Maven
- Lombok
- Commons IO
- Thumbnailator（图片处理）
- Caffeine Cache
- SpringDoc OpenAPI（API文档）

## 快速开始

### 1. 环境要求
- JDK 17+
- Maven 3.6+

### 2. 构建项目
```bash
mvn clean install
```

### 3. 运行应用
```bash
mvn spring-boot:run
```

或者运行编译后的jar：
```bash
java -jar target/photo-upload-system-1.0.0.jar
```

### 4. 访问应用
- 应用地址：http://localhost:8080
- API文档：http://localhost:8080/swagger-ui.html
- 健康检查：http://localhost:8080/api/files/health

## API接口文档

### 文件上传
**单文件上传**
```
POST /api/files/upload
Content-Type: multipart/form-data
参数: file (文件)
```

**多文件上传**
```
POST /api/files/upload/multiple
Content-Type: multipart/form-data
参数: files (文件数组)
```

### 文件下载
**下载文件**
```
GET /api/files/download/{fileId}?token=xxx
```

**预览文件**
```
GET /api/files/preview/{fileId}?token=xxx
```

### 文件管理
**获取文件信息**
```
GET /api/files/info/{fileId}
```

**删除文件**
```
DELETE /api/files/{fileId}
```

**获取文件列表**
```
GET /api/files/list
```

**刷新访问令牌**
```
POST /api/files/token/refresh/{fileId}
```

**获取存储使用情况**
```
GET /api/files/storage/usage
```

## 配置说明

### application.yml 配置项
```yaml
file:
  upload:
    path: ${user.home}/photo-uploads  # 文件存储路径
    allowed-extensions: jpg,jpeg,png,gif,bmp,webp  # 允许的文件扩展名
    max-size: 10485760  # 最大文件大小（字节）
    compress-threshold: 2097152  # 压缩阈值（字节）
    compress-quality: 0.8  # 压缩质量
    access-token-enabled: true  # 是否启用访问令牌
    access-token-expire: 3600  # 令牌过期时间（秒）
```

## 项目结构
```
src/
├── main/
│   ├── java/com/photocloud/photoupload/
│   │   ├── config/          # 配置类
│   │   ├── controller/      # 控制器
│   │   ├── service/         # 服务层
│   │   ├── model/           # 数据模型
│   │   ├── exception/       # 异常处理
│   │   ├── util/            # 工具类
│   │   ├── task/            # 定时任务
│   │   └── PhotoUploadApplication.java  # 启动类
│   └── resources/
│       └── application.yml  # 配置文件
└── test/                    # 测试代码
```

## 核心功能实现

### 1. 文件验证
- 文件类型检查
- 文件大小限制
- 文件名安全验证
- Content-Type验证

### 2. 图片压缩
- 自动检测文件大小
- 超过阈值自动压缩
- 保持图片质量
- 支持缩略图生成

### 3. 访问控制
- Token生成机制
- Token过期验证
- Token刷新功能

### 4. 定时任务
- 定期清理过期文件
- 存储状态监控
- 日志记录

## 测试

运行单元测试：
```bash
mvn test
```

## 安全建议
1. 生产环境建议配置HTTPS
2. 启用访问令牌验证
3. 定期清理过期文件
4. 监控存储使用情况
5. 配置防火墙规则

## 许可证
Apache 2.0

## 联系方式
- Email: support@photocloud.com
