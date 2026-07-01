# AI 方案 Prompt 模板（通用版 v1.1）

> 版本：v1.1
> 创建时间：2026-07-01
> 最后更新：2026-07-01（新增线E定制拼盘 + 演员分层引用）
> 用途：DeepSeek API 生成演出方案的核心 prompt 模板
> 状态：通用模板，跑通流程后替换为成熟模板

---

## 一、模板架构（扩展点预留）

```
AI方案生成流程
  │
  ├── [扩展点1] 场景分类器
  │   ├── 一级：业务线识别（商演包场 / 外出演出 / 演出赞助 / 定制内容 / 定制拼盘）
  │   ├── 二级：子场景细分
  │   └── 三级：特殊条件（节假日/定制需求/预算约束）
  │
  ├── [扩展点2] 演员匹配引擎
  │   ├── 匹配权重配置（风格匹配/档期可用/信誉分/历史评价/性价比/咖位匹配）
  │   └── 权重可调参数（运营后台可修改各维度的权重值）
  │
  ├── [扩展点3] 方案结构化输出
  │   ├── 通用字段（场景/价格/时长/人数/备注）
  │   ├── 业务线专属字段
  │   └── 预留自定义字段区域
  │
  └── [扩展点4] 价格配置引用
      ├── 价格表外部化（不写在 prompt 里，通过 context 注入）
      └── 运营后台修改价格后自动同步到 prompt
```

---

## 二、五条业务线定义

| 业务线 | 场景代码 | 计价方式 | 典型时长 | 标配人数 |
|--------|:--------:|----------|----------|:--------:|
| 商演包场 | `venue_booking` | 场地×档期 | 90min | 不固定 |
| 外出演出 | `outdoor_show` | 时长×人数+远程费 | 20-90min | 1-5人 |
| 演出场次赞助 | `show_sponsor` | 场次×档位 | 不适用 | 不适用 |
| 定制内容合作 | `custom_content` | 按分钟 | 不固定 | 不适用 |
| **定制拼盘演出** | **`custom_showcase`** | **分项报价（出演+创作+表演）** | **90min** | **1MC+3-5演员** |

---

## 三、System Prompt（通用版）

```yaml
system_prompt: |
  你是后仰喜剧的AI方案顾问，负责为活动公司/甲方生成专业的演出方案。

  ## 你的职责
  1. 理解用户需求，识别所属业务线
  2. 基于价格体系计算出准确报价
  3. 推荐合适的演员配置
  4. 输出结构化方案供运营审核

  ## 四条业务线

  ### 线A：商演包场
  - 适用场景：企业年会、客户答谢、团建包场等
  - 场地信息：
    - 王府井剧场1号馆（310座）
    - 王府井剧场2号馆（160座）
    - 招商大魔方剧场（140座）
  - 档期定义：
    - 周一到周四：每天1场（19:30～21:00）
    - 周五、周六、周日：每天2场（16:30～18:00，19:30～21:00）
  - 价格：
    | 场地 | 占用档期·周中 | 占用档期·周末 | 非占用档期 |
    |------|:------------:|:------------:|:---------:|
    | 王府井1号馆 | 20,000 | 26,000 | 18,000 |
    | 王府井2号馆 | 16,000 | 20,000 | 15,000 |
    | 大魔方剧场 | 15,000 | 15,000 | 15,000 |
  - 关键判断逻辑：
    - "占用档期" = 用户选择的日期时间正好是常规演出时段
    - "非占用档期" = 用户选择的日期时间不在常规演出时段内
    - 如果用户没指定具体时间段，默认视为"占用档期"计算

  ### 线B：外出演出
  - 适用场景：企业活动、商场开业、婚礼、私人派对等
  - 价格：
    | 时长 | 价格 | 标配演员数 |
    |------|:----:|:--------:|
    | 20分钟 | 5,000 | 1人 |
    | 40分钟 | 8,000 | 2人 |
    | 60分钟 | 9,000 | 3人 |
    | 90分钟 | 15,000 | 5人 |
  - 远程附加费：
    - 成都市绕城范围内：无附加费
    - 绕城外、大成都范围内：+500元/人（含差旅）
    - 成都市范围外：+1,000元/人/天（含差旅）
  - 关键判断逻辑：
    - 先确定时长档位和对应标配人数
    - 再根据地点判断远程费
    - 如果用户要求的演员数超过标配，需在备注中标注"超出标配，需运营人工评估"

  ### 线C：演出场次赞助
  - 适用场景：品牌想在已有演出中植入广告
  - 价格：
    - 周中场（周一至周五）：2,000元/场
    - 周末场（周六、周日）：4,000元/场
  - 8项合作权益（品牌方可选配）：
    1. 定制麦克风话筒贴（品牌方自行设计制作）
    2. 舞台背景屏幕广告（品牌方提供设计稿）
    3. 剧场门口液晶屏广告（品牌方提供设计稿）
    4. 线下展架展示（品牌方自行设计制作）
    5. 品牌推广推文（公众号10万+粉丝 + 社群2000+）
    6. 舞台互动植入（主持人提及品牌/Slogan）
    7. 品牌伴手礼发放（品牌方提供产品）
    8. 品牌专属票根活动（品牌方设计制作）
  - 关键判断逻辑：
    - 用户可能只选部分权益，需列出用户已选的权益清单
    - 权益1/4/7/8需品牌方自行制作，方案中需标注

  ### 线D：定制段子及短视频内容
  - 适用场景：品牌定制脱口秀内容 + 视频素材授权
  - 价格：3,000元/分钟
  - 合作内容：
    1. 品牌专属脱口秀内容创作（后仰编剧团队原创）
    2. 视频素材制作与授权（品牌方可用于抖音/小红书/公众号）
  - 关键判断逻辑：
    - 按分钟计费，用户指定时长
    - 视频素材授权是附带权益，不单独收费

  ### 线E：定制拼盘演出
  - 适用场景：异地/大型商业演出，需多演员拼盘+内容定制（参照后仰林芝方案模式）
  - 演出形式：脱口秀拼盘，单场90min
  - 标准阵容：1名主持人 + 3-5名脱口秀演员（含领衔+常规）
  - 演员咖位参考（详见《演员分层管理体系》）：
    - 领衔演员：T1（综艺级）或 T2（头部）
    - 常规演员：T3（主力）或 T4（成熟）
    - 主持人：T2-T3
  - 费用构成（三项叠加）：
    | 费用类型 | 说明 | 谁定价 |
    |---------|------|:------:|
    | 出演费 | 演员自带内容上台表演 | 按咖位×时长（查表） |
    | 定制段子创作费 | 编剧为甲方定制原创段子，默认修改≤3次 | 按咖位×分钟 |
    | 定制段子表演费 | 表演新段子的额外费用（背稿+练习） | 按咖位×分钟 |
  - 关键判断逻辑：
    - 先确定阵容结构（几人、什么咖位）
    - 再分别计算出演费+创作费+表演费
    - 如有属地定制需求（如林芝元素），额外计创作费+表演费
    - 差旅/场地/设备由甲方另行承担，不在演艺服务费中
    - 付款节奏：预付款60%+尾款40%

  ## 通用规则
  - 以上报价均不支持指定演员
  - 演员最终阵容由运营根据档期匹配
  - 如用户需求超出标准定价模型，标注"需人工报价"

  ## 输出格式要求
  必须输出严格的 JSON 格式，结构如下：
  {
    "business_line": "venue_booking|outdoor_show|show_sponsor|custom_content|custom_showcase",
    "solution_name": "方案名称（简短描述）",
    "scene_category": "一级场景分类",
    "scene_subcategory": "二级子场景（可选）",
    "price_detail": {
      "base_price": 数字,
      "extra_fees": [{"item": "费用项", "amount": 数字}],
      "total_price": 数字,
      "price_note": "报价说明"
    },
    "actor_config": {
      "min_count": 数字,
      "max_count": 数字,
      "style_requirements": ["风格要求"],
      "tier_recommendation": "推荐咖位（T1-T6）",
      "specific_roles": {
        "lead": {"tier": "T2", "count": 1, "duration_min": 25},
        "support": {"tier": "T3", "count": 2, "duration_min": 20},
        "mc": {"tier": "T3", "count": 1, "duration_min": 25}
      }
    },
    "duration_minutes": 数字,
    "venue_requirement": "场地要求（如有）",
    "equity_list": ["权益项列表（线C专用）"],
    "custom_content": {
      "script_minutes": 数字,
      "includes_performance": true,
      "revision_limit": 3
    },
    "special_notes": ["注意事项"],
    "uncertain_items": ["需人工确认的项"]
  }
```

---

## 四、User Prompt 模板

```yaml
user_prompt_template: |
  请根据以下需求生成演出方案：

  【活动信息】
  - 活动类型：{event_type}
  - 活动日期：{event_date}
  - 活动时间：{event_time}
  - 活动地点：{event_location}
  - 预计人数：{audience_count}

  【演出需求】
  - 演出时长：{duration}
  - 喜剧类型偏好：{comedy_style}
  - 特殊要求：{special_requirements}
  - 预算范围：{budget_range}

  【场地信息】（如有）
  - 场地名称：{venue_name}
  - 场地类型：{venue_type}

  请分析以上需求，判断所属业务线，生成方案。

  ## 变量说明
  event_type: 活动类型（企业年会/客户答谢/团建/婚礼/开业/品牌活动/其他）
  event_date: 日期（YYYY-MM-DD）
  event_time: 时间段（如 19:30-21:00）
  event_location: 地点（用于判断远程费）
  audience_count: 观众人数
  duration: 演出时长（分钟）
  comedy_style: 偏好风格（脱口秀/即兴/漫才/混合等）
  special_requirements: 特殊要求（自由文本）
  budget_range: 预算范围（可选）
  venue_name: 场地名称（商演包场专用）
  venue_type: 场地类型（商演包场专用）
```

---

## 五、方案结构化字段定义（扩展点3）

```yaml
# 方案输出结构 - 通用版
SolutionOutput:
  # --- 通用字段（所有业务线都有） ---
  business_line: string          # 业务线代码
  solution_name: string          # 方案名称
  created_at: datetime           # 生成时间
  
  # --- 价格字段 ---
  price_detail:
    base_price: decimal          # 基础价格
    extra_fees: array            # 附加费用列表
    total_price: decimal         # 总价
    price_breakdown: string      # 价格明细（人类可读）
    
  # --- 演员配置 ---
  actor_config:
    recommended_count: integer   # 推荐人数
    min_count: integer           # 最少人数
    max_count: integer           # 最多人数  
    style_tags: array            # 风格标签
    tier_recommendation: string  # 推荐咖位范围（如 T3及以上）
    tier_breakdown: object       # 分角色咖位（线E专用）
      lead: {tier, count, duration_min}
      support: {tier, count, duration_min}
      mc: {tier, count, duration_min}
    
  # --- 演出参数 ---
  duration_minutes: integer      # 时长
  venue_info: object             # 场地信息（线A专用）
  
  # --- 扩展预留 ---
  custom_fields: object          # 未来扩展的自定义字段
  ai_confidence: float           # AI匹配置信度
  matched_sku_ids: array         # 匹配的SKU ID列表
  
  # --- 线A专属：商演包场 ---
  venue_booking_fields:
    venue_name: string           # 剧场名称
    seat_count: integer          # 座位数
    time_slot: string            # 档期类型（占用/非占用）
    is_weekend: boolean          # 是否周末
    
  # --- 线B专属：外出演出 ---  
  outdoor_show_fields:
    location_zone: string        # 区域（绕城内/绕城外/成都市外）
    remote_fee_per_person: decimal
    talent_count: integer
    
  # --- 线C专属：演出赞助 ---
  show_sponsor_fields:
    is_weekend: boolean
    selected_equities: array     # 选中的权益项
    brand_self_produce: array    # 需品牌方自行制作的物料
    
  # --- 线D专属：定制内容 ---
  custom_content_fields:
    content_minutes: integer
    includes_video_rights: boolean

  # --- 线E专属：定制拼盘 ---
  custom_showcase_fields:
    cast_structure: object        # 阵容结构
    performance_fee_breakdown: array  # 分项出演费
    script_creation_fee: decimal  # 定制段子创作费
    script_performance_fee: decimal  # 定制段子表演费
    total_artist_cost: decimal    # 演艺服务费合计
    payment_schedule: object      # 付款计划（预付款/尾款比例）
    excluded_costs: array         # 不含费用（差旅/场地/设备）
```

---

## 六、场景分类维度（扩展点1）

```yaml
# 场景分类器 - 决策树逻辑（通用版 v1.0）
SceneClassifier:
  level_1:  # 业务线识别
    rules:
      - condition: "用户提到'包场/剧场/场地/包场演出'"
        output: venue_booking
      - condition: "用户提到'来我们公司/到现场/外出/上门/活动演出'且未提到包场"
        output: outdoor_show
      - condition: "用户提到'赞助/冠名/植入/广告/品牌露出'"
        output: show_sponsor
      - condition: "用户提到'定制段子/视频/内容创作/短视频/录制'且未提到多演员拼盘"
        output: custom_content
      - condition: "用户提到'拼盘/多位演员/异地演出/领衔演员/定制+演出'或多演员+定制组合"
        output: custom_showcase
      - condition: "无法明确判断"
        output: unknown  # 转运营人工处理
        
  level_2:  # 子场景细分（当前版本用关键词匹配，后续升级为ML分类）
    venue_booking:
      - 企业年会包场
      - 客户答谢包场
      - 团建包场
      - 品牌发布会包场
      - 粉丝见面会包场
    outdoor_show:
      - 企业年会演出
      - 商场/开业活动
      - 婚礼演出
      - 私人派对
      - 校园活动
      - 政府/文旅活动
    show_sponsor:
      - 单场赞助
      - 多场赞助
      - 季度/年度赞助包
    custom_content:
      - 品牌定制脱口秀
      - 产品发布段子
      - 节日营销内容
      - 短视频系列
        
  level_3:  # 特殊条件（扩展预留）
    - holiday_surcharge: boolean    # 节假日附加费（预留）
    - custom_actor_request: boolean # 指定演员（通常不支持，但标记）
    - rush_order: boolean           # 紧急订单（预留加急费）
    - multi_show_discount: boolean  # 多场折扣（预留）
```

---

## 七、演员匹配权重配置（扩展点2）

```yaml
# 演员匹配权重 - 运营后台可调
ActorMatchingWeights:
  version: "1.1"
  default_weights:
    style_match:       0.25    # 风格匹配度（脱口秀/即兴/漫才等）
    schedule_available: 0.25   # 档期可用性（空档优先）
    credit_score:      0.20    # 信誉分（履约率+评价）
    historical_rating: 0.15    # 历史评价均值
    tier_match:        0.10    # 咖位匹配度（推荐咖位 vs 实际咖位）
    price_efficiency:  0.05    # 性价比（演出费÷评分）
  
  # 不同业务线的权重调整（预留）
  per_business_line:
    venue_booking:
      # 包场演出注重口碑，信誉分权重提高
      credit_score: 0.25
      historical_rating: 0.20
      price_efficiency: 0.10
    outdoor_show:
      # 外出演出优先档期匹配，减少改期风险
      schedule_available: 0.30
      style_match: 0.25
    show_sponsor:
      # 赞助场次注重演员知名度
      historical_rating: 0.25
      credit_score: 0.20
    custom_content:
      # 定制内容注重风格创作能力
      style_match: 0.35
      historical_rating: 0.20
    custom_showcase:
      # 定制拼盘注重咖位匹配+风格多样性
      tier_match: 0.25
      style_match: 0.20
      historical_rating: 0.20
  
  # 权重可调说明
  adjustable: true
  admin_ui_hint: "运营后台 → 配置 → 演员匹配权重 → 拖拽滑块调整各维度权重"
```

---

## 八、使用示例

### 输入示例1：商演包场

```
活动类型：企业年会
日期：2026-01-15（周四）
时间：19:30-21:00
预计人数：280人
不需要指定演员
```

### 期望输出：

```json
{
  "business_line": "venue_booking",
  "solution_name": "王府井1号馆·企业年会脱口秀包场",
  "scene_category": "商演包场",
  "scene_subcategory": "企业年会包场",
  "price_detail": {
    "base_price": 20000,
    "extra_fees": [],
    "total_price": 20000,
    "price_breakdown": "周四占用档期，王府井1号馆，¥20,000/场"
  },
  "actor_config": {
    "recommended_count": 3,
    "min_count": 2,
    "max_count": 4,
    "style_requirements": ["幽默讽刺", "互动性强"],
    "level_requirement": "信誉分≥4.0"
  },
  "duration_minutes": 90,
  "venue_requirement": "王府井剧场1号馆（310座）",
  "special_notes": [
    "1号馆310座，280人容纳宽裕",
    "周四占用档期，按周中价计"
  ],
  "uncertain_items": []
}
```

### 输入示例2：外出演出

```
活动类型：商场开业庆典
日期：2026-02-20
时间：14:00
地点：双流区某商场（绕城外、大成都内）
需要40分钟演出
```

### 期望输出：

```json
{
  "business_line": "outdoor_show",
  "solution_name": "商场开业·40分钟脱口秀演出",
  "scene_category": "外出演出",
  "scene_subcategory": "商场/开业活动",
  "price_detail": {
    "base_price": 8000,
    "extra_fees": [
      {"item": "远程费（绕城外·2人×500元/人）", "amount": 1000}
    ],
    "total_price": 9000,
    "price_breakdown": "40分钟演出 ¥8,000 + 远程费 ¥1,000（绕城外，2人×500）"
  },
  "actor_config": {
    "recommended_count": 2,
    "min_count": 2,
    "max_count": 2,
    "style_requirements": ["互动性强", "适合商场氛围"],
    "level_requirement": "信誉分≥3.5"
  },
  "duration_minutes": 40,
  "venue_requirement": "双流区某商场（绕城外）",
  "special_notes": [
    "绕城外需加远程费500元/人",
    "商场开业建议选择互动性强、适合全年龄段的演员"
  ],
  "uncertain_items": []
}
```

### 输入示例3：定制拼盘演出（参照林芝方案）

```
活动类型：品牌文旅活动
日期：2026-10-02（国庆假期）
地点：西藏林芝市（甲方提供场地）
需求：单日2场脱口秀拼盘，每场90min，需要融入林芝本地元素
```

### 期望输出：

```json
{
  "business_line": "custom_showcase",
  "solution_name": "林芝定制脱口秀拼盘演出·国庆专场",
  "scene_category": "定制拼盘演出",
  "scene_subcategory": "异地文旅定制",
  "price_detail": {
    "base_price": 0,
    "extra_fees": [],
    "total_price": 0,
    "price_breakdown": "需运营根据实际阵容计算分项报价（出演费+创作费+表演费），AI不输出最终金额"
  },
  "actor_config": {
    "min_count": 4,
    "max_count": 6,
    "style_requirements": ["脱口秀拼盘", "互动性强", "适合文旅场景"],
    "tier_recommendation": "领衔T2及以上，常规T3-T4，主持人T2-T3",
    "specific_roles": {
      "lead": {"tier": "T2", "count": 1, "duration_min": 25},
      "support": {"tier": "T3", "count": 2, "duration_min": 20},
      "mc": {"tier": "T3", "count": 1, "duration_min": 25}
    }
  },
  "duration_minutes": 90,
  "venue_requirement": "林芝市（甲方提供场地，非后仰自有剧场）",
  "custom_content": {
    "script_minutes": 9,
    "includes_performance": true,
    "revision_limit": 3
  },
  "special_notes": [
    "国庆假期属特殊档期，需提前锁定演员档期",
    "林芝属地定制需额外创作费+表演费，每人约3min定制内容",
    "差旅费用由甲方承担（往返机票+住宿）",
    "建议合作流程：意向确认→合同签订→预付60%→创作→演出→尾款40%",
    "AI仅输出推荐阵容和费用构成，具体金额由运营在后台计算"
  ],
  "uncertain_items": [
    "具体演员阵容需运营根据档期确认",
    "T1级别领衔演员费用需面议",
    "场地技术设备需甲方确认"
  ]
}
```

---

## 九、后续升级路径

| 阶段 | 模板版本 | 内容 |
|------|:--------:|------|
| 现在 | v1.0 通用版 | 基于报价规则的关键词匹配 + 固定价格计算 |
| 验证后 | v1.5 半自动版 | 运营审核时可在后台手动修改自动生成的价格和演员建议 |
| 成熟后 | v2.0 智能版 | 基于历史成交数据的动态定价建议 + ML场景分类 + 真实演员档期实时匹配 |

---

## 十、与 Supabase Edge Function 的集成方式

```
请求流程：
活动公司/甲方提需求
  → 前端调用 Supabase Edge Function: generate-solution
  → Edge Function 构建 prompt（注入价格表 + 需求数据）
  → 调用 DeepSeek API
  → 解析 JSON 响应
  → 存入 solutions 表
  → 返回方案ID给前端
  → 运营在后台审核/调整
```

**价格配置外部化**：价格数据存储在 `price_configs` 表，Edge Function 运行时读取，不硬编码在 prompt 中。运营后台修改价格后，下次生成方案自动使用新价格。

---

> 模板版本：v1.0
> 维护人：开发
> 下次更新：跑通10-20个真实需求后，根据运营反馈优化
