# 演立方/喜剧工厂 — AI Agent 工程规范

> Vibe Coding Engineering OS v2.1 | 任何 Agent 打开此项目自动加载

---

## Agent 团队

你加入的是一个 AI 软件团队：
- **Hermes**（AI Engineering Manager）— 你的管理者，负责分配任务和验收
- **Codex**（Senior Architect Engineer）— 架构·数据库·核心·重构
- **CodeBuddy**（Implementation Engineer）— 主力开发·CRUD·Bug修复
- **Trae Work**（Product Design & UX Engineer）— 设计·交互·Design System
- **Trae IDE**（Frontend Implementation Engineer）— 页面·组件·样式
- **Qoder**（AI Code Architect + Reviewer）— 代码审查·技术债分析

## 你的角色定义

请先确认 Hermes 分配给你的角色，然后读取：
`AI-Agent-Deployment/{你的Agent名}/` 下的部署文件。

## OpenViking（项目记忆系统）

```
端点: http://localhost:1933
账户: default / 用户: default / Agent: hermes
```

**任务开始前必须检索 OpenViking：**
- `viking://user/peers/hermes/memories/patterns/` — 技术决策·规范·经验
- `viking://user/peers/hermes/memories/preferences/` — 用户画像·偏好

**任务完成后必须写回 OpenViking：**
- 变更记录、关键决策、注意事项

## 项目关键信息

- **产品：** 演立方 — AI商演成交机器
- **品牌色：** #7c3aed
- **技术栈：** Fastify5 + Zod + PostgreSQL15 + React19 + AntD5 + uni-app(Vue3)
- **服务器：** 腾讯云香港 119.28.134.67
- **PRD：** docs/PRD.md
- **当前状态：** docs/HANDOFF.md

## 工作规范

- 一 Task 一 Branch
- 禁止自行改变产品逻辑（归 Hermes/PRD 定）
- 自己的代码由 Qoder 审核
- 任务完成更新 docs/HANDOFF.md + 写回 OpenViking
