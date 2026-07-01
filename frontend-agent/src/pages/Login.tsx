import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, message, Space, Divider } from 'antd';
import { PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/apiClient';
import type { ApiError } from '../services/apiClient';

export default function LoginPage(): React.ReactElement {
  const [form] = Form.useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async (): Promise<void> => {
    try {
      await form.validateFields(['phone']);
      const phone = form.getFieldValue('phone') as string;
      setSendingCode(true);
      await api.sendPhoneCode(phone);
      message.success('验证码已发送');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const e = err as ApiError;
      message.error(e.message ?? '发送失败');
    } finally {
      setSendingCode(false);
    }
  };

  const handleLogin = async (values: { phone: string; code: string }): Promise<void> => {
    setLoading(true);
    try {
      await login(values.phone, values.code);
      message.success('登录成功');
      navigate('/skus', { replace: true });
    } catch (err) {
      const e = err as ApiError;
      message.error(e.message ?? '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <Card
        style={{ width: 400, maxWidth: '90vw' }}
        title={
          <Typography.Title level={3} style={{ textAlign: 'center', margin: 0 }}>
            🎭 活动公司登录
          </Typography.Title>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            void handleLogin(values as { phone: string; code: string });
          }}
          size="large"
        >
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="手机号"
              maxLength={11}
              style={{ height: 44 }}
            />
          </Form.Item>

          <Form.Item
            name="code"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Input
                prefix={<LockOutlined />}
                placeholder="短信验证码"
                maxLength={6}
                style={{ height: 44 }}
              />
              <Button
                type="primary"
                ghost
                onClick={() => {
                  void handleSendCode();
                }}
                loading={sendingCode}
                disabled={countdown > 0}
                style={{ height: 44, minWidth: 120 }}
              >
                {countdown > 0 ? `${countdown}s` : '发送验证码'}
              </Button>
            </Space.Compact>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 44 }}
            >
              登录 / 注册
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            未注册手机号将自动创建账号
          </Typography.Text>
        </Divider>
      </Card>
    </div>
  );
}
