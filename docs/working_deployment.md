# working_deployment.md - 部署状态记录

> 最后更新：2026-07-01 23:30
> 环境：腾讯云香港 2C2G（staging）

## 部署策略调整

**2C2G 不足以运行完整 Supabase 自托管**（需 6 个容器 ≈ 1.5-2GB），调整为：
- PostgreSQL：裸机安装（省 ~200MB）
- yanchu-api：Docker 容器
- Auth/Storage/Realtime：后续升级 2C4G 后补装

## 当前部署状态

| 服务 | 安装方式 | 端口 | 状态 |
|------|:------:|:----:|:----:|
| PostgreSQL 16 | 裸机 apt | 5432 | 🟡 安装中 |
| yanchu-api (Fastify) | Docker | 3001 | ⚪ 待构建 |
| Nginx | Docker | 80 | ⚪ 待配置 |

## 迁移记录

| 时间 | 文件 | 状态 |
|------|------|:--:|
| 2026-07-01 | 001_schema.sql + 002_seed.sql | ⚪ 待运行 |

## 部署日志

```
2026-07-01 23:20: 项目初始化完成，发现服务器仅426Mi可用
2026-07-01 23:25: 决策：精简部署（PG裸机+API Docker化）
2026-07-01 23:28: 仓库克隆到服务器 /home/ubuntu/yanchu-cuohuo-platform
2026-07-01 23:30: PostgreSQL apt 安装中...
```
