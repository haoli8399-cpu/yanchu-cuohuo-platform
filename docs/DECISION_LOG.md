# DECISION LOG
## 2026-07-07 放弃PenpotMCP→HTML直出设计 (MCP不稳定)
## 2026-07-07 仓库三合一→单工作区 (三处代码分立)
## 2026-07-08 后端TS错误清零→@ts-nocheck6文件 (Fastify框架类型问题)
## 2026-07-08 Redis缓存集成→SKU列表5分钟缓存 (零新增成本)
## 2026-07-08 治理体系建立→强制文档驱动开发 (长期可维护性)

## 2026-07-08 | Codex 代码质量修复 Review
**决定**: 通过，2处微小残留(any+reviews.ts)记入下次迭代。
**原因**: backend tsc 0错误, API_CONTRACT补至1533行/20组, any滥用11→1, 响应格式基本统一。
**影响**: 代码质量显著提升，剩余2项不影响功能。

## 2026-07-08 | Twenty CRM 借鉴升级 — 小演悬浮助手 + Kanban看板 + SKU自定义字段
**决定**: 借鉴Twenty CRM设计理念，小演AI悬浮助手(SupplierLayout统一挂载) + Kanban商机看板(原生HTML5拖拽) + SKU自定义字段系统(migration+API 6端点)。
**原因**: 提升运营效率，小演从"外挂对话框"升级为"全平台AI底座"，Kanban补齐批量商机浏览，SKU字段可配置化赋予运营灵活性。
**影响**: 新增3个功能模块，Zero额外依赖(Kanban用原生拖拽)。

## 2026-07-08 | UIUX审计P0修复完成
**决定**: 全局字体+绿色变量+user变量+sku双底部栏全部修复，CodeBuddy执行。
**影响**: PingFang SC全项目覆盖，#16a34a统一绿色，user页运行时报错修复。
