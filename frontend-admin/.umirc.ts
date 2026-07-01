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
      path: '/performer',
      icon: 'TeamOutlined',
      routes: [
        {
          name: '演员列表',
          path: '/performer/list',
          component: './Performer/index',
        },
        {
          name: '演员详情',
          path: '/performer/:id',
          component: './Performer/Detail',
          hideInMenu: true,
        },
        {
          name: '新增演员',
          path: '/performer/create',
          component: './Performer/Detail',
          hideInMenu: true,
        },
        {
          name: '编辑演员',
          path: '/performer/edit/:id',
          component: './Performer/Detail',
          hideInMenu: true,
        },
      ],
    },
    {
      name: '订单管理',
      path: '/orders',
      icon: 'OrderedListOutlined',
      routes: [
        {
          name: '订单列表',
          path: '/orders/list',
          component: './OrderManagement/index',
        },
        {
          name: '排期分配',
          path: '/orders/assign/:id',
          component: './Placeholder',
          hideInMenu: true,
        },
      ],
    },
    {
      name: '结算管理',
      path: '/settlement',
      icon: 'AccountBookOutlined',
      component: './Settlement/index',
    },
    {
      name: '活动公司管理',
      path: '/company',
      icon: 'ShopOutlined',
      component: './Company/index',
    },
    {
      name: '价格配置',
      path: '/price-config',
      icon: 'DollarCircleOutlined',
      component: './PriceConfig/index',
    },
    {
      name: '系统管理',
      path: '/system',
      icon: 'SettingOutlined',
      routes: [
        {
          name: '操作日志',
          path: '/system/logs',
          component: './System/OperationLogs',
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
