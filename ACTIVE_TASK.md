# 当前活动任务

> 本文件记录本轮执行任务的完整信息。
> v2.0 更新：自带上下文 section，Developer 读完后大部分情况不需要再跳读 FREEZE.md。
> 由 Orchestrator 在每次任务开始前写入，任务结束后清除。

---

## 任务信息

| 字段 | 内容 |
|:----|------|
| **任务编号** | r01 |
| **迭代名称** | 多 Agent 框架优化落地 |
| **目标** | 基于「多 Agent 项目协作工厂」Skill 优化喜剧工厂协作框架 |
| **关联决策** | D-20260705-001 / D-20260705-002 |

## 上下文（v2.0 新增 — 自包含约束）

> 以下是与本任务相关的所有约束，Developer 不需要额外跳读 FREEZE.md：

| # | 约束 | 说明 |
|:-:|------|------|
| 1 | **文档主写子读** | Orchestrator 独占写中心文档，子 Agent 只读不改 |
| 2 | **改代码先审批** | 不能直接写代码，先让豪哥确认 |
| 3 | **不碰 docs/ 和 rev/** | 子 Agent 不写不删不改中心文档和归档目录 |
| 4 | **不碰 FREEZE 决策** | 已冻结的决策不能质疑或更改 |
| 5 | **本任务纯文档优化** | 不涉及业务代码变更 |

## 验收标准

- [ ] `rev/` 目录创建完毕，含 README.md 和 r01 归档
- [ ] `AGENT_RULES.md` 包含 5 个角色（OC/Developer/Tester/Analyst/Researcher）
- [ ] `PROJECT_CENTER.md` 工作流含并行派发 + 测试轮 + 简化链
- [ ] `ACTIVE_TASK.md` 自带上下文 section
- [ ] `多Agent协作开发方案.md` 更新到 v3.1
- [ ] 5 个一致性文件同步 + git commit + push

## 文件范围

| 文件 | 操作 | 说明 |
|:----|:----:|------|
| rev/README.md | 🆕 新增 | 归档目录说明 |
| rev/r01/TASK.md | 🆕 新增 | 本任务 TASK 归档拷贝 |
| rev/r01/output.md | 🆕 新增 | 产出说明 |
| rev/r01/test.md | 🆕 新增 | 测试记录 |
| docs/AGENT_RULES.md | 📝 修改 | 新增 Tester/Analyst/Researcher |
| PROJECT_CENTER.md | 📝 修改 | v1.1 升级 |
| ACTIVE_TASK.md | 📝 修改 | v2.0 自包含 |
| docs/多Agent协作开发方案.md | 📝 修改 | v3.1 |
| docs/DECISION_LOG.md | 📝 修改 | 加新决策 |
| docs/CHANGELOG.md | 📝 修改 | 加变更记录 |
| docs/codebase_progress.md | 📝 修改 | 更新进度 |
| docs/state.json | 📝 修改 | 更新状态 |

---

> 状态：🔄 执行中
> 最后更新：2026-07-05
