import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Card, Typography } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import { sendPhoneCode, phoneLogin } from '../services/apiClient';
import { useAuth } from '../services/auth';

const { Title, Text } = Typography;

export default function Login() {
  const [form] = Form.useForm();
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { login } = useAuth();
  const nav = useNavigate();

  const handleSendCode = async () => {
    const phone = form.getFieldValue('phone');
    if (!/^1[3-9]\d{9}$/.test(phone)) { message.error('请输入正确手机号'); return; }
    setSending(true);
    try {
      await sendPhoneCode(phone);
      message.success('验证码已发送');
      setCountdown(60);
      const timer = setInterval(() => setCountdown(c => { if (c<=1) {clearInterval(timer);return 0;} return c-1; }), 1000);
    } catch { message.error('发送失败'); }
    setSending(false);
  };

  const handleLogin = async (values: { phone: string; code: string }) => {
    try {
      const data = await phoneLogin(values.phone, values.code, 'agent');
      login(data.token, values.phone, data.user?.name || '');
      nav('/');
    } catch { message.error('登录失败，请检查验证码'); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <Card style={{ width: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>演立方</Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>活动公司登录</Text>
        <Form form={form} onFinish={handleLogin} size="large">
          <Form.Item name="phone" rules={[{ required: true, message: '请输入手机号' }]}>
            <Input prefix={<PhoneOutlined />} placeholder="手机号" maxLength={11} />
          </Form.Item>
          <Form.Item>
            <Input.Group compact>
              <Form.Item name="code" noStyle rules={[{ required: true, message: '请输入验证码' }]}>
                <Input placeholder="验证码" maxLength={6} style={{ width: '60%' }} />
              </Form.Item>
              <Button onClick={handleSendCode} loading={sending} disabled={countdown > 0} style={{ width: '40%' }}>
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Button>
            </Input.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>登录 / 注册</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
