/**
 * 管理员登录页
 */
import React, { useState } from 'react';
import { Button, Form, Input, message, Card } from 'antd';
import { PhoneOutlined, LockOutlined } from '@ant-design/icons';
import apiClient from '@/services/apiClient';

const AdminLoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { phone: string; code: string }) => {
    setLoading(true);
    try {
      const res = await apiClient.post<{ token: string; user: any }>(
        '/auth/phone',
        { phone: values.phone, code: values.code, role: 'admin' },
        { skipAuth: true },
      );
      if (res.code === 0) {
        localStorage.setItem('admin_token', res.data.token);
        localStorage.setItem('admin_user', JSON.stringify(res.data.user));
        message.success('登录成功');
        window.location.replace('/admin/dashboard');
      } else {
        message.error(res.message || '登录失败');
      }
    } catch (err: any) {
      message.error(err.message || '登录失败');
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
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
      }}
    >
      <Card title="喜剧工厂 · 运营后台" style={{ width: 400 }}>
        <Form onFinish={onFinish} size="large">
          <Form.Item
            name="phone"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="手机号" />
          </Form.Item>
          <Form.Item
            name="code"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <Input prefix={<LockOutlined />} placeholder="验证码（开发环境任意6位数字）" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
          开发环境：手机号任意、验证码任意6位数字
        </div>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
