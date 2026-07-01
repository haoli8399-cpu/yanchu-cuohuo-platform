# working_deployment.md - 部署状态记录

> 最后更新：2026-07-01 23:45
> 环境：腾讯云香港 2C2G（staging）

## 部署策略

**2C2G 不足以运行完整 Supabase 自托管**（需 6 容器 ≈ 1.5-2GB），采用精简方案：
- PostgreSQL：裸机 apt（省 ~200MB）
- yanchu-api：裸机 Node.js（省 Docker 开销）
- Auth/Storage/Realtime：后续升级 2C4G 后补装

## 当前部署状态

| 服务 | 方式 | 端口 | 状态 |
|------|:----:|:----:|:----:|
| PostgreSQL 16 | 裸机 apt | 5432 | ✅ 运行中 |
| yanchu-api (Fastify) | 裸机 Node.js | 3001 | 🟡 Node.js 安装中 |

## 数据库

| 表 | 数量 | 种子数据 |
|------|:--:|------|
| 核心表 | 13 | ✅ |
| SKU | 5 | ✅ 5条业务线 |
| 演员 | 3 | ✅ T2/T3/T4 |
| 价格配置 | 24 | ✅ 三套价格 |
| 操作日志 | 3 | ✅ |

## 连接信息

```
Host: 119.28.134.67
SSH: ssh tencent
DB:  postgresql://yanchu:yanchu_dev_2024@localhost:5432/yanchu
API: http://119.28.134.67:3001/v1/health (部署中)
```

## 部署日志

```
2026-07-01 23:20: 项目初始化，服务器426Mi可用
2026-07-01 23:25: 决策：精简部署（PG裸机+API裸机）
2026-07-01 23:28: 仓库克隆到服务器
2026-07-01 23:30: PostgreSQL 16 安装+启动
2026-07-01 23:32: Schema迁移完成（13表）
2026-07-01 23:40: 种子数据修复UUID→导入（5SKU+3演员+24价格配置）
2026-07-01 23:45: Node.js 安装中...
```
