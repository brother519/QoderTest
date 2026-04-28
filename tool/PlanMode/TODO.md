# 重构待办清单

## 🔴 P0 — 安全 & 核心缺陷
- [ ] **1. 替换假 JWT 实现** — `auth.ts` 中 token 为硬编码字符串，需引入 `jsonwebtoken` 库实现真实签发/验证
- [ ] **2. 实现 `getProfile` 逻辑** — 当前完全忽略 token 参数，返回假数据，需解析 token 并查询真实用户
- [ ] **3. 替换内存存储** — 用户数据存于 `Map`，重启即丢失；需引入持久化方案（如数据库/文件）

## 🟠 P1 — 架构分层
- [ ] **4. 职责拆分（Controller ↔ Service ↔ Repository）**
  - `auth.controller.ts` — 处理 HTTP 请求/响应
  - `auth.service.ts` — 认证业务逻辑（登录、注册、token 管理）
  - `user.repository.ts` — 用户数据存取
- [ ] **5. 提取认证中间件** — 将路由中手动 token 检查提取为 `auth.middleware.ts`
- [ ] **6. 补齐缺失路由** — Controller 有 `register` 方法但无 `POST /register` 路由
- [ ] **7. 清理死代码** — `loadAuthConfig` / `AuthConfig` 定义但从未调用，移除或正式接入

## 🟡 P2 — 工程基础设施
- [ ] **8. 初始化项目配置** — 添加 `package.json`、`tsconfig.json`
- [ ] **9. 添加错误处理** — async 路由无 try/catch，添加统一错误处理中间件
- [ ] **10. 引入日志库** — 替换 `console.log`，使用 `pino` 或 `winston`
- [ ] **11. 环境变量管理** — JWT 密钥等敏感配置通过 `.env` 管理

## 🟢 P3 — 质量保障
- [ ] **12. 添加单元测试** — 覆盖 Service 层核心逻辑
- [ ] **13. 添加集成测试** — 覆盖路由层 HTTP 请求
- [ ] **14. 添加输入校验** — 对请求体做参数校验（如 `zod` 或 `class-validator`）

---

**建议执行顺序：** `8 → 4 → 1 → 2 → 3 → 5 → 6 → 7 → 9 → 10 → 11 → 14 → 12 → 13`
