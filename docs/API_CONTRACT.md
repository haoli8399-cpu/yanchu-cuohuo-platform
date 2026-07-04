# API 接口契约文档（API_CONTRACT.md）

> 版本：v1.0
> 创建时间：2026-07-01
> 状态：Phase 1 Contract-First，代码开发前完成
> 维护人：Orchestrator
>
> ⚠️ 铁律：前后端 Agent 必须严格按本文档对接。接口变更必须先更新本文档，再改代码。

---

## 一、通用规范

### 1.1 基础信息

| 项目 | 值 |
|------|-----|
| 协议 | HTTPS |
| 域名 | `https://api.yanchu-platform.com`（生产）/ `http://localhost:3001`（开发） |
| 前缀 | `/v1` |
| 认证方式 | Bearer Token（JWT，Supabase Auth） |
| 请求格式 | `application/json` |
| 响应格式 | `{ code: number, data: any, message: string }` |
| 分页参数 | `page`（从1开始）+ `pageSize`（默认20，最大100） |
| 分页响应 | `{ items: [], total: number, page: number, pageSize: number }` |

### 1.2 错误码规范

| 范围 | 模块 |
|------|------|
| 0 | 成功 |
| 1000-1099 | 认证（Auth） |
| 2000-2099 | SKU 方案库 |
| 3000-3099 | 需求管理 + AI 方案 |
| 4000-4099 | 订单 + 签约 |
| 5000-5099 | 演员管理 + 咖位 + 信誉分 |
| 6000-6099 | 排期分配 |
| 7000-7099 | 结算 |
| 8000-8099 | 评价 |
| 9000-9099 | 价格配置 |
| 9999 | 未知错误 |

### 1.3 通用类型

```typescript
// 用户角色
type UserRole = 'client' | 'agent' | 'performer' | 'admin';

// 运营子角色（RBAC）
type AdminRole = 'super_admin' | 'operator' | 'finance' | 'content_editor';

// 业务线
type BusinessLine = 'venue_booking' | 'outdoor_show' | 'show_sponsor' | 'custom_content' | 'custom_showcase';

// 演员咖位
type PerformerTier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6';

// 信誉等级
type CreditLevel = 'S' | 'A' | 'B' | 'C' | 'D';

// 订单状态（12 正常 + 2 异常）
type DemandStatus =
  | 'pending_ai' | 'ai_generated' | 'pending_operator' | 'operator_adjusted'
  | 'pending_client_confirm' | 'confirmed' | 'pending_deposit' | 'deposit_received'
  | 'pending_performer' | 'performer_confirmed' | 'performing' | 'finished'
  | 'pending_final_payment' | 'final_payment_received' | 'settled'
  | 'cancelled' | 'refunding';

// 价格类型
type PriceConfigType = 'performer_settlement' | 'agent_quote' | 'client_quote';

// 分页参数
interface PaginationParams {
  page?: number;       // 默认 1
  pageSize?: number;   // 默认 20，最大 100
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 统一响应
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}
```

---

## 二、路由组

### 2.1 Auth（认证）- `/v1/auth`

#### POST `/v1/auth/wechat-web`
微信扫码登录（Web 端活动公司）

```
Request:
{
  code: string  // 微信授权 code
}

Response 200:
{
  code: 0,
  data: {
    token: string,
    user: {
      id: string,
      role: 'agent' | 'admin',
      name: string,
      avatar_url: string,
      company_profile?: {
        status: 'registered' | 'pending_cert' | 'certified',
        short_name: string
      }
    }
  },
  message: "ok"
}
```

#### POST `/v1/auth/wechat-miniprogram`
微信小程序授权登录

```
Request:
{
  code: string  // wx.login() 返回的 code
}

Response 200:
{
  code: 0,
  data: {
    token: string,
    user: {
      id: string,
      role: 'client' | 'performer',
      name: string,
      avatar_url: string,
      performer_profile?: {
        tier: PerformerTier,
        credit_level: CreditLevel,
        status: 'active' | 'inactive'
      }
    }
  },
  message: "ok"
}
```

#### POST `/v1/auth/phone`
手机号注册/登录

```
Request:
{
  phone: string,       // 11位手机号
  code: string,        // 短信验证码
  role: 'agent'        // 注册角色
}

Response 200:
{
  code: 0,
  data: {
    token: string,
    user: { id: string, role: string, name: string },
    is_new: boolean    // 是否新注册
  },
  message: "ok"
}
```

#### POST `/v1/auth/phone-code`
发送短信验证码

```
Request:
{
  phone: string
}

Response 200:
{
  code: 0,
  data: { expire_seconds: 300 },
  message: "验证码已发送"
}

Error:
{ code: 1001, data: null, message: "发送频率过高，请60秒后重试" }
```

---

### 2.2 SKU 方案库 - `/v1/skus`

#### GET `/v1/skus`
获取 SKU 列表（公开，无需认证）

```
Query:
  business_line?: BusinessLine    // 按业务线筛选
  style?: string                  // 按风格筛选
  min_price?: number              // 最低价
  max_price?: number              // 最高价
  status?: 'active' | 'inactive'  // 默认 active
  keyword?: string                // 搜索关键词
  page?: number
  pageSize?: number

Response 200:
{
  code: 0,
  data: {
    items: [{
      id: string,
      name: string,
      business_line: BusinessLine,
      description: string,
      performer_profile: string,     // 演员画像
      style_tags: string[],
      applicable_scenes: string[],
      base_price: number,            // 甲方标准价
      company_price: number,         // 活动公司价（×0.7）
      internal_price: number,        // 内部结算价（×0.67）
      duration_minutes: number,
      performers_count: number,
      cover_url: string,
      status: 'active' | 'inactive',
      created_at: string
    }],
    total: number,
    page: number,
    pageSize: number
  },
  message: "ok"
}
```

#### GET `/v1/skus/:id`
获取 SKU 详情

```
Response 200:
{
  code: 0,
  data: {
    id: string,
    name: string,
    business_line: BusinessLine,
    description: string,
    performer_profile: string,
    style_tags: string[],
    applicable_scenes: string[],
    base_price: number,
    company_price: number,         // 活动公司价（×0.7）
    internal_price: number,        // 内部结算价（×0.67）
    duration_minutes: number,
    performers_count: number,
    media_urls: string[],            // 样片/案例
    status: 'active' | 'inactive',
    created_at: string,
    updated_at: string
  },
  message: "ok"
}
```

#### POST `/v1/skus`
创建 SKU（运营专用，需 admin 角色）

```
Auth: Bearer Token（admin）
Request:
{
  name: string,
  business_line: BusinessLine,
  description: string,
  performer_profile: string,
  style_tags: string[],
  applicable_scenes: string[],
  base_price: number,
  duration_minutes: number,
  performers_count: number,
  media_urls?: string[]
}

Response 201:
{
  code: 0,
  data: { id: string },
  message: "SKU创建成功"
}

Error:
{ code: 2001, data: null, message: "SKU名称已存在" }
```

#### PUT `/v1/skus/:id`
更新 SKU（运营专用）

```
Auth: Bearer Token（admin）
Request: (同 POST，所有字段可选)
Response 200: { code: 0, data: { id: string }, message: "SKU更新成功" }
```

#### PATCH `/v1/skus/:id/status`
上架/下架 SKU

```
Auth: Bearer Token（admin）
Request:
{
  status: 'active' | 'inactive'
}

Response 200:
{ code: 0, data: { id: string, status: string }, message: "状态已更新" }
```

#### PATCH `/v1/skus/:id/basic-info`
更新基础信息（运营专用）

```
Auth: Bearer Token（admin）
Request:
{
  name?: string,
  business_line?: BusinessLine,
  description?: string
}

Response 200:
{ code: 0, data: { id: string }, message: "基础信息已更新" }
```

#### PATCH `/v1/skus/:id/performer`
更新演员画像（运营专用）

```
Auth: Bearer Token（admin）
Request:
{
  performer_profile?: string,
  style_tags?: string[],
  performers_count?: number
}

Response 200:
{ code: 0, data: { id: string }, message: "演员画像已更新" }
```

#### PATCH `/v1/skus/:id/pricing`
更新价格配置（运营专用，后端自动联动计算公司价和结算价）

```
Auth: Bearer Token（admin）
Request:
{
  base_price: number    // 甲方标准价
}

Response 200:
{
  code: 0,
  data: {
    id: string,
    base_price: number,
    company_price: number,    // ×0.7
    internal_price: number    // ×0.67
  },
  message: "价格已更新"
}
```

#### PATCH `/v1/skus/:id/media`
更新内容素材（运营专用）

```
Auth: Bearer Token（admin）
Request:
{
  cover_url?: string,
  media_urls?: string[]
}

Response 200:
{ code: 0, data: { id: string }, message: "内容素材已更新" }
```

#### PATCH `/v1/skus/:id/config`
更新适用配置（运营专用）

```
Auth: Bearer Token（admin）
Request:
{
  applicable_scenes?: string[],
  duration_minutes?: number
}

Response 200:
{ code: 0, data: { id: string }, message: "适用配置已更新" }
```

---

### 2.3 需求管理 - `/v1/demands`

#### POST `/v1/demands`
提交需求（活动公司/甲方）

```
Auth: Bearer Token（agent / client）
Request:
{
  source: 'sku' | 'requirement' | 'phone',  // SKU选购/需求提报/电话代客
  sku_id?: string,                           // 选购路径时必传
  title?: string,
  event_type: string,                        // 企业年会/客户答谢/开业/婚礼/...
  event_date: string,                        // YYYY-MM-DD
  event_time?: string,                       // HH:mm
  city: string,
  address: string,
  audience_count?: number,
  budget?: number,
  duration_minutes?: number,
  comedy_style?: string,
  special_requirements?: string,
  venue_name?: string,                       // 商演包场用
  venue_type?: string
}

Response 201:
{
  code: 0,
  data: {
    id: string,
    status: 'pending_ai'
  },
  message: "需求已提交，AI正在生成方案"
}
```

#### GET `/v1/demands`
获取需求列表

```
Auth: Bearer Token
Query:
  status?: DemandStatus
  role?: 'my' | 'all'         // 活动公司看自己的，运营看全部
  page?: number
  pageSize?: number

Response 200:
{
  code: 0,
  data: {
    items: [{
      id: string,
      title: string,
      event_type: string,
      event_date: string,
      city: string,
      budget: number,
      status: DemandStatus,
      urgency: 'normal' | 'urgent' | 'emergency',
      created_at: string,
      client: { id: string, name: string }
    }],
    total: number,
    page: number,
    pageSize: number
  },
  message: "ok"
}
```

#### GET `/v1/demands/:id`
获取需求详情（含 AI 方案 + 运营调整 + 最终方案）

```
Response 200:
{
  code: 0,
  data: {
    id: string,
    client_id: string,
    source: 'sku' | 'requirement' | 'phone',
    sku_id?: string,
    title: string,
    event_type: string,
    event_date: string,
    event_time?: string,
    city: string,
    address: string,
    audience_count?: number,
    budget?: number,
    duration_minutes?: number,
    comedy_style?: string,
    special_requirements?: string,
    ai_plan_content?: string,             // AI 原始方案
    adjusted_plan_content?: string,       // 运营调整后方案
    final_plan_content?: string,          // 最终确认方案
    final_price?: number,
    urgency: 'normal' | 'urgent' | 'emergency',
    contract_mode?: 'skip' | 'upload' | 'system',
    status: DemandStatus,
    status_history: [{                     // 状态时间线
      status: DemandStatus,
      at: string,
      operator_id?: string
    }],
    lineups?: [{                           // 阵容
      performer: { id: string, name: string, tier: PerformerTier },
      role: string,
      status: 'pending' | 'confirmed' | 'rejected'
    }],
    payments?: [{                          // 付款记录
      type: 'deposit' | 'final',
      amount: number,
      method: string,
      received_at: string
    }],
    created_at: string,
    updated_at: string
  },
  message: "ok"
}
```

#### PUT `/v1/demands/:id`
修改需求（AI 出方案前可编辑）

```
Auth: Bearer Token（需求创建者）
Request: (同 POST，所有字段可选)
Response 200: { code: 0, data: { id: string }, message: "需求已更新" }

Error:
{ code: 3001, data: null, message: "AI方案已生成，不可修改" }
```

#### PATCH `/v1/demands/:id/withdraw`
撤回需求

```
Auth: Bearer Token（需求创建者）
Response 200: { code: 0, data: { id: string, status: 'cancelled' }, message: "需求已撤回" }

Error:
{ code: 3002, data: null, message: "当前状态不可撤回" }
```

#### POST `/v1/demands/:id/ai-plan`
触发 AI 生成方案（运营手动触发或自动触发）

```
Auth: Bearer Token（admin）
Response 200:
{
  code: 0,
  data: {
    id: string,
    status: 'ai_generated',
    ai_plan_content: string   // AI 方案 JSON
  },
  message: "AI方案已生成"
}
```

#### PUT `/v1/demands/:id/adjust-plan`
运营调整方案

```
Auth: Bearer Token（admin）
Request:
{
  adjusted_plan_content: string,   // 调整后的方案 JSON
  final_price?: number,
  contract_mode?: 'skip' | 'upload' | 'system'
}

Response 200:
{
  code: 0,
  data: { id: string, status: 'operator_adjusted' },
  message: "方案已调整，等待活动公司确认"
}
```

#### PATCH `/v1/demands/:id/confirm`
活动公司确认方案

```
Auth: Bearer Token（agent）
Response 200: { code: 0, data: { id: string, status: 'confirmed' }, message: "方案已确认" }
```

---

### 2.4 订单流转（状态推进）- `/v1/orders`

#### PATCH `/v1/orders/:demand_id/status`
运营推进订单状态（统一状态变更接口）

```
Auth: Bearer Token（admin）
Request:
{
  to_status: DemandStatus,     // 目标状态
  metadata?: {                  // 状态变更附带信息（按需）
    amount?: number,           // 定金/尾款金额
    method?: string,           // 收款方式
    note?: string              // 备注
  }
}

Response 200:
{ code: 0, data: { id: string, status: DemandStatus }, message: "状态已更新" }

Error:
{ code: 4001, data: null, message: "不允许从 [当前状态] 变更为 [目标状态]" }
```

> 状态允许流转规则（后端配置对象校验，详见技术方案六节）。

#### GET `/v1/orders/:demand_id/timeline`
获取订单时间线

```
Response 200:
{
  code: 0,
  data: [{
    status: DemandStatus,
    label: string,              // 中文状态名
    at: string,
    operator?: { id: string, name: string },
    note?: string
  }],
  message: "ok"
}
```

---

### 2.5 签约管理 - `/v1/contracts`

#### PUT `/v1/contracts/:demand_id`
设置签约模式 / 上传合同

```
Auth: Bearer Token（admin）
Request:
{
  mode: 'skip' | 'upload' | 'system',
  file_url?: string,       // PDF 合同文件（upload 模式必传）
  signed_at?: string       // 签署时间
}

Response 200: { code: 0, message: "签约信息已更新" }
```

#### GET `/v1/contracts/:demand_id`
获取合同信息

```
Response 200:
{
  code: 0,
  data: {
    mode: 'skip' | 'upload' | 'system',
    file_url?: string,
    signed_at?: string,
    status: 'pending' | 'signed' | 'skipped'
  },
  message: "ok"
}
```

---

### 2.6 演员管理 - `/v1/performers`

#### GET `/v1/performers`
演员列表

```
Auth: Bearer Token
Query:
  tier?: PerformerTier
  credit_level?: CreditLevel
  style?: string
  status?: 'active' | 'inactive'
  keyword?: string
  page?: number
  pageSize?: number

Response 200:
{
  code: 0,
  data: {
    items: [{
      id: string,
      name: string,
      avatar_url: string,
      style_tags: string[],
      tier: PerformerTier,
      credit_score: number,
      credit_level: CreditLevel,
      rating: number,
      experience_years: number,
      status: 'active' | 'inactive'
    }],
    total: number,
    page: number,
    pageSize: number
  },
  message: "ok"
}
```

#### GET `/v1/performers/:id`
演员详情

```
Response 200:
{
  code: 0,
  data: {
    id: string,
    name: string,
    phone: string,            // 仅运营可见
    avatar_url: string,
    cover_url: string,
    style_tags: string[],
    introduction: string,
    highlights: string,
    media_urls: string[],
    social_links: object,
    experience_years: number,
    tier: PerformerTier,
    tier_updated_at: string,
    credit_score: number,
    credit_level: CreditLevel,
    rating: number,
    status: 'active' | 'inactive',
    contract?: {              // 签约信息（仅运营可见）
      type: string,
      exclusivity: boolean,
      settlement_rate: number
    },
    created_at: string
  },
  message: "ok"
}
```

#### POST `/v1/performers`
新增演员（运营专用）

```
Auth: Bearer Token（admin）
Request:
{
  name: string,
  phone: string,
  style_tags?: string[],
  introduction?: string,
  highlights?: string,
  media_urls?: string[],
  social_links?: object,
  experience_years?: number,
  tier?: PerformerTier     // 默认 T6
}

Response 201:
{ code: 0, data: { id: string }, message: "演员已创建" }
```

#### PUT `/v1/performers/:id`
编辑演员资料

```
Auth: Bearer Token（admin）
Request: (同 POST，所有字段可选)
Response 200: { code: 0, data: { id: string }, message: "演员资料已更新" }
```

---

### 2.7 演员咖位管理 - `/v1/performers/:id/tier`

#### GET `/v1/performers/:id/tier-history`
获取咖位变动历史

```
Response 200:
{
  code: 0,
  data: [{
    from_tier: PerformerTier,
    to_tier: PerformerTier,
    reason: string,
    operator: { id: string, name: string },
    created_at: string
  }],
  message: "ok"
}
```

#### PUT `/v1/performers/:id/tier`
手动调整咖位

```
Auth: Bearer Token（admin）
Request:
{
  tier: PerformerTier,
  reason: string          // 调整原因（必填）
}

Response 200:
{ code: 0, data: { tier: PerformerTier }, message: "咖位已更新" }

Error:
{ code: 5001, data: null, message: "T0/T1级别需人工认定，请填写认定依据" }
```

#### GET `/v1/performers/:id/tier-suggestion`
获取系统升降级建议

```
Response 200:
{
  code: 0,
  data: {
    current_tier: PerformerTier,
    suggested_tier?: PerformerTier,    // 建议目标级别
    direction: 'up' | 'down' | 'none',
    reasons: string[],                 // 满足/不满足的条件
    metrics: {
      completed_shows: number,
      credit_score: number,
      recent_avg_rating: number,
      recent_reject_count: number
    }
  },
  message: "ok"
}
```

---

### 2.8 演员信誉分 - `/v1/performers/:id/credit`

#### GET `/v1/performers/:id/credit`
获取信誉分详情

```
Response 200:
{
  code: 0,
  data: {
    total_score: number,
    level: CreditLevel,
    dimensions: {
      fulfillment: { score: number, weight: 0.4 },
      quality: { score: number, weight: 0.35 },
      activity: { score: number, weight: 0.15 },
      basics: { score: number, weight: 0.1 }
    }
  },
  message: "ok"
}
```

#### GET `/v1/performers/:id/credit-logs`
获取信誉分变动明细

```
Query:
  page?: number
  pageSize?: number

Response 200:
{
  code: 0,
  data: {
    items: [{
      id: string,
      change_amount: number,
      reason: string,
      related_demand_id?: string,
      created_at: string
    }],
    total: number
  },
  message: "ok"
}
```

---

### 2.9 排期分配 - `/v1/assignments`

#### POST `/v1/assignments`
运营分配演员排期

```
Auth: Bearer Token（admin）
Request:
{
  demand_id: string,
  performer_id: string,
  performance_role: string,      // 脱口秀/即兴/主持等
  arrival_time: string,          // ISO datetime
  negotiated_price?: number       // 协商价，默认按咖位计算
}

Response 201:
{
  code: 0,
  data: {
    id: string,
    status: 'pending'            // 等待演员确认
  },
  message: "排期已分配，等待演员确认"
}

Error:
{ code: 6001, data: null, message: "该演员此时段已有排期，档期冲突" }
```

#### GET `/v1/assignments`
获取排期列表

```
Auth: Bearer Token
Query:
  demand_id?: string
  performer_id?: string
  status?: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'
  date_from?: string
  date_to?: string

Response 200:
{
  code: 0,
  data: {
    items: [{
      id: string,
      demand: { id: string, title: string, event_date: string },
      performer: { id: string, name: string, tier: PerformerTier },
      performance_role: string,
      arrival_time: string,
      checkin_time?: string,
      checkin_location?: object,
      negotiated_price?: number,
      status: string,
      reject_reason?: string,
      confirmed_at?: string
    }],
    total: number
  },
  message: "ok"
}
```

#### PATCH `/v1/assignments/:id/respond`
演员确认/拒绝排期

```
Auth: Bearer Token（performer）
Request:
{
  action: 'confirm' | 'reject',
  reject_reason?: string     // 拒绝时必填
}

Response 200:
{ code: 0, data: { status: 'confirmed' | 'rejected' }, message: "..." }
```

#### POST `/v1/assignments/:id/checkin`
演员签到打卡

```
Auth: Bearer Token（performer）
Request:
{
  latitude: number,
  longitude: number
}

Response 200:
{
  code: 0,
  data: {
    checkin_time: string,
    credit_change: { amount: number, reason: string }
  },
  message: "签到成功"
}

Error:
{ code: 6002, data: null, message: "当前时间未到签到窗口" }
```

#### GET `/v1/assignments/calendar`
获取演员档期日历数据

```
Auth: Bearer Token
Query:
  performer_id?: string     // 不传则查全部
  month: string             // YYYY-MM

Response 200:
{
  code: 0,
  data: [{
    date: string,
    assignments: [{
      id: string,
      performer: { id: string, name: string },
      demand_title: string,
      time_slot: string
    }]
  }],
  message: "ok"
}
```

---

### 2.10 付款登记 - `/v1/payments`

#### POST `/v1/payments`
运营登记收款（定金/尾款）

```
Auth: Bearer Token（admin / finance）
Request:
{
  demand_id: string,
  type: 'deposit' | 'final',
  amount: number,
  method: string,            // 银行转账/微信转账/支付宝
  received_at: string,       // ISO datetime
  note?: string
}

Response 201:
{
  code: 0,
  data: {
    id: string,
    demand_status: DemandStatus   // 自动推进后的新状态
  },
  message: "收款已登记"
}
```

#### GET `/v1/payments`
获取付款记录

```
Query:
  demand_id?: string
  type?: 'deposit' | 'final'

Response 200: { code: 0, data: { items: PaymentRecord[] }, message: "ok" }
```

---

### 2.11 结算统计 - `/v1/settlements`

#### GET `/v1/settlements`
获取结算汇总

```
Auth: Bearer Token（admin / finance）
Query:
  period?: string           // YYYY-MM，不传默认当月
  performer_id?: string

Response 200:
{
  code: 0,
  data: {
    items: [{
      performer: { id: string, name: string, tier: PerformerTier },
      pending_amount: number,       // 待结算
      settled_amount: number,       // 已结算
      total_amount: number,
      details: [{
        demand_id: string,
        demand_title: string,
        amount: number,
        status: 'pending' | 'settled',
        settled_at?: string
      }]
    }],
    summary: {
      total_pending: number,
      total_settled: number
    }
  },
  message: "ok"
}
```

#### PATCH `/v1/settlements/:id/mark-settled`
标记已结算

```
Auth: Bearer Token（admin / finance）
Request:
{
  paid_at?: string     // 实际打款时间
}

Response 200: { code: 0, message: "已标记为已结算" }
```

#### GET `/v1/settlements/export`
导出结算明细 Excel

```
Query:
  period?: string

Response 200: (binary .xlsx file)
```

---

### 2.12 评价 - `/v1/reviews`

#### POST `/v1/reviews`
提交评价

```
Auth: Bearer Token（agent / performer）
Request:
{
  demand_id: string,
  overall_rating: number,             // 1-5
  performance_rating?: number,
  punctuality_rating?: number,
  content_rating?: number,
  interaction_rating?: number,
  satisfaction_rating?: number,
  text_content?: string
}

Response 201:
{ code: 0, data: { id: string }, message: "评价已提交" }

Error:
{ code: 8001, data: null, message: "该订单已评价" }
```

#### GET `/v1/reviews`
获取评价列表

```
Query:
  performer_id?: string
  demand_id?: string

Response 200:
{
  code: 0,
  data: {
    items: [{
      id: string,
      from_type: 'company' | 'performer',
      from_user: { id: string, name: string },
      overall_rating: number,
      text_content: string,
      status: 'pending' | 'published' | 'hidden',
      created_at: string
    }],
    total: number
  },
  message: "ok"
}
```

---

### 2.13 价格配置 - `/v1/price-configs`

#### GET `/v1/price-configs`
获取价格配置列表

```
Auth: Bearer Token（admin）
Query:
  config_type?: PriceConfigType
  business_line?: BusinessLine
  tier?: PerformerTier

Response 200:
{
  code: 0,
  data: {
    items: [{
      id: string,
      config_type: PriceConfigType,
      business_line: BusinessLine,
      tier?: PerformerTier,
      package_name: string,
      duration_minutes: number,
      performer_count: number,
      base_price: number,
      agent_discount: number,
      extra_fee_per_5min?: number,
      script_creation_fee?: number,
      script_performance_fee?: number,
      remote_fee_in_city?: number,
      remote_fee_out_city?: number,
      updated_at: string
    }],
    total: number
  },
  message: "ok"
}
```

#### PUT `/v1/price-configs/:id`
更新价格配置

```
Auth: Bearer Token（admin）
Request: (同 GET 响应的字段，按需传)
Response 200: { code: 0, data: { id: string }, message: "价格配置已更新" }
```

> ⚠️ 所有价格修改自动记录操作日志。

---

### 2.14 活动公司管理 - `/v1/companies`

#### GET `/v1/companies`
活动公司列表（运营专用）

```
Auth: Bearer Token（admin）
Query:
  status?: 'registered' | 'pending_cert' | 'certified'
  keyword?: string
  page?: number
  pageSize?: number

Response 200:
{
  code: 0,
  data: {
    items: [{
      id: string,
      short_name: string,
      full_name?: string,
      contact_person: string,
      city: string,
      service_categories: string[],
      status: 'registered' | 'pending_cert' | 'certified',
      total_orders: number,
      total_spent: number,
      created_at: string
    }],
    total: number
  },
  message: "ok"
}
```

#### GET `/v1/companies/:id`
活动公司详情

```
Response 200: { code: 0, data: CompanyProfile, message: "ok" }
```

#### POST `/v1/companies/:id/certify`
提交企业认证

```
Auth: Bearer Token（agent）
Request:
{
  full_name: string,
  credit_code: string,
  business_license_url: string,
  legal_person_name: string,
  legal_person_id_url: string,
  bank_name: string,
  bank_account: string
}

Response 200: { code: 0, data: { status: 'pending_cert' }, message: "认证资料已提交" }
```

#### PATCH `/v1/companies/:id/verify`
运营审核认证

```
Auth: Bearer Token（admin）
Request:
{
  action: 'approve' | 'reject',
  reason?: string
}

Response 200: { code: 0, data: { status: 'certified' | 'registered' }, message: "..." }
```

---

### 2.15 运营工具 - `/v1/admin`

#### GET `/v1/admin/dashboard`
运营总看板

```
Auth: Bearer Token（admin）
Response 200:
{
  code: 0,
  data: {
    pending_demands: number,              // 待处理需求
    pending_assignments: number,          // 待确认排期
    pending_settlements: number,          // 待结算
    monthly_revenue: number,              // 当月营收
    active_performers: number,            // 活跃演员
    active_companies: number,             // 活跃活动公司
    performer_monthly_rate: number,       // 演员月接单率
    company_monthly_rate: number          // 活动公司月活率
  },
  message: "ok"
}
```

#### GET `/v1/admin/operation-logs`
操作日志

```
Auth: Bearer Token（admin）
Query:
  module?: string
  operator_id?: string
  date_from?: string
  date_to?: string
  page?: number
  pageSize?: number

Response 200:
{
  code: 0,
  data: {
    items: [{
      id: string,
      operator: { id: string, name: string },
      module: string,
      action: string,
      before?: object,
      after?: object,
      created_at: string
    }],
    total: number
  },
  message: "ok"
}
```

#### GET `/v1/admin/search`
通用搜索

```
Auth: Bearer Token
Query:
  q: string                     // 搜索关键词
  scope?: 'performers' | 'skus' | 'demands' | 'companies' | 'all'

Response 200:
{
  code: 0,
  data: {
    performers: [],
    skus: [],
    demands: [],
    companies: []
  },
  message: "ok"
}
```

---

### 2.16 通知 - `/v1/notifications`

#### GET `/v1/notifications`
获取通知记录

```
Auth: Bearer Token（admin）
Query:
  type?: 'sms' | 'wechat'
  status?: 'sent' | 'failed'
  page?: number
  pageSize?: number

Response 200:
{
  code: 0,
  data: {
    items: [{
      id: string,
      recipient: string,
      type: 'sms' | 'wechat',
      template: string,
      content: string,
      status: 'sent' | 'failed',
      sent_at: string
    }],
    total: number
  },
  message: "ok"
}
```

---

## 三、路由汇总

| 路由组 | 路径 | 需要权限 | 端点数 |
|--------|------|:------:|:-----:|
| Auth | `/v1/auth` | 公开 | 4 |
| SKU | `/v1/skus` | 读公开/写 admin | 10 |
| 需求 | `/v1/demands` | agent/client/admin | 7 |
| 订单 | `/v1/orders` | admin | 2 |
| 签约 | `/v1/contracts` | admin | 2 |
| 演员 | `/v1/performers` | admin/公开 | 4 |
| 咖位 | `/v1/performers/:id/tier` | admin | 3 |
| 信誉分 | `/v1/performers/:id/credit` | admin/performer | 2 |
| 排期 | `/v1/assignments` | admin/performer | 5 |
| 付款 | `/v1/payments` | admin/finance | 2 |
| 结算 | `/v1/settlements` | admin/finance | 3 |
| 评价 | `/v1/reviews` | agent/performer | 2 |
| 价格配置 | `/v1/price-configs` | admin | 2 |
| 活动公司 | `/v1/companies` | admin/agent | 4 |
| 运营工具 | `/v1/admin` | admin | 3 |
| 通知 | `/v1/notifications` | admin | 1 |
| **合计** | **16 组** | | **56 端点** |

---

> 版本：v1.0
> 更新规则：接口变更必须先更新本文档，再改代码。Orchestrator 负责维护。
