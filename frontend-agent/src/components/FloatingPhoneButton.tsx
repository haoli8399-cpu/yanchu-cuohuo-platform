import { useState } from 'react';
import { Button, Tooltip, Typography, Space } from 'antd';
import { PhoneOutlined, CloseOutlined } from '@ant-design/icons';

const PLATFORM_PHONE = '400-888-8888';

export default function FloatingPhoneButton(): React.ReactElement {
  const [expanded, setExpanded] = useState(false);

  const handleCall = (): void => {
    window.open(`tel:${PLATFORM_PHONE}`, '_self');
  };

  return (
    <>
      {/* 悬浮电话按钮 */}
      <div
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 8,
        }}
      >
        {/* 展开信息卡片 */}
        {expanded && (
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 6px 30px rgba(0,0,0,0.15)',
              padding: '16px 20px',
              minWidth: 200,
              marginBottom: 4,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Typography.Text strong style={{ fontSize: 15 }}>
                📞 电话咨询
              </Typography.Text>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => setExpanded(false)}
              />
            </div>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              平台客服电话
            </Typography.Text>
            <div style={{ marginTop: 8 }}>
              <Typography.Text strong style={{ fontSize: 20, color: '#1677ff' }}>
                {PLATFORM_PHONE}
              </Typography.Text>
            </div>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
              工作日 9:00 - 18:00
            </Typography.Text>
            <Space style={{ marginTop: 12, width: '100%' }}>
              <Button
                type="primary"
                icon={<PhoneOutlined />}
                onClick={handleCall}
                style={{ height: 44, flex: 1 }}
              >
                立即拨打
              </Button>
            </Space>
          </div>
        )}

        {/* 主按钮 */}
        <Tooltip title="电话咨询" placement="left">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<PhoneOutlined style={{ fontSize: 20 }} />}
            onClick={() => setExpanded(!expanded)}
            style={{
              width: 56,
              height: 56,
              boxShadow: '0 4px 14px rgba(22, 119, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </Tooltip>
      </div>
    </>
  );
}
