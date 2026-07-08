# ARCHITECTURE — 技术架构文档

> 最后更新：2026-07-08
> 维护者：AI Engineering Manager

---

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 小程序 | uni-app + Vue 3 + SCSS | 3.0 |
| PC Web 端 | Vite + React 19 + Ant Design 5 | Vite 8 / React 19 |
| 运营后台 | Umi 4 + @umijs/max | 4.x |
| 后端框架 | Fastify 5 + TypeScript + Zod | 5.x |
| 数据库 | PostgreSQL 15 | Docker |
| 缓存 | Redis 6 | Docker, 优雅降级 |
| AI 引擎 | DeepSeek API | 内部 service 模块 |
| 部署 | 腾讯云香港 2C2G Ubuntu 22.04 | 119.28.134.67 |

---

## 目录结构

```
演出撮合平台/
├── miniprogram/             # 小程序 (uni-app + Vue 3)
│   ├── src/
│   │   ├── pages/           # 18 个页面
│   │   ├── components/      # CfNavBar / CfTabBar / CfVoiceInput
│   │   ├── styles/          # variables.scss / global.scss
│   │   └── stores/          # Pinia 状态管理
│   └── dist/                # 构建产物 → mp-weixin/
│
├── frontend-agent/          # PC 端 + Supplier Console (React)
│   ├── src/
│   │   ├── pages/           # LandingPage / SkuBrowse / Login
│   │   │   └── supplier/    # 6 页：DailyReport / SalesWarRoom / SalesKanban / SkuManage / Orders / ProfitDashboard
│   │   ├── components/      # XiaoYanFloat
│   │   └── services/        # apiClient / auth
│   └── dist/
│
├── frontend-admin/          # 运营后台 (Umi 4)
│   └── src/pages/           # Dashboard / Demand / Performer / SKU / Order / Settlement / PriceConfig / System 等 14 模块
│
├── backend/                 # API (Fastify 5)
│   ├── src/
│   │   ├── api/             # 20 个路由文件
│   │   ├── middleware/      # auth / rbac / error / validation
│   │   ├── utils/           # db / redis / response
│   │   └── types/           # TypeScript 类型
│   └── migrations/          # 6 个 SQL 迁移文件
│
└── docs/                    # 治理文档
    ├── PRODUCT_OS.md        # P0 产品宪法
    ├── ARCHITECTURE.md      # P0 技术架构
    ├── PRD.md               # P1 产品需求
    ├── HANDOFF.md           # P1 项目状态
    ├── DESIGN_SYSTEM.md     # P2 设计系统
    ├── DECISION_LOG.md      # P2 决策记录
    └── CHANGELOG.md         # P2 版本记录
```

---

## 子系统关系

```
                    ┌──────────────┐
                    │  Nginx :80   │
                    └──────┬───────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ / (PC端) │   │ /admin/  │   │ /supplier│
    │ React 19 │   │  Umi 4   │   │ React 19 │
    └────┬─────┘   └────┬─────┘   └────┬─────┘
         │              │              │
         └──────────────┼──────────────┘
                        ▼
                ┌──────────────┐
                │ /v1/ Fastify │  ← 后端 API :3002
                └──────┬───────┘
           ┌───────────┼───────────┐
           ▼           ▼           ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │PostgreSQL│ │  Redis   │ │DeepSeek  │
    │    :5433 │ │  :6379   │ │   API    │
    └──────────┘ └──────────┘ └──────────┘
```

**依赖方向：** 前端 → API → 数据库。单向，上层不直接访问下层数据库。

---

## 数据模型（核心 17 张表）

| 表名 | 说明 | 关键字段 |
|:-----|:-----|:---------|
| `skus` | SKU 方案模板 | name, business_line, base_price, agent_price, duration_minutes |
| `performers` | 艺人信息 | name, tier(T0-T6), status |
| `demands` | 需求 | title, event_type, audience_count, budget, status |
| `opportunities` | 商机 | demand_id, status(new→won/lost), priority, lost_reason |
| `quotes` | 报价单 | demand_id, version, total_price, channel_price, cost_price, margin |
| `follow_up_logs` | 跟进记录 | opportunity_id, action_type, content, ai_suggested_script |
| `assignments` | 排期 | performer_id, demand_id, status |
| `settlements` | 结算 | performer_id, amount, status |
| `reviews` | 评价 | performer_id, rating, content |
| `cases` | 案例 | title, cover_url, sku_id, status |
| `companies` | 企业资料 | short_name, status |
| `credit_score_logs` | 信誉分 | performer_id, score, reason |
| `ai_feedback_logs` | AI 反馈 | feedback_type, was_accepted |
| `price_configs` | 价格配置 | config_type, tier, price |

---

## API 路由（20 组）

| 前缀 | 说明 | 权限 |
|:-----|:-----|:-----|
| `/v1/auth` | 认证 | 公开 |
| `/v1/skus` | SKU 管理 | GET 公开, 写 admin |
| `/v1/demands` | 需求管理 | agent/client/admin |
| `/v1/opportunities` | 商机 | agent/admin |
| `/v1/quotes` | 报价 | agent/admin |
| `/v1/follow-ups` | 跟进 | agent/admin |
| `/v1/orders` | 订单 | admin |
| `/v1/performers` | 艺人 | admin/公开 |
| `/v1/assignments` | 排期 | admin/performer |
| `/v1/settlements` | 结算 | admin |
| `/v1/reviews` | 评价 | agent |
| `/v1/cases` | 案例 | admin |
| `/v1/companies` | 企业 | admin/agent |
| `/v1/price-configs` | 价格配置 | admin |
| `/v1/ai` | AI 洞察 | 登录用户 |
| `/v1/ai-templates` | AI 模板 | admin |
| `/v1/admin` | 运营工具 | admin |
| `/v1/notifications` | 通知 | admin |
| `/v1/contracts` | 签约 | admin |
| `/v1/payments` | 付款 | admin |

### API 设计原则
- RESTful 风格，URL 使用名词复数
- 所有请求参数 Zod schema 校验
- 所有响应 `successResponse(data)` / `errorResponse(code, message)` 包裹
- 分页参数：`?page=1&pageSize=20`
- 错误码 4 位数字：9001=不存在, 9002=重复, 9003=无效参数

---

## 关键架构约束

1. **前端不直连数据库** — 所有数据通过 `/v1/` API
2. **优雅降级** — Redis 不可用时自动回退直连 DB；AI 不可用时回退手工
3. **类型安全** — 后端全部 TypeScript + Zod 校验
4. **缓存优先** — 读多写少数据走 Redis（SKU 列表 5 分钟缓存）
5. **不做单点优化，先做正确** — 功能正确 > 性能优化 > 代码整洁
