import { defineConfig } from '@umijs/max';

export default defineConfig({
  title: '演出撮合平台 · 运营后台',
  base: '/admin/',
  publicPath: '/admin/',
  define: {
    'process.env.API_BASE_URL': JSON.stringify('/v1'),
  },
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: { title: '喜剧工厂运营后台', locale: false },
  routes: [
    { path: '/login', component: '@/pages/Login/index', hideInMenu: true, layout: false },
    { path: '/', redirect: '/dashboard' },

    // 📊 运营管理
    {
      name: '运营管理',
      routes: [
        { name: '运营总看板', path: '/dashboard', component: '@/pages/Dashboard' },
        { name: '运营工作台', path: '/workbench', component: '@/pages/OperationWorkbench/index' },
        { name: '商机管理', path: '/opportunities', component: '@/pages/OpportunityManagement/index' },
        {
          name: '需求管理',
          routes: [
            { name: '需求列表', path: '/demands', component: '@/pages/Demand/index' },
            { path: '/demands/ai-plan/:id', component: '@/pages/Demand/AIPlan', hideInMenu: true },
            { path: '/demands/templates', component: '@/pages/Demand/AdjustmentTemplates', hideInMenu: true },
          ],
        },
      ],
    },

    // 🎭 演员管理
    {
      name: '演员管理',
      routes: [
        { name: '演员列表', path: '/performers', component: '@/pages/Performer/index' },
        { path: '/performers/:id', component: '@/pages/Performer/Detail', hideInMenu: true },
        { name: '档期看板', path: '/performers/calendar', component: '@/pages/ScheduleCalendar/index' },
      ],
    },

    // 📦 SKU管理
    {
      name: 'SKU管理',
      routes: [
        { name: 'SKU列表', path: '/skus', component: '@/pages/SKU/index' },
        { path: '/skus/detail/:id', component: '@/pages/SKU/Detail', hideInMenu: true },
      ],
    },

    // 💰 交易管理
    {
      name: '交易管理',
      routes: [
        { name: '订单管理', path: '/orders', component: '@/pages/OrderManagement/index' },
        { name: '结算管理', path: '/settlements', component: '@/pages/Settlement/index' },
        {
          name: '内容管理',
          routes: [
            { name: '案例管理', path: '/cases', component: '@/pages/CaseManagement/index' },
            { name: '评价管理', path: '/reviews', component: '@/pages/ReviewManagement/index' },
          ],
        },
      ],
    },

    // ⚙️ 系统配置
    {
      name: '系统配置',
      routes: [
        { name: '公司管理', path: '/companies', component: '@/pages/Company/index' },
        { name: '价格配置', path: '/price-configs', component: '@/pages/PriceConfig/index' },
        { name: '模板管理', path: '/templates', component: '@/pages/TemplateManagement/index' },
        { name: '操作日志', path: '/system/logs', component: '@/pages/System/OperationLogs' },
      ],
    },
  ],
  proxy: {
    '/api': { target: 'http://127.0.0.1:3002', changeOrigin: true, pathRewrite: { '^/api': '/v1' } },
  },
});
