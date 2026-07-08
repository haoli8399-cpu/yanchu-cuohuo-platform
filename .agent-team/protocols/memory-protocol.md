# Memory Protocol — 演立方/喜剧工厂

> 所有 Agent 与 OpenViking (Project Memory Layer) 交互的标准协议。

---

## 连接信息

```
端点: http://localhost:1933
版本: v0.4.6
认证: dev 模式（本地开发，无需 API key）
Account: default
User: default
Agent: hermes
```

---

## 任务开始前：读取 Memory

```
1. 从任务描述提取 3-5 个检索关键词
2. 调用 OpenViking 搜索/viking_read 获取相关上下文
3. 重点检索：
   - viking://user/peers/hermes/memories/patterns/   (技术决策·经验·规范)
   - viking://user/peers/hermes/memories/preferences/ (用户画像·偏好·项目上下文)
   - viking://user/sessions/                          (历史会话)
4. 生成 Memory Context Summary 注入当前上下文
```

## 检索关键词示例

| 任务类型 | 检索词 |
|---------|--------|
| 用户/登录/auth | user, login, auth, session, token |
| 需求/表单 | requirement, form, submit, validation |
| 演出/匹配 | performance, match, actor, schedule |
| 支付/订单 | payment, order, billing |
| UI/页面/样式 | ui, component, design, style |

---

## 任务完成后：写回 Memory

写入内容必须包含：
- 变更标题（<10字）
- 做了什么（1-2句）
- 关键决策及原因
- 注意事项（给后续Agent）
- 修改文件清单

写入路径：`viking://user/peers/hermes/memories/patterns/`

---

## 注意事项

- Hermes 的 memory 工具也会自动镜像新写入的内容到 OpenViking
- 如果检索结果为空，换一批关键词重试，不要只搜一次就放弃
- sessions/ 目录存储每次任务的完整会话记录，commit 后自动提取记忆
