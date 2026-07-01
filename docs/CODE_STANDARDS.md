# 代码规范标准（CODE_STANDARDS.md）

> 所有 Agent 必须遵守。Orchestrator 按此标准逐项审查。同一问题反复出现 3 次，更新本文档增加检查项。

---

## 一、后端规范（Node.js + Fastify + PostgreSQL）

### 1.1 TypeScript

| # | 规范 | 示例 |
|:-:|------|------|
| TS-1 | 严格模式（`strict: true`），禁止 `any` | ✅ `function getUser(id: string): Promise<User>` |
| TS-2 | 所有函数声明返回类型 | ❌ `function foo() { ... }` |
| TS-3 | 接口/类型定义放在 `types/` 目录 | `types/sku.ts` |

### 1.2 数据库

| # | 规范 | 示例 |
|:-:|------|------|
| DB-1 | **禁止字符串拼接 SQL**，全部用参数化查询 | ✅ `db.query('SELECT * FROM users WHERE id = $1', [id])` |
| DB-2 | 多表写操作使用事务 | `BEGIN; ...; COMMIT;` 或 `db.tx(async t => {...})` |
| DB-3 | 迁移文件命名：`YYYYMMDD_HHMMSS_description.sql` | `20260701_140000_create_skus.sql` |
| DB-4 | 所有表必须有 `created_at`，关键表加 `updated_at` | |

### 1.3 API

| # | 规范 | 示例 |
|:-:|------|------|
| API-1 | 统一响应格式 | `{ code: 0, data: {...}, message: "ok" }` |
| API-2 | 错误码从 1000 起，按模块分段 | 1000-1099 认证，2000-2099 SKU，3000-3099 订单 |
| API-3 | 每个端点声明所需角色，中间件统一校验 | `fastify.get('/skus', { preHandler: [auth, requireRole('admin')] })` |
| API-4 | 输入用 zod 校验 | `const schema = z.object({ name: z.string().min(1) })` |
| API-5 | 分页接口统一参数 `page` + `pageSize`，返回 `{ items, total, page, pageSize }` |
| API-6 | RESTful 命名 | `GET /skus`, `POST /skus`, `PUT /skus/:id`, `DELETE /skus/:id` |

### 1.4 日志

| # | 规范 |
|:-:|------|
| LOG-1 | 所有 CUD 操作写入 `operation_logs` 表（谁/时间/操作类型/改前/改后） |
| LOG-2 | 价格修改必须记录操作日志 |
| LOG-3 | 错误日志包含 `traceId`，方便追踪 |

---

## 二、前端规范（React + Ant Design Pro）

### 2.1 TypeScript

| # | 规范 |
|:-:|------|
| TS-4 | 同后端 TS-1 到 TS-3 |
| TS-5 | API 响应类型与 API_CONTRACT.md 对齐 |

### 2.2 UI/UX

| # | 规范 | 说明 |
|:-:|------|------|
| UX-1 | 触控目标 ≥ 44px | 对标微信设计规范，所有可点击元素 |
| UX-2 | 三态处理 | 每个数据组件处理 `loading` / `empty` / `error` 三种状态 |
| UX-3 | 加载状态 | 列表用骨架屏，按钮用 `loading` 属性 |
| UX-4 | 空状态 | 显示插图 + 引导文案，不显示空白页 |
| UX-5 | 错误状态 | API 报错显示友好提示，提供重试按钮 |

### 2.3 API 调用

| # | 规范 |
|:-:|------|
| API-7 | 所有 API 调用通过 `apiClient.ts`（统一处理 token 注入 / 错误格式化 / 重试） |
| API-8 | 禁止直接使用 `fetch` 或 `axios` |
| API-9 | 请求参数和响应类型与 API_CONTRACT.md 严格对齐 |

### 2.4 组件

| # | 规范 |
|:-:|------|
| CMP-1 | 单文件 ≤ 300 行，超过拆分为子组件 |
| CMP-2 | 组件文件命名：`PascalCase.tsx` |
| CMP-3 | 页面文件放在 `pages/`，公共组件放在 `components/` |
| CMP-4 | 微信风格优先：底部操作栏贴近拇指区域 |

---

## 三、小程序规范（uni-app + NutUI）

### 3.1 通用

> 前端规范 2.1-2.4 全部适用，额外增加：

| # | 规范 | 说明 |
|:-:|------|------|
| MP-1 | 触控目标 ≥ 44px | 底部操作栏放在屏幕下半区 |
| MP-2 | 振动反馈 | 确认按钮、签到打卡触发 `uni.vibrateShort()` |
| MP-3 | 分包加载 | 单包 ≤ 2MB，主包只放首页 + 登录 + 公共组件 |
| MP-4 | 避免 `scroll-view` 嵌套 | 微信小程序下有滚动穿透问题 |

---

## 四、通用规范（三端适用）

| # | 规范 | 违反后果 |
|:-:|------|---------|
| G-1 | 禁止硬编码配置（价格/URL/密钥），走环境变量或配置表 | 审查不通过 |
| G-2 | 注释用中文 | 警告 |
| G-3 | commit message 格式：`类型: 简短描述`（`feat/fix/docs/chore`） | 警告 |
| G-4 | 禁止提交 `console.log` / `debugger` 到主分支 | 审查不通过 |
| G-5 | 禁止提交 `.env` 文件（仅提交 `.env.example`） | 审查不通过 |
| G-6 | 文件命名：后端 `kebab-case.ts`，前端 `PascalCase.tsx`，小程序 `kebab-case.vue` | 警告 |
| G-7 | 禁止在代码中写死用户可见文案，中文文案统一放常量文件 | 建议 |

---

## 五、审查评分

> 每项规范违规扣分：

| 等级 | 扣分 | 处理 |
|:----:|:----:|------|
| 审查不通过 | — | **打回重写**（DB-1, API-1, G-4, G-5, UX-2） |
| 严重 | -3 | 必须修改后重新提交 |
| 一般 | -1 | 修改后通过，累计 -5 分打回 |
| 建议 | 0 | 建议修改，不阻塞 |

> 审查总分 20 分，低于 15 分打回。

---

> 版本：v1.0
> 更新规则：同一类问题反复出现 3 次，Orchestrator 更新本文档增加检查项
