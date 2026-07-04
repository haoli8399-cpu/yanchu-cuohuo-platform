# 喜剧工厂 · 项目中心

> 版本：v1.1
> 创建时间：2026-07-05
> 更新说明：新增 rev/ 归档、并行派发流程、测试轮次、简化阅读链
> 作用：所有 Agent 启动后第一读，3 秒知道项目全局
> 维护人：Orchestrator（主控窗口独占写入，子 Agent 只读不改）

---

## 一、当前状态

| 维度 | 状态 |
|:----|------|
| **项目代号** | 喜剧工厂 — B2B 撮合平台（活动公司 ↔ 演员匹配+出方案+保履约） |
| **阶段** | 迭代维护 |
| **当前任务** | r01 — 多 Agent 框架优化落地 |
| **当前任务状态** | 🔄 执行中 |
| **下一任务** | 待定 |
| **远端仓库** | `haoli8399-cpu/yanchu-cuohuo-platform` |
| **服务器** | 腾讯云香港 2C2G（API: 3002） |
| **技术栈** | Fastify / PostgreSQL / Ant Design Pro / uni-app |

---

## 二、项目三要素

| 要素 | 说明 |
|:----|------|
| **仓库** | `https://github.com/haoli8399-cpu/yanchu-cuohuo-platform.git` |
| **服务器** | 腾讯云香港 2C2G，SSH 别名 `tencent` |
| **技术栈** | 后端 Fastify / 数据库 PostgreSQL（裸机 apt）/ Web Ant Design Pro / 小程序 uni-app + NutUI |

---

## 三、活跃决策（近期确认）

| 编号 | 决策 | 确认时间 | 状态 |
|:----:|------|:--------:|:----:|
| D-20260704-001 | SKU 模块化改造方案确认 | 2026-07-04 | ✅ 已确认，待执行 |
| D-20260704-002 | "演事"废弃，新方向 = 喜剧工厂 B2B 撮合 | 2026-07-04 | ✅ 已确认 |
| D-20260705-001 | 多 Agent + Loop 工程化方案确认 | 2026-07-05 | ✅ 已确认 |
| D-20260705-002 | 多 Agent 协作工厂 Skill 框架优化落地 | 2026-07-05 | 🆕 本轮确认 |

---

## 四、活跃约束（精简版）

> 完整约束见 `docs/FREEZE.md`，以下是所有 Agent 必须记住的底线：

| # | 约束 | 说明 |
|:-:|------|------|
| 1 | 不做在线支付 | 全部线下登记（定金/尾款/演员结算） |
| 2 | 不做竞标模式 | 运营人工驱动匹配 |
| 3 | 活动公司两步入驻 | 注册即用，交易前认证挡板 |
| 4 | 第一阶段不开放甲方端 | 只有运营后台 + 活动公司端 |
| 5 | 价格三套 | 内部结算价 / 甲方标准价 / 活动公司价（×0.7） |
| 6 | 文档主写子读 | Orchestrator 独占写入 docs/ 文件，子 Agent 只读 |
| 7 | 改代码先审批 | 任何方案先给方向 → 豪哥确认 → 再动手 |
| 8 | 每批 ≤3 个文件 + ≤1 个依赖 | 控制变更范围 |
| 9 | 子 Agent 启动必读 | PROJECT_CENTER.md → TASK.md → FREEZE.md → 相关文档 |
| 10 | 子 Agent 不碰中心文档 | 不写/不删/不改 docs/、rev/ 和根目录中心文件 |

---

## 五、当前任务子状态

| 子模块 | 谁负责 | 状态 |
|-------|:------:|:----:|
| rev/ 归档目录 | OC | ✅ 已完成 |
| AGENT_RULES.md 5角色 | OC | 🔄 执行中 |
| PROJECT_CENTER.md v1.1 | OC | 🔄 执行中 |
| ACTIVE_TASK.md 自包含 | OC | 🔄 执行中 |
| 多Agent方案 v3.1 | OC | ⏳ 待执行 |

---

## 六、协作规则速查（v1.1 更新）

### 标准流程（单 Developer）

```
豪哥说需求 → OC 写 TASK.md（含上下文）→ 更新 PROJECT_CENTER.md
  → 豪哥到工作窗口说"读根目录 TASK.md"
  → Developer 读 PROJECT_CENTER → TASK → FREEZE → 相关文档
  → 写代码 → 自测 → 回报给 OC
  → [可选] OC spawn Tester 做功能验证 → 写入 rev/rNN/test.md
  → OC 三层审查（格式/规范/逻辑）
  → 通过 → 归档 rev/rNN/ → 同步 5 文件 → git commit + push
  → 不通过 → 打回 Developer（最多 3 次，超限 Blocked）
```

### 并行流程（≥2 个独立子任务，v1.1 新增）

```
豪哥说需求 → OC 拆成 2 个独立子任务
  → 写 TASK-A.md + TASK-B.md（各自包含上下文）
  → 豪哥到 窗口A 说"读根目录 TASK-A.md"
  → 豪哥到 窗口B 说"读根目录 TASK-B.md"
  → Developer A 和 Developer B 各自执行
  → 各自自测 → 各自回报
  → OC 做集成测试（联调验证）
  → 合并归档到 rev/rNN/
  → 同步 5 文件 → git commit + push
```

### 阅读简化（v1.1 优化）

> TASK.md 现在自带上下文（constraints/context section），
> Developer 读完 TASK.md 后大部分情况不需要再跳读 FREEZE.md，
> 省掉 1-2 次文件跳转。

```
Developer 阅读链（简化为 3 步）：
  1. PROJECT_CENTER.md（3秒看全局）
  2. TASK.md（含上下文约束 → 直接开干）
  3. 相关业务/技术文档（按需）
```

---

## 七、项目结构

```
喜剧工厂/
├── PROJECT_CENTER.md     ← 入口（v1.1）
├── ACTIVE_TASK.md         ← 当前任务（自包含上下文）
├── ACCEPTANCE.md          ← 验收表
├── LOOP_LOG.jsonl         ← 循环日志
├── rev/                   ← 迭代产出归档（v1.1 新增）
│   ├── README.md
│   └── rNN/
│       ├── TASK.md
│       ├── output.md
│       └── test.md
├── docs/
│   ├── HANDOFF.md
│   ├── AGENT_RULES.md     ← 5角色（v1.1）
│   ├── FREEZE.md
│   ├── 多Agent协作开发方案.md  ← v3.1
│   ├── DECISION_LOG.md
│   ├── CHANGELOG.md
│   ├── codebase_progress.md
│   ├── state.json
│   └── (业务/技术文档)
├── backend/
├── web-admin/
└── mini-program/
```

---

## 八、更新记录

| 日期 | 版本 | 变更内容 | 更新人 |
|:----:|:----:|---------|:------:|
| 2026-07-05 | v1.0 | 创建 PROJECT_CENTER.md | OC |
| 2026-07-05 | v1.1 | 新增 rev/ 归档、并行流程、测试轮次、简化阅读链 | OC |
