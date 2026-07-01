/**
 * 运行时配置 - Ant Design Pro 布局
 */

import type { RunTimeLayoutConfig } from '@umijs/max';
import { ProLayoutProps } from '@ant-design/pro-components';

// 侧边栏logo配置
const LogoIcon: React.FC = () => (
  <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>演出管理</span>
);

export const layout: RunTimeLayoutConfig = (initialState) => {
  return {
    logo: <LogoIcon />,
    title: '演出运营后台',
    // 右侧用户头像下拉菜单
    avatarProps: {
      src: undefined,
      size: 'small',
      title: '运营专员',
      render: (_props, dom) => {
        return <>{dom}</>;
      },
    },
    // 顶部导航右侧操作
    actionsRender: () => [],
    // 页面切换loading
    pageTitleRender: (_props, defaultPageTitle) => {
      return `${defaultPageTitle} - 演出运营后台`;
    },
    // 水印 (CODE_STANDARDS G-1: 走配置)
    waterMarkProps: {
      content: '运营后台',
    },
  };
};
