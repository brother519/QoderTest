# 博客系统

基于Python Flask框架构建的完整博客系统，包含用户认证、文章CRUD、评论功能和标签分类管理。

## 功能特性

- 用户注册、登录、权限管理
- 文章创建、编辑、删除、发布
- Markdown内容支持
- 评论系统（支持回复）
- 标签和分类管理
- 管理员后台
- RESTful API

## 技术栈

- **后端**: Flask 3.0
- **数据库**: SQLite (开发环境) / PostgreSQL (生产环境)
- **ORM**: SQLAlchemy
- **认证**: Flask-Login (Session认证)
- **表单**: Flask-WTF + WTForms
- **前端**: Jinja2模板 + Bootstrap 5

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 初始化数据库

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### 3. 创建管理员账户

```bash
flask shell
```

在Flask shell中执行：

```python
from app import create_app
from app.extensions import db
from app.models import User

app = create_app()
with app.app_context():
    admin = User(username='admin', email='admin@example.com', is_admin=True)
    admin.set_password('admin123')
    db.session.add(admin)
    db.session.commit()
    print('管理员账户创建成功！')
```

### 4. 运行应用

```bash
flask run
```

访问 http://localhost:5000

## 默认管理员账户

- 用户名: `admin`
- 密码: `admin123`

**重要**: 首次登录后请立即修改默认密码！

## 项目结构

```
QoderTest/
├── app/                      # 应用主目录
│   ├── __init__.py          # 应用工厂
│   ├── models.py            # 数据库模型
│   ├── extensions.py        # 扩展初始化
│   ├── auth/                # 认证模块
│   ├── blog/                # 博客模块
│   ├── comment/             # 评论模块
│   ├── admin/               # 管理模块
│   ├── api/                 # API模块
│   ├── templates/           # Jinja2模板
│   ├── static/              # 静态资源
│   └── utils/               # 工具函数
├── config.py                # 配置文件
├── requirements.txt         # Python依赖
├── run.py                   # 启动文件
└── README.md
```

## API 端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户

### 文章
- `GET /api/posts` - 文章列表
- `GET /api/posts/<id>` - 文章详情
- `POST /api/posts` - 创建文章
- `PUT /api/posts/<id>` - 更新文章
- `DELETE /api/posts/<id>` - 删除文章

### 评论
- `GET /api/posts/<id>/comments` - 获取评论
- `POST /api/posts/<id>/comments` - 创建评论
- `DELETE /api/comments/<id>` - 删除评论

## 开发说明

### 环境变量

在`.env`文件中配置：

```
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///blog.db
FLASK_ENV=development
```

### 数据库迁移

```bash
flask db migrate -m "描述"
flask db upgrade
```

## 部署

### 生产环境配置

1. 修改`.env`文件：
```
FLASK_ENV=production
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=生成强密钥
```

2. 使用Gunicorn运行：
```bash
gunicorn -w 4 -b 0.0.0.0:8000 "app:create_app()"
```

3. 配置Nginx反向代理

## 许可证

MIT License