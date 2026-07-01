# working_deployment.md - 部署状态记录

> 最后更新：2026-07-01 23:55
> 环境：腾讯云香港 2C2G（staging）

## 部署架构

```
腾讯云 2C2G (437Mi 可用)
├── PostgreSQL 16 (5432)    ← 裸机 apt
├── yanchu-api (3002)       ← Node.js systemd 服务
└── 待开放：Nginx 反向代理 + 防火墙端口
```

## 服务状态

| 服务 | 端口 | 内存 | 状态 |
|------|:----:|:----:|:----:|
| PostgreSQL 16 | 5432 | ~300MB | ✅ active |
| yanchu-api (Fastify) | 3002 | ~100MB | ✅ active (systemd) |

## 数据库

| 表 | 数量 | 备注 |
|------|:--:|------|
| 核心表 | 13 | ✅ |
| 用户 | 9 | 3运营+2活动公司+1甲方+3演员 |
| SKU | 5 | 覆盖5条业务线 |
| 演员 | 3 | T2老K + T3小鹿 + T4大山 |
| 价格配置 | 24 | 内部结算+甲方+活动公司三套 |

## API 端点

| 端点 | 状态 |
|------|:--:|
| `GET /v1/health` | ✅ |
| 其他端点 | ⚪ Phase 2 实现 |

## 待办

- [ ] 腾讯云安全组开放 3002 端口（或配置 Nginx 80→3002）
- [ ] 配置 SSL 证书
- [ ] 配置数据库自动备份

## 管理命令

```
# 查看 API 状态
ssh tencent "systemctl status yanchu-api"

# 查看 API 日志
ssh tencent "journalctl -u yanchu-api -f"

# 重启 API
ssh tencent "sudo systemctl restart yanchu-api"

# 连接数据库
ssh tencent "sudo -u postgres psql -d yanchu"
```

## 部署日志

```
2026-07-01 23:20: 项目初始化，426Mi可用
2026-07-01 23:25: 决策：精简部署（PG裸机+API裸机）
2026-07-01 23:30: PostgreSQL 16 安装+启动
2026-07-01 23:35: Schema迁移（13表）+ 种子数据（UUID修复）
2026-07-01 23:45: Node.js 20 + npm依赖安装
2026-07-01 23:50: API端口冲突修复（3001→3002）
2026-07-01 23:52: systemd服务启动✅ 健康检查通过
```
