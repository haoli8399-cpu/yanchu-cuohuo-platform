# Review Protocol — 演立方/喜剧工厂

> Qoder 独立审核的标准流程。铁律：开发 Agent 不审核自己的代码。

---

## Review 触发

Hermes 在以下情况触发 Quality Gate：
- Codex/CodeBuddy/Trae IDE 完成开发任务
- 提交 PR 后
- 阶段性里程碑完成后

**不需要 Review 的情况：**
- 文档修改（.md 文件）
- 纯配置变更（无逻辑改动）
- 5 行以内的 typo 修复
- Trae Work 的设计方案（由 Hermes 直接确认）

---

## Review 流程

```
执行 Agent 完成
    │
    ▼
Qoder Code Review    ← 架构/代码质量/安全
    │
    ▼
Qoder Feature Review ← PRD符合度/功能完整性
    │
    ▼
Qoder UI Review      ← 设计一致性/组件复用（仅UI任务）
    │
    ├── ✅ 全部通过 → Hermes 验收
    └── ❌ 不通过 → 退回执行Agent → 修复 → 重新Review
```

---

## Review 分级

| 级别 | 含义 | 处理 |
|------|------|------|
| 🔴 Block | 致命缺陷 | 必须修复才能合并 |
| 🟡 Warning | 设计问题/隐患 | 强烈建议修复 |
| 🔵 Suggestion | 风格/优化 | Author自行决定 |

---

## Review 报告格式

```
文件:行号 | 类型 | 问题 | 建议修复
```

---

## UI 项目专用流程

```
Trae Work 设计 → Hermes确认 → Trae IDE 实现 → Qoder UI Review → Hermes验收
```

Qoder UI Review 重点检查：
- 设计还原度（与 Trae Work 方案对比）
- 布局/间距/字体/色彩（Design Token 使用）
- 组件一致性（同类场景同一组件）
- 响应式（320/768/1024/1440 断点）
- 用户体验（交互反馈/状态覆盖）
