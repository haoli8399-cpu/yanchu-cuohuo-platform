import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography, Space, Dropdown, Modal, message } from 'antd';
import {
  AppstoreOutlined,
  HistoryOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/apiClient';
import type { InviteLink } from '../types';
import type { ApiError } from '../services/apiClient';

const { Header, Content, Footer } = Layout;

export default function MainLayout(): React.ReactElement {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

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

  // W-12: 生成邀请链接
  const handleInvite = async (): Promise<void> => {
    setInviteModalOpen(true);
    setInviteLoading(true);
    try {
      const data = await api.generateInviteLink() as InviteLink;
      setInviteLink(data.url);
    } catch (err) {
      const e = err as ApiError;
      message.error(e.message ?? '生成邀请链接失败');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyLink = (): void => {
    void navigator.clipboard.writeText(inviteLink).then(() => {
      message.success('邀请链接已复制到剪贴板');
    });
  };

  const userMenuItems = [
    {
      key: 'invite',
      icon: <TeamOutlined />,
      label: '邀请同行',
    },
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
    } else if (key === 'invite') {
      void handleInvite();
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

      {/* W-12: 邀请同行弹窗 */}
      <Modal
        title={
          <Space>
            <TeamOutlined />
            <span>邀请同行</span>
          </Space>
        }
        open={inviteModalOpen}
        onCancel={() => {
          setInviteModalOpen(false);
          setInviteLink('');
        }}
        footer={null}
        width={480}
        centered
      >
        <div style={{ padding: '16px 0' }}>
          <Typography.Paragraph type="secondary">
            邀请同行活动公司加入平台，对方完成企业认证后，双方均可获得专属权益。
          </Typography.Paragraph>

          {inviteLoading ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Typography.Text type="secondary">生成邀请链接中...</Typography.Text>
            </div>
          ) : inviteLink ? (
            <>
              <div
                style={{
                  background: '#f6f8fa',
                  borderRadius: 8,
                  padding: '12px 16px',
                  wordBreak: 'break-all',
                  fontSize: 13,
                  color: '#333',
                  marginBottom: 16,
                  border: '1px solid #e8e8e8',
                }}
              >
                {inviteLink}
              </div>
              <Button
                type="primary"
                icon={<CopyOutlined />}
                onClick={handleCopyLink}
                block
                style={{ height: 44 }}
              >
                复制邀请链接
              </Button>
              <Typography.Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 12, textAlign: 'center' }}>
                也可直接分享以上链接给同行
              </Typography.Text>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Typography.Text type="secondary">链接生成失败，请关闭后重试</Typography.Text>
            </div>
          )}
        </div>
      </Modal>
    </Layout>
  );
}
