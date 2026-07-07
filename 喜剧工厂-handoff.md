# 喜剧工厂（原演出撮合平台） — Handoff 文档

## 项目概况

**项目名称**：喜剧工厂（Comedy Factory）
**项目性质**：B2B 演出撮合平台，连接演出需求方（活动公司/甲方）与演出供给方（演员/艺人）
**业务模式**：5条业务线（商演包场/外出演出/演出赞助/定制内容/定制拼盘），演员7级咖位T0-T6
**用户**：豪哥（后仰喜剧老板，产品负责人），非技术背景

### 价格体系
- 内部结算价（T0-T6 按咖位阶梯）
- 甲方标准价（20min=6000/40min=10000/60min=12000/90min=16000）
- 活动公司渠道价（标准价×0.7）
- 三种价格均支持运营后台维护

---

## 项目组成

### 1. 小程序前端（主力，需重点接手）
**路径**：`~/Projects/演出撮合小程序/miniprogram/`
**仓库**：`haoli8399-cpu/yan-shi`
**技术栈**：uni-app 3.x + Vue 3 + TypeScript + Vant Weapp 组件库 + SCSS

### 2. 后端 API
**路径**：`/Users/wudixingyunxingleo/Documents/演出撮合平台/backend/`
**技术栈**：TypeScript + Fastify + PostgreSQL + Zod
**部署**：腾讯云香港轻量 2C2G 5M Ubuntu 22.04（IP 119.28.134.67）
**API端口**：3002（Nginx代理到9090）

### 3. 运营后台（Web）
**路径**：`/Users/wudixingyunxingleo/Documents/演出撮合平台/frontend-admin/`
**技术栈**：Umi 4 + React + Ant Design Pro
**部署**：`/var/www/yanchu/admin/`，`/admin/` 路径

### 4. 活动公司端（Web）
**路径**：`/Users/wudixingyunxingleo/Documents/演出撮合平台/frontend-agent/`
**技术栈**：React + Ant Design

---

## 小程序架构（重点）

### 开发环境
- Node 18（用 nvm 切换）
- 构建命令：`npx uni build --platform mp-weixin`
- **构建后必须手动复制 Vant 组件**：`cp -r wxcomponents dist/build/mp-weixin/wxcomponents`
- 预览路径：`dist/build/mp-weixin/`
- 微信开发者工具 AppID：`wx60d185cab446ab40`

### 页面路由（15个页面）

| 页面 | 路径 | 所属角色 |
|------|------|:--------:|
| 登录 | pages/login/index | 公共 |
| 发现首页 | pages/discover/index | 活动公司 |
| 方案列表 | pages/sku/list | 活动公司 |
| SKU详情 | pages/sku/detail | 活动公司 |
| 提交需求 | pages/request/submit | 活动公司 |
| 需求列表 | pages/request/list | 活动公司 |
| 需求详情 | pages/request/detail | 活动公司 |
| 个人中心 | pages/user/index | 通用 |
| 排期列表 | pages/assignment/list | 演员 |
| 排期详情 | pages/assignment/detail | 演员 |
| 排期日历 | pages/assignment/calendar | 演员 |
| 签到打卡 | pages/checkin/index | 演员 |
| 结算记录 | pages/settlement/index | 演员 |
| 信誉分 | pages/credit/index | 演员 |
| 入驻申请 | pages/onboarding/index | 演员 |

### TabBar 双角色机制

**活动公司（原生tabBar 4Tab）**：发现 / 方案 / 需求 / 我的
- 通过 pages.json 中的 `tabBar` 配置
- 切换用 `uni.switchTab`，不销毁页面栈

**演员（自定义TabBar 3Tab）**：日程 / 收入 / 我的
- 通过 `components/TabBar.vue` 实现
- 切换用 `uni.reLaunch`（因未注册为原生tabBar）
- 登录时需要 `uni.hideTabBar()` 隐藏活动公司的原生tabBar

### TabBar组件（`src/components/TabBar.vue`）
- 活动公司：显示 v-if="isAgent" → 直接用原生tabBar，组件不渲染
- 演员：显示 v-if="showCustomBar"（isPerformer）→ 3个van-icon+文字
- 演员图标：calendar-o / balance-o / user-o

### 技术细节

| 项目 | 说明 |
|------|------|
| 状态管理 | Pinia（stores/auth.ts） |
| API 服务 | src/services/api.ts |
| 类型定义 | src/types/index.ts |
| 全局样式 | App.vue（CSS变量，浅色主题） |
| CSS变量前缀 | --primary-color / --bg-primary / --text-primary 等 |
| 字体 | PingFang SC / Microsoft YaHei 优先 |
| 价格格式化 | src/utils/format.ts（formatPrice函数） |
| Vant组件注册 | pages.json → globalStyle → usingComponents（10个组件） |
| Vant组件路径 | /wxcomponents/vant/button/index（手动复制到dist） |

### 组件文件

| 组件 | 路径 | 说明 |
|------|------|------|
| TabBar | components/TabBar.vue | 双角色Tab切换，原生+自定义混合 |
| EmptyState | components/EmptyState.vue | 统一空状态（van-icon + 标题 + 引导按钮） |
| SkeletonCard | components/SkeletonCard.vue | 骨架屏（已适配浅色主题） |
| FloatingPhone | components/FloatingPhone.vue | 电话咨询悬浮按钮 |

---

## 当前状态

### 已完成工作
1. ✅ 命名：演出撮合平台 → 喜剧工厂
2. ✅ 深色主题 → 浅色主题（#f5f5f7 + 白色卡片）
3. ✅ NutUI → Vant Weapp 组件库
4. ✅ 完整设计变量体系（字体/间距/阴影/状态色/动画）
5. ✅ 活动公司4Tab（发现/方案/需求/我的）+ 原生tabBar
6. ✅ 演员3Tab（日程/收入/我的）+ 自定义TabBar
7. ✅ 登录页（微信一键登录 + 协议）
8. ✅ 发现页（Banner轮播 + 快捷入口 + 热门推荐）
9. ✅ SKU方案列表（左图右文卡片 + 分页加载）
10. ✅ SKU详情 + 获取报价
11. ✅ 提交需求（Vanilla表单 + 字段级验证 + 底部固定提交）
12. ✅ 需求列表 + 需求详情（AI方案查看 + 确认 + 时间线）
13. ✅ 演员入驻申请
14. ✅ 排期列表（统计卡片 + 确认/拒绝）
15. ✅ 排期日历（手动月份）
16. ✅ 排期详情（阵容 + 反馈）
17. ✅ 签到打卡
18. ✅ 结算记录
19. ✅ 信誉分（圆环 + 维度 + 历史）
20. ✅ Vant Icon 替换全局 emoji
21. ✅ 全局点击反馈 (.hover-opacity / .hover-scale)
22. ✅ 统一 EmptyState 组件
23. ✅ 价格格式统一（format.ts）
24. ✅ 骨架屏变色修复
25. ✅ 运营后台全部完成（34项）

### PRD 对照（小程序C端）

| 功能 | 状态 | 备注 |
|------|:----:|------|
| C-01 微信一键登录 | ✅ | |
| C-02 用户协议/隐私 | ✅ | |
| C-03 账号注销 | ❌ | P1，未实现 |
| C-04 提交需求 | ✅ | |
| C-05 需求修改/撤回 | ✅ | |
| C-06 AI方案查看 | ✅ | request/detail.vue |
| C-07 SKU方案浏览 | ✅ | 含分页 |
| C-08 SKU获取报价 | ⚠️ | 按钮有，需后端联调 |
| C-09 订单时间线 | ✅ | request/detail.vue |
| C-10 最终方案确认 | ✅ | request/detail.vue |
| C-11 电话咨询 | ✅ | FloatingPhone |
| C-12 方案导出Word | ❌ | P1，未实现 |
| C-13 角色路由 | ✅ | |

### 待办/已知问题
1. **登录页是预览模式**：`src/pages/login/index.vue` 第55-59行被修改为所有角色跳转演员端，且跳过入驻检查——**生产环境必须恢复**
2. **tabBar图标是占位方块**：`src/static/tab-*.png` 是1×1透明PNG占位，需要替换为真实设计图标
3. **van-icon 构建警告**：不影响运行，uni-app构建时找不到 `/wxcomponents/vant/icon/index` 的json（运行时已复制）
4. **P2建议项未做**：FloatingPhone可拖拽、表单步骤条、演员确认接单后反馈优化等
5. **小程序未提审**：从未提交微信审核，需先完成功能验收

---

## 部署

### 服务器
- **IP**：119.28.134.67
- **SSH用户**：ubuntu
- **Nginx端口**：9090
- **API端口**：3002（反向代理）
- **域名**：yanshi.hao-works.com（需ICP备案才能用于小程序）

### Nginx配置
```
位置：/etc/nginx/sites-available/yanchu
前端（活动公司端）：/var/www/yanchu/agent/
运营后台：/var/www/yanchu/admin/（/admin/ 路径）
API代理：/v1/ → localhost:3002
```

### 部署流程
```bash
# 小程序
cd ~/Projects/演出撮合小程序/miniprogram
npx uni build --platform mp-weixin
cp -r wxcomponents dist/build/mp-weixin/wxcomponents
# 在微信开发者工具中打开 dist/build/mp-weixin/

# 运营后台
cd /Users/wudixingyunxingleo/Documents/演出撮合平台/frontend-admin
npm run build
scp -r dist/* tencent:/var/www/yanchu/admin/

# 活动公司端
cd /Users/wudixingyunxingleo/Documents/演出撮合平台/frontend-agent
npm run build
scp -r dist/* tencent:/var/www/yanchu/agent/

# 后端
cd /Users/wudixingyunxingleo/Documents/演出撮合平台/backend
npm run build
rsync -avz --exclude node_modules ./ tencent:/opt/yanchu/backend/
ssh tencent "cd /opt/yanchu/backend && npm i && pm2 restart yanchu-api"
```

### 构建注意点
- Vant Weapp 组件在 `wxcomponents/vant/` 目录（从 `node_modules/@vant/weapp/dist/` 复制）
- **uni-app构建后不会自动复制wxcomponents**，每次构建后必须手动 `cp -r wxcomponents dist/build/mp-weixin/wxcomponents`
- Node版本必须用 18（nvm use 18）

---

## 关键文件索引

### 小程序核心代码

| 文件 | 关键内容 |
|------|---------|
| `src/pages.json` | 页面路由、全局Vant组件注册、原生tabBar配置 |
| `src/App.vue` | 全局CSS变量（状态色/字体/间距/阴影/动画） |
| `src/components/TabBar.vue` | 双角色Tab栏（演员用rerlaunch，活动公司用原生） |
| `src/pages/login/index.vue` | **预览模式需恢复生产路由** |
| `src/pages/discover/index.vue` | 发现首页，goPage区分switchTab/navigateTo |
| `src/pages/sku/list.vue` | 方案列表 + 分页加载 |
| `src/services/api.ts` | 所有API调用 |
| `src/stores/auth.ts` | 登录状态 + 角色识别 |
| `src/utils/format.ts` | formatPrice等工具函数 |

### 后端

| 路径 | 说明 |
|------|------|
| `backend/src/api/` | API路由 |
| `backend/src/services/` | 业务逻辑 |
| `backend/src/middleware/` | 中间件 |
| `backend/config/` | 配置 |
| `backend/migrations/` | 数据库迁移 |

---

## 联系人

- **产品负责人**：豪哥（产品决策、业务需求）
- **小程序AppID**：wx60d185cab446ab40
- **腾讯云香港服务器**：119.28.134.67（ubuntu，SSH密钥已配）
- **价格体系文档**：`docs/演出撮合平台PRD.md`
- **API合约**：`docs/API_CONTRACT.md`

---

## 注意事项

1. **沟通风格**：豪哥非技术背景，结论先行（金字塔原理），直接批评不要附和
2. **交付验证**：每轮改完必须真机预览验证，不推测结果
3. **登录预览模式**：当前 login/index.vue 第55-59行是预览模式，所有用户跳转演员端——需恢复后提审
4. **多Agent协作**：复杂任务用多Agent并行执行，每个子Agent限定3个文件以内的修改量
5. **Project Center**：每次更新前必须读取project-center/，执行后立即更新并git push
