import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Layout, Menu, Typography } from 'antd';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  FundOutlined,
  OrderedListOutlined,
} from '@ant-design/icons';
import XiaoYanFloat from '../../components/XiaoYanFloat';

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

const MENU_ITEMS = [
  { key: '/supplier/daily-report', icon: <DashboardOutlined />, label: 'AI成交日报' },
  { key: '/supplier/war-room', icon: <ThunderboltOutlined />, label: '销售作战台' },
  { key: '/supplier/skus', icon: <AppstoreOutlined />, label: 'SKU管理' },
  { key: '/supplier/profit', icon: <FundOutlined />, label: '利润看板' },
  { key: '/supplier/orders', icon: <OrderedListOutlined />, label: '订单管理' },
];

export default function SupplierLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const selectedKey = '/' + loc.pathname.split('/').slice(1, 3).join('/');

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Sider
        width={220}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: '#0f0f1a',
          borderRight: 'none',
        }}
      >
        <div style={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: 28, height: 28,
            background: '#7c3aed', borderRadius: 5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 11, letterSpacing: 0.8,
            flexShrink: 0,
          }}>
            YLF
          </div>
          {!collapsed && (
            <div style={{ marginLeft: 10 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: -0.2 }}>
                演立方
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>
                艺人工作台
              </div>
            </div>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={MENU_ITEMS}
          onClick={({ key }) => nav(key)}
          style={{
            background: 'transparent',
            borderRight: 'none',
            marginTop: 8,
            fontSize: 13,
          }}
          theme="dark"
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f1f3',
        }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            演立方 · AI 商演成交机器
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '8px 16px', background: '#f5f3ff', borderRadius: 999,
              fontSize: 12, fontWeight: 600, color: '#7c3aed',
            }}>
              <span style={{
                width: 5, height: 5, background: '#16a34a', borderRadius: '50%',
                position: 'relative', flexShrink: 0,
              }} />
              小演监控中
            </span>
          </div>
        </Header>
        <Content style={{ background: '#f5f5f7', padding: 24, minHeight: 'calc(100vh - 60px)' }}>
          <Outlet />
        </Content>
      </Layout>
      <XiaoYanFloat context_type="opportunity" />
    </Layout>
  );
}
