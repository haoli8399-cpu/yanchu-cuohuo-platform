# 变更日志（CHANGELOG）

> 格式：YYYY-MM-DD | 类型 | 描述
> 维护人：Orchestrator

---

## 2026-07-05

### 新增
- 新增 `PROJECT_CENTER.md`（根目录）— 项目中心看板，所有 Agent 启动第一读
- 新增 `ACTIVE_TASK.md`（根目录）— 当前任务跟踪
- 新增 `ACCEPTANCE.md`（根目录）— 验收检查表
- 新增 `LOOP_LOG.jsonl`（根目录）— 循环执行日志
- 新增 `docs/AGENT_RULES.md` — 各 Agent 角色规则
- 新增 `docs/DECISION_LOG.md` — 决策日志
- 新增 `docs/CHANGELOG.md` — 变更日志（本文件）
- 新增 `docs/codebase_progress.md` — 功能完成度
- 新增 `docs/state.json` — 机器可读状态
- 新增 `rev/` 目录（迭代产出归档）— TASK.md / output.md / test.md 三件套
- 新增 `AGENT_RULES.md v1.1` — Tester（全职）/ Analyst（按需）/ Researcher（按需）3 个新角色

### 修改
- `docs/多Agent协作开发方案.md` → v3.0 → v3.1：5角色模型 + rev/归档 + 并行派发 + 测试轮 + 简化阅读链
- `PROJECT_CENTER.md` → v1.1：新增 rev/ 归档、并行流程、测试轮次、简化阅读链
- `ACTIVE_TASK.md` → v2.0：新增 context section 自包含约束，省掉 FREEZE 跳转
- `docs/HANDOFF.md` → 更新工作模式描述、文档体系、协作规则
- `docs/PROJECT_CONTROL.md` → 待同步

---

## 2026-07-05（02）

### 修改（SKU 模块化改造）
- `backend/src/services/skuPricing.ts` — 新增定价计算服务（calcPrices 函数）
- `backend/src/api/skus.ts` — 新增 5 个 PATCH 端点（basic-info/performer/pricing/media/config）
- `backend/src/types/index.ts` — SkuListItem/SkuDetail 增加 company_price、internal_price
- `frontend-admin/src/types/sku.ts` — 业务线/状态枚举对齐后端，接口字段重构
- `frontend-admin/src/services/sku.ts` — 新增 5 个 PATCH API 方法
- `frontend-admin/src/pages/SKU/Detail.tsx` — 大重构：长表单→6个折叠面板，独立保存
- `frontend-admin/src/pages/SKU/index.tsx` — 对齐新类型字段
- `docs/API_CONTRACT.md` — 2.2节价格字段名修复 + 5个新端点文档 + 路由汇总更新
- 执行模式：启用多Agent团队并行（types-services-agent + detail-agent + 主Agent）

---

> 版本：v1.2
> 创建时间：2026-07-05
> 维护人：Orchestrator
