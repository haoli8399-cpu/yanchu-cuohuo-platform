# 多 Agent 协作开发方案

> 版本：v2.1
> 创建时间：2026-07-01
> 最后更新：2026-07-02（v2.1：新增构建验证 + 内容审查 + 风险登记册）
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
| **Orchestrator**（本窗口） | 契约编写 → 任务拆解 → 派发 → 审查 → 构建验证 → 部署验证 → 文档同步 | — | API_CONTRACT.md / 部署 / 文档 |
| **Agent-Backend** | Schema 迁移、API 实现、数据库、DeepSeek 集成 | Node.js + PostgreSQL | 后端代码 |
| **Agent-Web** | 运营后台 + 活动公司端 | Ant Design Pro / React | Web 前端 |
| **Agent-MiniProgram** | 甲方/活动公司小程序 + 演员小程序 | uni-app + NutUI | 小程序前端 |

---

## 二、核心原则

| # | 原则 | 说明 |
|:-:|------|------|
| 1 | **Contract-First** | API_CONTRACT.md 必须在一行代码之前完成 |
| 2 | **分层审查 + 内容验证** | 规范审查 + 逻辑审查 + 终审，**审查必须包含文件内容抽查** |
| 3 | **标准化 Context** | 子 Agent 的 context 使用固定模板，逐项填写 |
| 4 | **构建验证必经** | **所有前端产出必须构建成功并检查输出** |
| 5 | **部署冒烟测试** | 部署后 curl 验证关键页面内容（标题/数据） |
| 6 | **Blocker 优先** | 子 Agent 遇到阻塞立即标记，OC 优先处理 |
| 7 | **单次 ≤3 任务** | 每次派发给 Agent 的任务不超过 3 个，防止上下文过载 |

---

## 三、协作全流程

```
Phase 1：契约先行（OC 独立完成）
─────────────────────────────────────
  OC 编写 API_CONTRACT.md
    ├── 所有端点：路径 / 方法 / 入参 / 出参 / 错误码
    ├── 所有类型定义
    └── 豪哥确认 → FREEZE → commit

Phase 2-N：迭代开发（OC + 1-2 子 Agent）
─────────────────────────────────────

  OC 拆解本轮任务
    │
    ├── 读 FREEZE.md → 确认约束
    ├── 读 开发任务清单.md → 选待执行任务（每次 ≤3 个）
    ├── 构建标准化 context（按模板逐项填写）
    └── delegate_task 派发（1-2 个并行）
    │
    ▼
  子 Agent 开发
    │
    ├── 读 FREEZE.md → API_CONTRACT.md → CODE_STANDARDS.md
    ├── 写代码 + 自测
    ├── 遇到阻塞 → 标记 blocker（含阻塞原因 + 需要谁决策）
    └── 返回标准结果（代码路径 + 变更摘要 + 自测 + 附构建日志）
    │
    ▼
  ┌─────────────────────────────────────────────┐
  │  分层审查（三层）                              │
  │                                               │
  │  第一层：OC 审规范 (5 min)                      │
  │    grep 扫描：SQL注入/参数化/any类型/console   │
  │    ls 检查：文件是否存在                        │
  │                                               │
  │  第二层：Agent 交叉审逻辑 (10 min)              │
  │    BE 审 Web 的 API 调用方式                   │
  │    Web 审 MP 的接口调用逻辑                     │
  │                                               │
  │  第三层：OC 终审 (5 min) ★ 新增内容审查         │
  │    架构合理性 / FREEZE一致性 / 边界条件         │
  │    ★ 打开 1-2 个关键文件，审查实际业务内容       │
  │    ★ 前端：检查页面标题/核心文案是否匹配需求     │
  └─────────────────────────────────────────────┘
    │
    ├── 任何一层不通过 → 打回子 Agent（附审查意见）
    └── 全通过 → 进入构建验证
    │
    ▼
  OC 构建验证 ★ 新增环节
    │
    ├── 后端：npm run typecheck（如有）/ API自测
    ├── 前端：npm run build → 检查 dist/index.html 标题
    ├── 小程序：微信开发者工具编译检查
    ├── 构建失败 → 打回子 Agent
    └── 通过 → 进入部署冒烟测试
    │
    ▼
  OC 部署冒烟测试 ★ 增强环节
    │
    ├── 后端：部署 → curl 关键 API → 检查返回数据
    ├── 前端：部署 → curl 页面 → grep <title> 验证
    ├── 验证失败 → 回滚 + 修复
    └── 通过 → 进入完成
    │
    ▼
  OC 完成流程
    │
    ├── 更新 开发任务清单.md（状态变更）
    ├── 更新 API_CONTRACT.md（如有变更）
    ├── 更新 working_deployment.md
    ├── commit + push
    └── 汇报（附完整任务清单 + 进度）
```

---

## 四、标准化 Context 模板

```yaml
task:
  id: "任务编号"
  goal: "一句话任务目标"
  priority: "P0/P1/P2"

context:
  required_docs:
    - "docs/FREEZE.md"
    - "docs/API_CONTRACT.md"
    - "docs/CODE_STANDARDS.md"
  business_docs: ["相关业务文档路径"]
  tech_constraints: ["技术约束"]
  freeze_reminders: ["关键 FREEZE 决策摘要"]
  existing_code: ["已有代码参考"]
  api_contract: { endpoint, request, response }

result_format:
  code_paths: ["变更文件列表"]
  change_summary: "一句话描述"
  self_test: { passed: true, notes: "...", build_log: "附构建输出" }
  docs_to_update: ["需同步更新的文档"]
  known_issues: ["已知问题"]
  blocker: { exists: false, reason: "", needs_decision_from: "" }
```

---

## 五、子 Agent 标准返回格式

```yaml
result:
  code_paths: ["变更文件列表"]
  change_summary: "一句话描述"
  self_test:
    passed: true
    notes: "自测说明"
    build_output: "附构建命令输出的最后5行"  # ★ 新增：前端必填
  docs_to_update: ["需同步更新的文档"]
  known_issues: ["已知问题"]
  blocker:
    exists: false
    reason: ""
    needs_decision_from: ""
```

> **Blocker 规则**：子 Agent 遇到阻塞，立即设置 `blocker.exists: true`。OC 审查前先检查 blocker。

---

## 六、审查标准（v2.1 增强版）

### 第一层：OC 审规范（机械检查，5min）

| # | 检查项 | 方式 |
|:-:|--------|:--:|
| 1 | SQL 是否参数化 | grep 字符串拼接 |
| 2 | TypeScript `any` 使用 | grep 扫描 |
| 3 | API 响应格式是否统一 | 对照 CONTRACT |
| 4 | `console.log` / `debugger` | grep 扫描 |
| 5 | `.env` 文件是否误提交 | git diff |
| 6 | 文件是否存在 | ls 检查 |
| 7 | ★ 前端产出：检查 index.html 标题 | `grep '<title>'` |

### 第二层：Agent 交叉审逻辑（10min）

| 审查者 | 被审查者 | 审查重点 |
|:------:|:--------:|------|
| Agent-BE | Agent-Web | API 调用路径/参数/响应处理 是否与 CONTRACT 对齐 |
| Agent-Web | Agent-MP | 接口调用逻辑/状态处理/边界条件 |

### 第三层：OC 终审（5min）★ 强化

| # | 检查项 | 方式 |
|:-:|------|:--:|
| 1 | 整体架构是否合理 | 审查 |
| 2 | 是否违反 FREEZE 决策 | 对照 FREEZE.md |
| 3 | 边界条件是否覆盖 | 审查 |
| 4 | ★ 打开 1-2 个关键页面文件 | `read_file` 抽查内容 |
| 5 | ★ 前端：页面标题/文案/布局是否符合需求 | 业务对照 |

---

## 七、完成定义（DoD v2.1）

> 以下 8 项全部通过才算完成：

| # | 条件 | v2.1 |
|:-:|------|:----:|
| 1 | 代码审查三层全部通过 | — |
| 2 | ★ 构建验证通过 | 新增 |
| 3 | ★ 部署冒烟测试通过（curl + 内容验证） | 增强 |
| 4 | 开发任务清单.md 已更新 | — |
| 5 | API_CONTRACT.md 已同步 | — |
| 6 | commit + push | — |
| 7 | ★ 前端：dist/index.html 标题抽查通过 | 新增 |
| 8 | ★ Agent 返回了 build_output 证据 | 新增 |

---

## 八、任务派发规则

| 规则 | 说明 |
|------|------|
| **Contract-First 铁律** | API_CONTRACT.md 完成前，不派发任何代码任务 |
| **最多 2 并发** | 一次最多派发 2 个子 Agent |
| **★ 单 Agent ≤3 任务** | 每次派发不超过 3 个任务，防止过载跑偏 |
| **无依赖可并行** | 不共享文件的 Agent 可同时开工 |
| **有依赖串行** | Schema → API → 前端（按依赖链） |
| **Blocker 优先** | 子 Agent 标记阻塞 → OC 立即中断当前审查 |

---

## 九、质量铁律

| # | 规则 |
|:-:|------|
| 1 | **Contract-First：API_CONTRACT 不在代码之前完成 = 不允许写代码** |
| 2 | 不跳过任何一层审查 |
| 3 | **★ 不跳过构建验证（前端必 build 并检查输出）** |
| 4 | **★ 不跳过部署冒烟测试（curl + grep 验证页面内容）** |
| 5 | 不跳过集成测试 |
| 6 | 不让同一个 bug 出现两次（出 bug 后更新风险登记册） |
| 7 | 每完成一个模块 → commit + push |
| 8 | 文档与代码同步更新 |
| 9 | **★ 审查必须包含内容抽查，不止文件存在性** |

---

## 十、风险登记册 ★ 新增

### 已知风险（已发生）

| # | 风险 | 影响 | 发生次数 | 缓解措施 |
|:-:|------|:--:|:----:|------|
| R1 | **Agent 产出"表面正确、内容错误"** | 页面内容完全偏离需求 | 1次 | 构建验证 + 内容抽查 + curl 冒烟测试 |
| R2 | **Agent 产出"描述未产出"** | 报告说完成了但文件没写入 | 3次 | 第一层审查的 ls 检查（已有，但需严格执行） |
| R3 | **服务器内存不足（2C2G）** | API 崩溃、SSH 超时 | 多次 | 精简部署（裸机替代Docker）、计划升 2C4G |
| R4 | **Git push 超时** | 网络波动导致推送失败 | 多次 | `http.version=HTTP/1.1`、重试、后台推送 |
| R5 | **macOS SIGTRAP（tsc 崩溃）** | 本地 TypeScript 检查不可靠 | 持续 | 不依赖本地 tsc 输出作为"无错误"证据 |
| R6 | **子 Agent UUID 格式错误** | 种子数据无法导入数据库 | 1次 | 第一层审查增加 UUID 正则校验 |

### 潜在风险（未发生，需关注）

| # | 风险 | 影响 | 预防措施 |
|:-:|------|:--:|------|
| P1 | **Agent 修改他人已读文件** | 代码冲突、覆盖 | OC 在派发前标识文件归属 |
| P2 | **多 Agent 并行修改同一文件** | merge 冲突 | 严格控制并行 Agent 的文件交集 |
| P3 | **后端 API 认证中间件被绕过** | 安全漏洞 | 第三层审查检查所有端点 preHandler |
| P4 | **Agent 上下文污染** | 前次任务残留影响本次 | 每次派发重新构建 context，不依赖"历史记忆" |

---

> 版本：v2.1
> 触发方式：豪哥说「请执行多Agent协作方案」→ OC 自动按本文档全流程执行
> 变更记录：v2.1 (2026-07-02) — 新增构建验证、部署冒烟测试、内容抽查、单次≤3任务、风险登记册
