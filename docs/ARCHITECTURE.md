# ARCHITECTURE
## 子系统: miniprogram(uni-app+Vue3), frontend-agent(React19+AntD5), frontend-admin(Umi4), backend(Fastify5+Zod+PG)
## 基础设施: PostgreSQL15, Redis6, DeepSeekAPI, 腾讯云香港119.28.134.67
## 数据库: 17张表(13已有+4新增Phase1)
## API: 20组路由/v1/*
## 原则: 单一数据源(/docs/), 优雅降级, 类型安全, 缓存优先
