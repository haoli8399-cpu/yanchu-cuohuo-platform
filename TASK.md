# TASK: SKU 模块化改造（多Agent并行执行）

> 决策来源：D-20260704-001（SKU 模块化改造方案确认）
> 执行模式：并行（3个Agent同时跑）

---

## 改造目标

后端 5 个 PATCH 端点已完成。现在并行做：
1. 前端类型 + API 方法
2. 前端 Detail.tsx 折叠面板
3. 文档同步 (API_CONTRACT.md)

---

## Agent 1：前端类型对齐 + API 方法

### 文件：`frontend-admin/src/types/sku.ts`

对齐后端 schema：

```typescript
/** 业务线（对齐后端） */
export type BusinessLine =
  | 'venue_booking'   // 商演包场
  | 'outdoor_show'    // 外出演出
  | 'show_sponsor'    // 演出赞助
  | 'custom_content'  // 定制内容
  | 'custom_showcase'; // 定制专场

export const BusinessLineLabel: Record<BusinessLine, string> = {
  venue_booking: '商演包场',
  outdoor_show: '外出演出',
  show_sponsor: '演出赞助',
  custom_content: '定制内容',
  custom_showcase: '定制专场',
};

/** SKU 主类型（对齐后端 snake_case，前端用 camelCase 展示） */
export interface SKU {
  id: string;
  name: string;
  businessLine: BusinessLine;
  description: string;
  performerProfile: string;         // 演员画像描述文本
  styleTags: string[];               // 风格标签数组
  applicableScenarios: string[];     // 适用场景数组
  basePrice: number;                 // 甲方标准价（分）
  companyPrice: number;              // 活动公司价（分）×0.7，后端计算
  internalPrice: number;             // 内部结算价（分）×0.67，后端计算
  durationMinutes: number;           // 演出时长
  performersCount: number;           // 建议演员数
  coverUrl: string;                  // 封面图
  mediaUrls: string[];               // 样片视频
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface SKUListParams {
  page: number;
  pageSize: number;
  keyword?: string;
  businessLine?: BusinessLine;
  status?: 'active' | 'inactive';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### 文件：`frontend-admin/src/services/sku.ts`

新增 5 个 PATCH 方法（保留现有方法）：

```typescript
/** 更新基础信息 */
export async function updateBasicInfo(
  id: string,
  data: { name?: string; businessLine?: string; description?: string },
): Promise<ApiResponse<{ id: string }>> {
  // snake_case 转换
  return apiClient.patch(`/skus/${id}/basic-info`, {
    name: data.name,
    business_line: data.businessLine,
    description: data.description,
  });
}

/** 更新演员画像 */
export async function updatePerformer(
  id: string,
  data: { performerProfile?: string; styleTags?: string[]; performersCount?: number },
): Promise<ApiResponse<{ id: string }>> {
  return apiClient.patch(`/skus/${id}/performer`, {
    performer_profile: data.performerProfile,
    style_tags: data.styleTags,
    performers_count: data.performersCount,
  });
}

/** 更新价格（后端自动算 companyPrice + internalPrice） */
export async function updatePricing(
  id: string,
  data: { basePrice: number },
): Promise<ApiResponse<{ id: string; base_price: number; company_price: number; internal_price: number }>> {
  return apiClient.patch(`/skus/${id}/pricing`, { base_price: data.basePrice });
}

/** 更新素材 */
export async function updateMedia(
  id: string,
  data: { coverUrl?: string; mediaUrls?: string[] },
): Promise<ApiResponse<{ id: string }>> {
  return apiClient.patch(`/skus/${id}/media`, {
    cover_url: data.coverUrl,
    media_urls: data.mediaUrls,
  });
}

/** 更新配置 */
export async function updateConfig(
  id: string,
  data: { applicableScenes?: string[]; durationMinutes?: number },
): Promise<ApiResponse<{ id: string }>> {
  return apiClient.patch(`/skus/${id}/config`, {
    applicable_scenes: data.applicableScenes,
    duration_minutes: data.durationMinutes,
  });
}
```

---

## Agent 2：Detail.tsx 折叠面板重构

文件：`frontend-admin/src/pages/SKU/Detail.tsx`

大改：从长表单 → 折叠面板（使用 Ant Design Collapse 组件）

每个面板独立表单 + 独立保存 + 独立调用对应的 PATCH 端点。

### 面板结构（6个）

| # | 面板标题 | 包含字段 | 调用端点 | 保存按钮文案 |
|:-:|:--------|:---------|:--------|:-----------|
| 1 | 基础信息 | name, businessLine, description | `updateBasicInfo` | 保存基础信息 |
| 2 | 演员画像 | performerProfile, styleTags, performersCount | `updatePerformer` | 保存演员画像 |
| 3 | 价格配置 | basePrice (元输入) + 展示 companyPrice/internalPrice | `updatePricing` | 保存价格 |
| 4 | 内容素材 | coverUrl, mediaUrls | `updateMedia` | 保存素材 |
| 5 | 适用配置 | applicableScenarios, durationMinutes | `updateConfig` | 保存配置 |
| 6 | 状态管理 | 展示当前状态 + 上下架切换按钮 | `toggleSKUStatus` | — |

### 约束

- 保留 `isCreate` 模式：新建时仍用 ProForm 全量提交
- 编辑模式：全部折叠面板，每个面板可独立展开/收起
- 每个面板有独立 load/save/error 三态
- 价格面板：只输入甲方标准价（元），companyPrice 和 internalPrice 由后端返回后展示
- 价格联动：保存后 3 个价格都显示
- 保存成功 Toast 提示 "✅ XX已更新"
- 单价计算：前端展示用分→元（`/100`），输入用元→分（`*100`）

---

## Agent 3：API_CONTRACT.md 更新

文件：`docs/API_CONTRACT.md`

在 2.2 节 SKU 端点后追加 5 个新 PATCH 端点文档：

1. `PATCH /v1/skus/:id/basic-info`
2. `PATCH /v1/skus/:id/performer`  
3. `PATCH /v1/skus/:id/pricing`
4. `PATCH /v1/skus/:id/media`
5. `PATCH /v1/skus/:id/config`

参考已有的 `PATCH /v1/skus/:id/status` 格式写。

同时在 2.2 节的价格字段从 `agent_price` 改为 `company_price` + `internal_price`。

路由汇总表端点数改为 10（原 5 + 新 5）。

---

## 回报格式

每个 Agent 完成后回报：

```yaml
result:
  file_path: "修改的文件路径"
  change_summary: "一句话描述"
  self_test:
    passed: true/false
    notes: "自测说明"
```
