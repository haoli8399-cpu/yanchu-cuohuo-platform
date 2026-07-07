import { defineConfig } from '@umijs/max';

export default defineConfig({
  title: '演出撮合平台 · 运营后台',
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: { title: '运营后台', locale: false },
  routes: [
    { path: '/', redirect: '/dashboard' },
    { name: '运营总看板', path: '/dashboard', component: '@/pages/Dashboard' },
    { name: '运营工作台', path: '/workbench', component: '@/pages/OperationWorkbench/index' },
    { name: '需求管理', path: '/demands', component: '@/pages/Demand/index' },
    { name: 'AI方案审核', path: '/demands/ai-plan/:id', component: '@/pages/Demand/AIPlan' },
    { name: '方案调整模板', path: '/demands/templates', component: '@/pages/Demand/AdjustmentTemplates' },
    { name: 'SKU管理', path: '/skus', component: '@/pages/SKU/index' },
    { name: 'SKU详情', path: '/skus/detail/:id', component: '@/pages/SKU/Detail' },
    { name: '演员管理', path: '/performers', component: '@/pages/Performer/index' },
    { name: '演员详情', path: '/performers/:id', component: '@/pages/Performer/Detail' },
    { name: '档期看板', path: '/performers/calendar', component: '@/pages/ScheduleCalendar/index' },
    { name: '订单管理', path: '/orders', component: '@/pages/OrderManagement/index' },
    { name: '结算管理', path: '/settlements', component: '@/pages/Settlement/index' },
    { name: '公司管理', path: '/companies', component: '@/pages/Company/index' },
    { name: '价格配置', path: '/price-configs', component: '@/pages/PriceConfig/index' },
    { name: '案例管理', path: '/cases', component: '@/pages/CaseManagement/index' },
    { name: '模板管理', path: '/templates', component: '@/pages/TemplateManagement/index' },
    { name: '操作日志', path: '/system/logs', component: '@/pages/System/OperationLogs' },
  ],
  proxy: {
    '/api': { target: 'http://127.0.0.1:3002', changeOrigin: true, pathRewrite: { '^/api': '/v1' } },
  },
});
