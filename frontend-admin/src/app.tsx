/**
 * 运行时配置 - Ant Design Pro 布局 + 初始状态
 */

import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';

// 侧边栏logo配置
const LogoIcon: React.FC = () => (
  <span style={{ fontSize: 20, fontWeight: 700 }}>喜剧工厂</span>
);

// 获取初始状态 - 检查登录 Token
export async function getInitialState() {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    history.push('/login');
  }
  return { token };
}

export const layout: RunTimeLayoutConfig = () => {
  return {
    logo: <LogoIcon />,
    title: '喜剧工厂运营后台',
    avatarProps: {
      src: undefined,
      size: 'small',
      title: '运营专员',
    },
    actionsRender: () => [],
    pageTitleRender: (_props, defaultPageTitle) => {
      return `${defaultPageTitle} - 喜剧工厂`;
    },
  };
};
