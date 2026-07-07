import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Select, DatePicker, InputNumber, Button, Card, message, Typography } from 'antd';
import { submitDemand, getSkuDetail } from '../services/apiClient';

const { Title } = Typography;

const EVENT_TYPES = ['企业年会','客户答谢','开业庆典','品牌发布','婚礼庆典','生日派对','团建活动','其他'];

export default function SubmitRequest() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const skuId = searchParams.get('sku_id');
  const [skuName, setSkuName] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    if (skuId) getSkuDetail(skuId).then(d => {
      const sku = d as { name: string };
      setSkuName(sku.name);
      form.setFieldsValue({ source: 'sku', sku_id: skuId });
    }).catch(() => {});
  }, [skuId]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await submitDemand(values);
      message.success('需求已提交，运营团队将尽快为您匹配方案');
      nav('/demands');
    } catch { message.error('提交失败，请重试'); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <Title level={3} style={{ marginBottom: 24 }}>提交需求</Title>
      {skuName && <Card size="small" style={{ marginBottom: 16, background: '#f9f0ff' }}>已选方案：<strong>{skuName}</strong></Card>}
      <Form form={form} layout="vertical" onFinish={handleSubmit} size="large"
        initialValues={{ source: 'requirement', duration_minutes: 20 }}>
        <Form.Item name="source" hidden><Input /></Form.Item>
        <Form.Item name="sku_id" hidden><Input /></Form.Item>
        <Form.Item name="title" label="需求标题" rules={[{ required: true }]}>
          <Input placeholder="如：公司年会脱口秀演出" />
        </Form.Item>
        <Form.Item name="event_type" label="活动类型" rules={[{ required: true }]}>
          <Select options={EVENT_TYPES.map(t => ({ label: t, value: t }))} />
        </Form.Item>
        <Form.Item name="event_date" label="活动日期" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="city" label="城市" rules={[{ required: true }]}>
          <Input placeholder="如：成都" />
        </Form.Item>
        <Form.Item name="address" label="详细地址">
          <Input placeholder="如：高新区天府大道XX号" />
        </Form.Item>
        <Form.Item name="audience_count" label="观众人数">
          <InputNumber min={1} max={100000} style={{ width: '100%' }} placeholder="预估人数" />
        </Form.Item>
        <Form.Item name="budget" label="预算（元）">
          <InputNumber min={0} style={{ width: '100%' }} placeholder="可选" />
        </Form.Item>
        <Form.Item name="special_requirements" label="特殊需求">
          <Input.TextArea rows={3} placeholder="如：需要方言段子、互动环节等" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading} style={{ minHeight: 48, height: 48 }}>
            提交需求
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
