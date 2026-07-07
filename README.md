# 演立方 YANLI · AI 商演成交机器

## 项目状态

| 项 | 状态 |
|:---|:----:|
| 品牌体系 | ✅ V2.0 定版（演立方 YANLI / 小演 / 副标题 / 占位语） |
| 设计预览 19 页 | ✅ 全部完成 |
| Design Token | ✅ CSS Variables 体系定义 |
| 组件库 CSS | ✅ 原子+复合层（Button/Card/Tag/Status/Table/Funnel/Insight 等）|
| AI成交日报 React 组件 | ✅ 完整 TSX + CSS |
| 项目治理文件 | ✅ PROJECT_CONTROL.md + AGENT_RULES.md |

## 文件结构

```
演出撮合平台/
├── PROJECT_CONTROL.md              # 项目治理（范围/架构/路线图/规则）
├── AGENT_RULES.md                  # AI Agent 行为规范
├── docs/
│   ├── DESIGN_SYSTEM.md            # 设计系统（旧版，需更新）
│   └── tokens/
│       └── variables.css           # ★ Design Token 正式文件（品牌色/组件/布局）
├── supplier-console/               # Phase 1 核心
│   └── src/pages/DailyReport/
│       ├── DailyReport.tsx         # ★ AI成交日报 React 组件（生产可用）
│       └── DailyReport.css         # ★ 配套样式
├── 演立方设计预览/
│   └── index.html                  # ★ 19 页完整设计预览
├── desktop/演立方设计预览/          # 桌面快捷入口
│   └── index.html
```

## 待执行项（优先级排序）

```
P0 — 立即
├── 用组件库拼装 销售作战台 页面（React TSX）
├── 把 DESIGN_SYSTEM.md 更新为品牌 V2.0 版本
└── 把组件库打包为 npm 包 / 文档站

P1 — 本周
├── SKU管理 页面
├── 利润看板 页面
└── 订单管理 页面

P2 — 下周
├── 小程序端 7 页（uni-app + Vue3）
├── PC Web 端 2 页
└── Platform-Admin 1 页

P3 — 待定
├── Penpot MCP 后端 API 集成（修复导出问题）
└── 组件 Storybook 文档站
```

## 关键决策记录

1. **Penpot MCP 不稳定 → 绕过**：用 HTML 预览替代 Penpot 导出，直接代码生成
2. **组件库框架**：React + CSS Variables（不锁定 UI 库，可适配 Ant Design 6）
3. **品牌优先级**：演立方 YANLI 统一品牌 > 组件精细化 > 页面堆量
4. **开发顺序**：supplier-console（内部成交工具）> 小程序（需求方入口）> PC Web > platform-admin
