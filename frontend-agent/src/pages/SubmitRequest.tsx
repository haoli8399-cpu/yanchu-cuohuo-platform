import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Typography,
  message,
  Spin,
  Result,
  Divider,
} from 'antd';
import { SendOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as api from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { EVENT_TYPE_OPTIONS } from '../types';
import type { SubmitDemandRequest, SkuDetail } from '../types';
import type { ApiError } from '../services/apiClient';

export default function SubmitRequestPage(): React.ReactElement {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [searchParams] = useSearchParams();
  const skuId = searchParams.get('skuId');

  const [loading, setLoading] = useState(false);
  const [skuLoading, setSkuLoading] = useState(false);
  const [skuError, setSkuError] = useState('');
  const [sku, setSku] = useState<SkuDetail | null>(null);

  // 如果是通过 SKU 选购进入，加载 SKU 信息
  useEffect(() => {
    if (!skuId) return;
    setSkuLoading(true);
    const fetchSku = async (): Promise<void> => {
      try {
        const data = (await api.getSkuDetail(skuId)) as SkuDetail;
        setSku(data);
      } catch (err) {
        const e = err as ApiError;
        setSkuError(e.message ?? 'SKU信息加载失败');
      } finally {
        setSkuLoading(false);
      }
    };
    void fetchSku();
  }, [skuId]);

  const handleSubmit = async (values: Record<string, unknown>): Promise<void> => {
    setLoading(true);
    try {
      const body: SubmitDemandRequest = {
        source: skuId ? 'sku' : 'requirement',
        sku_id: skuId ?? undefined,
        event_type: values.event_type as string,
        event_date: (values.event_date as dayjs.Dayjs).format('YYYY-MM-DD'),
        event_time: values.event_time as string | undefined,
        city: values.city as string,
        address: values.address as string,
        audience_count: values.audience_count as number | undefined,
        budget: values.budget as number | undefined,
        duration_minutes: values.duration_minutes as number | undefined,
        comedy_style: values.comedy_style as string | undefined,
        special_requirements: values.special_requirements as string | undefined,
        venue_name: values.venue_name as string | undefined,
        venue_type: values.venue_type as string | undefined,
        title: sku ? `选购: ${sku.name}` : undefined,
      };

      await api.submitDemand(body);
      message.success('需求已提交，AI正在生成方案');
      navigate(`/demands`, { replace: true });
    } catch (err) {
      const e = err as ApiError;
      message.error(e.message ?? '提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 未登录
  if (!isLoggedIn) {
    return (
      <Result
        status="warning"
        title="请先登录"
        subTitle="提交需求需要先登录活动公司账号"
        extra={
          <Button type="primary" onClick={() => navigate('/login')} style={{ height: 44 }}>
            去登录
          </Button>
        }
      />
    );
  }

  // SKU 加载中
  if (skuLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" tip="加载SKU信息..." />
      </div>
    );
  }

  // SKU 加载失败
  if (skuError) {
    return (
      <Result
        status="error"
        title="SKU 信息加载失败"
        subTitle={skuError}
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()} style={{ height: 44 }}>
            重试
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <Typography.Title level={3}>
        {sku ? '获取报价' : '提交需求'}
      </Typography.Title>

      {sku && (
        <Card size="small" style={{ marginBottom: 16, background: '#f6ffed' }}>
          <Typography.Text strong>已选 SKU：</Typography.Text>
          <Typography.Text>{sku.name}</Typography.Text>
          <Typography.Text type="secondary" style={{ marginLeft: 16 }}>
            活动公司价 ¥{sku.agent_price.toLocaleString()}
          </Typography.Text>
        </Card>
      )}

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            void handleSubmit(values as Record<string, unknown>);
          }}
          size="large"
          initialValues={{
            event_type: '企业年会',
          }}
        >
          <Typography.Title level={5}>活动基本信息</Typography.Title>

          <Form.Item
            name="event_type"
            label="活动类型"
            rules={[{ required: true, message: '请选择活动类型' }]}
          >
            <Select options={EVENT_TYPE_OPTIONS} style={{ height: 44 }} />
          </Form.Item>

          <Form.Item
            name="event_date"
            label="活动日期"
            rules={[{ required: true, message: '请选择活动日期' }]}
          >
            <DatePicker
              style={{ width: '100%', height: 44 }}
              disabledDate={(d) => d.isBefore(dayjs().startOf('day'))}
            />
          </Form.Item>

          <Form.Item name="event_time" label="活动时间">
            <Input placeholder="例如: 19:00" style={{ height: 44 }} />
          </Form.Item>

          <Form.Item
            name="city"
            label="城市"
            rules={[{ required: true, message: '请输入城市' }]}
          >
            <Input placeholder="例如: 北京" style={{ height: 44 }} />
          </Form.Item>

          <Form.Item
            name="address"
            label="详细地址"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input placeholder="活动举办地址" style={{ height: 44 }} />
          </Form.Item>

          <Form.Item name="audience_count" label="预估观众人数">
            <InputNumber
              min={1}
              placeholder="人数"
              style={{ width: '100%', height: 44 }}
            />
          </Form.Item>

          <Form.Item name="budget" label="预算金额">
            <InputNumber
              min={0}
              step={1000}
              placeholder="元"
              style={{ width: '100%', height: 44 }}
              formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <Divider />
          <Typography.Title level={5}>更多细节（选填）</Typography.Title>

          <Form.Item name="duration_minutes" label="预计演出时长（分钟）">
            <InputNumber min={1} max={480} placeholder="分钟" style={{ width: '100%', height: 44 }} />
          </Form.Item>

          <Form.Item name="comedy_style" label="喜剧风格偏好">
            <Select
              allowClear
              placeholder="请选择"
              options={[
                { label: '脱口秀', value: '脱口秀' },
                { label: '相声', value: '相声' },
                { label: '默剧', value: '默剧' },
                { label: '即兴喜剧', value: '即兴喜剧' },
                { label: '漫才', value: '漫才' },
                { label: '无偏好', value: '无偏好' },
              ]}
              style={{ height: 44 }}
            />
          </Form.Item>

          <Form.Item name="venue_name" label="场地名称">
            <Input placeholder="举办场地名称" style={{ height: 44 }} />
          </Form.Item>

          <Form.Item name="venue_type" label="场地类型">
            <Select
              allowClear
              placeholder="请选择"
              options={[
                { label: '酒店宴会厅', value: '酒店宴会厅' },
                { label: '剧院', value: '剧院' },
                { label: 'Livehouse', value: 'Livehouse' },
                { label: '户外广场', value: '户外广场' },
                { label: '公司会议室', value: '公司会议室' },
                { label: '其他', value: '其他' },
              ]}
              style={{ height: 44 }}
            />
          </Form.Item>

          <Form.Item name="special_requirements" label="特殊需求">
            <Input.TextArea
              rows={3}
              placeholder="如有特殊需求请在此描述..."
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
              block
              size="large"
              style={{ height: 44 }}
            >
              提交需求
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
