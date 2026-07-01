# working_deployment.md - 部署状态记录

> 最后更新：2026-07-01
> 环境：本地开发（staging）

## 当前部署状态

| 服务 | 容器名 | 端口 | 状态 |
|------|--------|:----:|:----:|
| PostgreSQL | yanchu-db | 5432 | ⚪ 待部署 |
| Auth (GoTrue) | yanchu-auth | 9999 | ⚪ 待部署 |
| REST (PostgREST) | yanchu-rest | 3000 | ⚪ 待部署 |
| Realtime | yanchu-realtime | 4000 | ⚪ 待部署 |
| Storage | yanchu-storage | 5000 | ⚪ 待部署 |
| Studio | yanchu-studio | 8000 | ⚪ 待部署 |
| API (Fastify) | yanchu-api | 3001 | ⚪ 待部署 |
| Nginx | yanchu-nginx | 80/443 | ⚪ 待部署 |

## 迁移记录

| 时间 | 文件 | 状态 |
|------|------|:--:|
| — | 001_schema.sql | ⚪ 待创建（Agent-Backend 开发中） |

## 部署日志

```
2026-07-01: 项目初始化，docker-compose.yml + nginx 配置就绪，等待 Schema 完成
```
