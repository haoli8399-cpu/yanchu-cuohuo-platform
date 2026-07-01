# 多 Agent 协作开发方案

> 版本：v2.0
> 创建时间：2026-07-01
> 最后更新：2026-07-01（豪哥确认优化方案：Contract-First + 分层审查 + Peer Review + 集成测试）
> 状态：✅ 已确认，正式执行

---

## 一、Agent 角色定义

```
┌─────────────────────────────────────────────────────────┐
│                  Agent-Orchestrator（主控）               │
│                  职责：调度 / 审查 / 集成 / 部署 / 文档     │
│                  本窗口运行，不写业务代码                   │
└──────┬──────────────┬──────────────┬────────────────────┘
       │              │              │
       ▼              ▼              ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│Agent-Backend│ │ Agent-Web  │ │Agent-MiniP│
│  后端开发    │ │  Web前端   │ │  小程序    │
│  Schema/API │ │  运营后台+  │ │  双端开发   │
│  数据库/部署 │ │  活动公司端 │ │            │
└────────────┘ └────────────┘ └────────────┘
```

| Agent | 职责范围 | 技术栈 | 产物 |
|-------|---------|--------|------|
| **Orchestrator**（本窗口） | 契约编写 → 任务拆解 → 派发 → 分层审查 → 集成测试 → 部署验证 → 文档同步 | — | API_CONTRACT.md / 部署 / 文档 |
| **Agent-Backend** | Schema 迁移、API 实现、数据库、DeepSeek 集成 | Node.js + PostgreSQL | 后端代码 |
| **Agent-Web** | 运营后台 34 项 + 活动公司工作台 17 项 | Ant Design Pro + React | Web 前端 |
| **Agent-MiniProgram** | 甲方/活动公司小程序 13 项 + 演员小程序 14 项 | uni-app + NutUI | 小程序前端 |

---

## 二、核心原则

| # | 原则 | 说明 |
|:-:|------|------|
| 1 | **Contract-First（契约先行）** | API_CONTRACT.md 必须在一行代码之前完成。前后端 Agent 各自对着同一份契约开发，互不依赖 |
| 2 | **分层审查** | OC 审规范 + Agent 互相审逻辑 + OC 终审，避免 OC 成为瓶颈 |
| 3 | **标准化 Context** | 子 Agent 的 context 使用固定模板，逐项填写，不凭记忆 |
| 4 | **集成测试必经** | 前后端各自自测通过→集成测试→端到端验证，不可跳过 |
| 5 | **Blocker 优先** | 子 Agent 遇到阻塞立即标记，OC 优先处理 |

---

## 三、协作全流程

```
Phase 1：契约先行（OC 独立完成）
─────────────────────────────────────
  OC 编写 API_CONTRACT.md
    ├── 所有端点：路径 / 方法 / 入参 / 出参 / 错误码
    ├── 所有类型定义：User / SKU / Demand / Order / Performer ...
    └── 豪哥确认 → FREEZE → commit

Phase 2-N：迭代开发（OC + 1-2 子 Agent）
─────────────────────────────────────

  OC 拆解本轮任务
    │
    ├── 读 FREEZE.md → 确认约束
    ├── 读 开发任务清单.md → 选待执行任务
    ├── 构建标准化 context（按模板逐项填写）
    └── delegate_task 派发（1-2 个并行）
    │
    ▼
  子 Agent 开发
    │
    ├── 读 FREEZE.md → API_CONTRACT.md → CODE_STANDARDS.md
    ├── 写代码 + 自测
    ├── 遇到阻塞 → 标记 blocker（含阻塞原因 + 需要谁决策）
    └── 返回标准结果（代码路径 + 变更摘要 + 自测 + docs_to_update）
    │
    ▼
  ┌─────────────────────────────────────────────┐
  │  分层审查（三层）                              │
  │                                               │
  │  第一层：OC 审规范 (5 min)                      │
  │    自动检查项：SQL注入/参数化查询/类型/格式       │
  │                                               │
  │  第二层：Agent 交叉审逻辑 (10 min)              │
  │    BE 审 Web 的 API 调用方式                   │
  │    Web 审 MP 的接口调用逻辑                     │
  │    (如果只有一个 Agent 产出，跳过此层)          │
  │                                               │
  │  第三层：OC 终审 (5 min)                       │
  │    整体架构 / 边界条件 / 与 FREEZE 一致性        │
  └─────────────────────────────────────────────┘
    │
    ├── 任何一层不通过 → 打回子 Agent（附审查意见）
    └── 全通过 → 进入集成测试
    │
    ▼
  OC 集成测试
    │
    ├── 后端 API + 前端页面 联调验证
    ├── 检查 API 契约一致性（请求/响应是否与 CONTRACT 一致）
    └── 通过 → 进入部署验证
    │
    ▼
  OC 部署验证
    │
    ├── 后端：部署到腾讯云 → 跑 API 测试 → 查日志
    ├── 前端：构建 → 本地预览
    └── 通过 → 进入完成
    │
    ▼
  OC 完成流程
    │
    ├── 更新 开发任务清单.md（状态变更）
    ├── 更新 API_CONTRACT.md（如有新增接口）
    ├── 更新 working_deployment.md（部署状态）
    ├── commit + push
    └── 向豪哥汇报（附完整任务清单 + 进度标注）
```

---

## 四、标准化 Context 模板

> OC 派发任务时必须逐项填写，不可遗漏。

```yaml
task:
  id: "任务编号（对应开发任务清单.md）"
  goal: "一句话任务目标"
  priority: "P0/P1/P2"

context:
  # 必须提供的文档清单
  required_docs:
    - "docs/FREEZE.md"
    - "docs/API_CONTRACT.md"
    - "docs/CODE_STANDARDS.md"
  
  # 业务相关文档
  business_docs:
    - "docs/产品功能清单.md  # 当前任务对应功能：P-22"
  
  # 技术约束
  tech_constraints:
    - "数据库：PostgreSQL 参数化查询"
    - "API 响应格式：{ code, data, message }"
  
  # FREEZE 提醒（关键约束摘要）
  freeze_reminders:
    - "活动公司价 = 甲方标准价 × 0.7"
    - "不做在线支付，全部线下登记"
  
  # 已有代码（如有）
  existing_code:
    - "backend/src/api/skus.ts  # 参考已有 SKU API 写法"
  
  # 接口定义（本次任务涉及的 API）
  api_contract:
    endpoint: "POST /v1/skus"
    request: '{ name: string, ... }'
    response: '{ code: 0, data: { id: uuid } }'

result_format:
  code_paths: ["变更文件列表"]
  change_summary: "一句话描述"
  self_test: { passed: true, notes: "..." }
  docs_to_update: ["需同步更新的文档"]
  known_issues: ["已知问题"]
  blocker: { exists: false, reason: "", needs_decision_from: "" }
```

---

## 五、子 Agent 标准返回格式（含 Blocker）

```yaml
result:
  code_paths:
    - "backend/src/api/skus.ts"
    - "backend/src/schema/skus.sql"
  change_summary: "实现 SKU CRUD API：新增/编辑/列表/上下架 4 个端点"
  self_test:
    passed: true
    notes: "4 个端点均返回正确数据，边界条件已覆盖"
  docs_to_update:
    - "API_CONTRACT.md  # /v1/skus 端点已实现，契约无变化"
    - "working_deployment.md  # skus 表迁移完成"
  known_issues:
    - "上下架权限校验待 P-32 RBAC 完成后补充"
  blocker:
    exists: false
    reason: ""
    needs_decision_from: ""
```

> **Blocker 规则**：子 Agent 遇到阻塞（如 API_CONTRACT 与实际行为矛盾、技术方案不可行），立即在返回结果中设置 `blocker.exists: true`。OC 在审查前先检查 blocker，有阻塞优先处理。

---

## 六、分层审查标准

### 第一层：OC 审规范（CODE_STANDARDS 机械检查）

| # | 检查项 | 方式 |
|:-:|--------|:--:|
| 1 | SQL 是否参数化 | grep 字符串拼接 |
| 2 | TypeScript `any` 使用 | grep 扫描 |
| 3 | API 响应格式是否统一 | 对照 CONTRACT |
| 4 | `console.log` / `debugger` | grep 扫描 |
| 5 | `.env` 文件是否误提交 | git diff --staged |

> 第一层审查由 OC 在 5 分钟内完成。不通过的项直接打回，附 grep 扫描结果。

### 第二层：Agent 交叉审逻辑

| 审查者 | 被审查者 | 审查重点 |
|:------:|:--------:|------|
| Agent-BE | Agent-Web | API 调用路径/参数/响应处理 是否与 CONTRACT 对齐 |
| Agent-Web | Agent-MP | 接口调用逻辑/状态处理/边界条件 |

> 通过 delegate_task 派发审查任务。审查 Agent 返回通过/不通过+具体问题。

### 第三层：OC 终审

| # | 检查项 |
|:-:|------|
| 1 | 整体架构是否合理 |
| 2 | 是否违反 FREEZE 决策 |
| 3 | 边界条件是否覆盖 |
| 4 | 与其他 Agent 的代码是否有冲突 |

---

## 七、完成定义（DoD）

> 以下 6 项全部通过才算任务完成：

| # | 条件 | 验证人 |
|:-:|------|:------:|
| 1 | 代码审查三层全部通过 | OC |
| 2 | 集成测试通过 | OC |
| 3 | 部署验证通过 | OC |
| 4 | 开发任务清单.md 已更新 | OC |
| 5 | API_CONTRACT.md 已同步（如有变更） | OC |
| 6 | commit + push | OC |

---

## 八、任务派发规则

| 规则 | 说明 |
|------|------|
| **Contract-First 铁律** | API_CONTRACT.md 完成前，不派发任何代码任务 |
| **最多 2 并发** | 一次最多派发 2 个子 Agent |
| **无依赖可并行** | 不共享文件的 Agent 可同时开工 |
| **有依赖串行** | Schema → API → 前端（按依赖链） |
| **Blocker 优先** | 子 Agent 标记阻塞 → OC 立即中断当前审查，优先处理 |

---

## 九、质量铁律

| # | 规则 |
|:-:|------|
| 1 | **Contract-First：API_CONTRACT 不在代码之前完成 = 不允许写代码** |
| 2 | 不跳过任何一层审查 |
| 3 | 不跳过集成测试 |
| 4 | 不在审查通过前 commit |
| 5 | 不让同一个 bug 出现两次（出 bug 后更新审查清单） |
| 6 | 每完成一个模块 → commit + push |
| 7 | 文档与代码同步更新 |
| 8 | OC 写文档，子 Agent 只读不写 |

---

> 版本：v2.0
> 触发方式：豪哥说「请执行多Agent协作方案」→ OC 自动按本文档全流程执行
