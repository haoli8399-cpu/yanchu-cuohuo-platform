import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography, Space, Dropdown } from 'antd';
import {
  AppstoreOutlined,
  HistoryOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Content, Footer } = Layout;

export default function MainLayout(): React.ReactElement {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/skus',
      icon: <AppstoreOutlined />,
      label: 'SKU浏览',
    },
    ...(isLoggedIn
      ? [
          {
            key: '/demands',
            icon: <HistoryOutlined />,
            label: '历史记录',
          },
        ]
      : []),
  ];

  const handleMenuClick = (key: string): void => {
    navigate(key);
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleUserMenuClick = ({ key }: { key: string }): void => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  const selectedKey = menuItems.find((item) =>
    location.pathname.startsWith(item.key),
  )?.key;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Space size="large">
          <Typography.Title
            level={4}
            style={{ margin: 0, cursor: 'pointer', whiteSpace: 'nowrap' }}
            onClick={() => navigate('/skus')}
          >
            🎭 演出撮合平台
          </Typography.Title>
          <Menu
            mode="horizontal"
            selectedKeys={selectedKey ? [selectedKey] : []}
            items={menuItems}
            onClick={({ key }) => handleMenuClick(key)}
            style={{ border: 'none', minWidth: 200 }}
          />
        </Space>
        <Space>
          {isLoggedIn ? (
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<UserOutlined />}
                style={{ height: 44, minWidth: 44 }}
              >
                {user?.name ?? '用户'}
              </Button>
            </Dropdown>
          ) : (
            <Button
              type="primary"
              onClick={() => navigate('/login')}
              style={{ height: 44 }}
            >
              登录
            </Button>
          )}
        </Space>
      </Header>
      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center', color: '#999' }}>
        演出撮合平台 ©2026
      </Footer>
    </Layout>
  );
}
