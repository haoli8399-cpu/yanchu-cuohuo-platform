# 冻结清单（FREEZE.md）

> 以下内容**不允许随意改动**。如果要改，必须得到豪哥明确确认。

---

## 1. 后端 API

| 项目 | 说明 |
|------|------|
| **冻结范围** | 全部16组/51端点：auth, skus, demands, orders, contracts, performers, tier, credit, assignments, payments, settlements, reviews, price-configs, companies, admin, notifications |
| **状态** | ✅ 已部署上线 |
| **原因** | 线上业务正在跑，API改动会影响所有前端（小程序+Web端+运营后台） |
| **如果要改** | 豪哥确认后，先在 API_CONTRACT.md 更新文档，再改代码，再部署。改动必须向后兼容。 |

## 2. 运营后台 Web 端

| 项目 | 说明 |
|------|------|
| **冻结范围** | `~/Documents/演出撮合平台/frontend-admin/` 全部代码 |
| **状态** | ✅ 已部署上线，34项功能全部实现 |
| **原因** | 运营团队日常使用中，改了会造成运营工作断档 |
| **如果要改** | 豪哥明确说"改运营后台" + 说明改什么功能 |

## 3. 活动公司 Web 端

| 项目 | 说明 |
|------|------|
| **冻结范围** | `frontend-agent/` 全部代码 |
| **状态** | ✅ 已部署上线，17项功能全部实现 |
| **原因** | 备用入口，线上可用。Web端与小程序功能一致，主攻小程序即可 |
| **如果要改** | 豪哥明确说"改Web端" + 说明改什么 |

## 4. 数据库结构

| 项目 | 说明 |
|------|------|
| **冻结范围** | PostgreSQL 数据库表结构、字段、索引 |
| **状态** | ✅ 已部署运行 |
| **原因** | 数据库改造成本极高，涉及后端代码、已有数据迁移，容易引发线上故障 |
| **如果要改** | 豪哥确认 + 完整的迁移方案 + 备份 + 灰度 |

## 6. 当前任务：小程序设计方案对齐落地

> **这是目前唯一在执行的开发任务**，每次执行任务前必须先读本段，严格按照 3 批计划执行，不可跳批次/改顺序。

| 项目 | 说明 |
|------|------|
| **任务概述** | 小程序端（miniprogram/）UI/UX 与「喜剧工厂小程序设计方案」完全对齐 |
| **方案来源** | `~/Desktop/喜剧工厂小程序设计方案.zip` → 解压到 `/Users/wudixingyunxingleo/CodeBuddy/20260704225501/喜剧工厂设计方案/` |
| **可改范围** | 仅 `miniprogram/` 目录下代码，其他三个子项目（backend/frontend-admin/frontend-agent）严禁改动 |
| **验收标准** | 每个页面与设计方案 HTML 原型视觉一致，CSS Token 体系完全匹配 |

### 执行顺序（3 批，不可逆）

| 批次 | 内容 | 页面 | 状态 |
|:----:|------|------|:----:|
| **第 1 批** | 全局基础 + 高频页面 | CSS Tokens 体系 → 登录页 → 发现页 | ✅ 已完成 |
| **第 2 批** | 活动公司端页面 | 方案列表/详情 → 需求提交/列表/详情 → 个人中心(公司) | ✅ 已完成 |
| **第 3 批** | 演员端页面 | 排期列表/详情/日历 → 结算/签到/信誉分 → 演员入驻 → 个人中心(演员) | ⏳ 待第 2 批验收 |

### 每批工作流

```
1. 读本文件（FREEZE.md）第 6 节 → 确认当前批次
2. 读对应页面的设计方案 HTML → 确认视觉规范
3. 读 colors_and_type.css → 确认 CSS Token 值
4. 执行修改
5. 编译验证（npx uni build --platform mp-weixin）
6. 通知豪哥验收
7. 豪哥确认后，更新本文件批次状态为 ✅，进入下一批
```

### 设计文件索引

| 页面 | 设计文件路径 |
|------|-------------|
| CSS Tokens | `喜剧工厂设计方案/workspace/comedy-factory/colors_and_type.css` |
| 登录页 | `喜剧工厂设计方案/workspace/comedy-factory/pages/login.html` |
| 发现页 | `喜剧工厂设计方案/workspace/comedy-factory/pages/discover.html` |
| 方案列表 | `喜剧工厂设计方案/workspace/comedy-factory/pages/sku-list.html` |
| 方案详情 | `喜剧工厂设计方案/workspace/comedy-factory/pages/sku-detail.html` |
| 需求列表 | `喜剧工厂设计方案/workspace/comedy-factory/pages/request-list.html` |
| 提交需求 | `喜剧工厂设计方案/workspace/comedy-factory/pages/request-submit.html` |
| 需求详情 | `喜剧工厂设计方案/workspace/comedy-factory/pages/request-detail.html` |
| 个人中心(公司) | `喜剧工厂设计方案/workspace/comedy-factory/pages/user-company.html` |
| 个人中心(演员) | `喜剧工厂设计方案/workspace/comedy-factory/pages/user-performer.html` |
| 排期列表 | `喜剧工厂设计方案/workspace/comedy-factory/pages/schedule-list.html` |
| 排期详情 | `喜剧工厂设计方案/workspace/comedy-factory/pages/schedule-detail.html` |
| 结算页 | `喜剧工厂设计方案/workspace/comedy-factory/pages/settlement.html` |
| 签到页 | `喜剧工厂设计方案/workspace/comedy-factory/pages/checkin.html` |
| 信誉分页 | `喜剧工厂设计方案/workspace/comedy-factory/pages/credit.html` |
| 演员入驻 | `喜剧工厂设计方案/workspace/comedy-factory/pages/onboarding.html` |

---

## 5. 价格体系

| 项目 | 说明 |
|------|------|
| **冻结范围** | 三种价格（内部结算价/活动公司7折/甲方标准价），T0-T6咖位定价表，套餐定价 |
| **状态** | ✅ 已定型 |
| **原因** | 价格体系是商业模式核心，豪哥和运营团队已确认，不可推翻 |
| **如果要改** | **可扩展不可推翻**。即：可以加新套餐/新咖位，不能改现有价格逻辑。需豪哥确认。 |
