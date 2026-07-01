import { defineConfig } from '@umijs/max';

export default defineConfig({
  title: '演出供应链保障平台 · 运营后台',
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '演出运营后台',
    locale: false,
  },
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      name: '运营工作台',
      path: '/workbench',
      component: './OperationWorkbench/index',
      icon: 'DesktopOutlined',
    },
    {
      name: '运营总看板',
      path: '/dashboard',
      component: './Dashboard',
      icon: 'DashboardOutlined',
    },
    {
      name: 'SKU管理',
      path: '/sku',
      icon: 'GoldOutlined',
      routes: [
        {
          name: 'SKU列表',
          path: '/sku/list',
          component: './SKU/index',
        },
        {
          name: 'SKU详情',
          path: '/sku/detail/:id',
          component: './SKU/Detail',
          hideInMenu: true,
        },
        {
          name: '新增SKU',
          path: '/sku/create',
          component: './SKU/Detail',
          hideInMenu: true,
        },
      ],
    },
    {
      name: '需求管理',
      path: '/demand',
      icon: 'ProjectOutlined',
      routes: [
        {
          name: '需求列表',
          path: '/demand/list',
          component: './Demand/index',
        },
        {
          name: '需求详情',
          path: '/demand/detail/:id',
          component: './Demand/Detail',
          hideInMenu: true,
        },
        {
          name: 'AI方案审核',
          path: '/demand/ai-plan/:id',
          component: './Demand/AIPlan',
          hideInMenu: true,
        },
      ],
    },
    {
      name: '演员管理',
      path: '/actors',
      icon: 'TeamOutlined',
      routes: [
        {
          name: '演员库',
          path: '/actors/list',
          component: './Placeholder',
        },
        {
          name: '咖位管理',
          path: '/actors/tier',
          component: './Placeholder',
        },
      ],
    },
    {
      name: '订单管理',
      path: '/orders',
      icon: 'OrderedListOutlined',
      component: './Placeholder',
    },
    {
      name: '系统管理',
      path: '/system',
      icon: 'SettingOutlined',
      routes: [
        {
          name: '操作日志',
          path: '/system/logs',
          component: './Placeholder',
        },
        {
          name: '角色权限',
          path: '/system/roles',
          component: './Placeholder',
        },
      ],
    },
  ],
  npmClient: 'npm',
  proxy: {
    '/api': {
      target: 'http://119.28.134.67:3002/v1',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
});
