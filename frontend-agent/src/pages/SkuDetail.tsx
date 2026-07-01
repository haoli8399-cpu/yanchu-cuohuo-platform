import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tag,
  Typography,
  Button,
  Spin,
  Result,
  Space,
  Image,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  DollarOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import * as api from '../services/apiClient';
import type { SkuDetail } from '../types';
import { BUSINESS_LINE_LABELS } from '../types';
import type { ApiError } from '../services/apiClient';

type LoadState = 'loading' | 'error' | 'ok';

export default function SkuDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [sku, setSku] = useState<SkuDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchDetail = async (): Promise<void> => {
      setLoadState('loading');
      try {
        const data = (await api.getSkuDetail(id)) as SkuDetail;
        if (!cancelled) {
          setSku(data);
          setLoadState('ok');
        }
      } catch (err) {
        if (!cancelled) {
          const e = err as ApiError;
          setLoadState('error');
          setErrorMsg(e.message ?? '加载失败');
        }
      }
    };

    void fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleGetQuote = (): void => {
    if (!sku) return;
    navigate(`/demands/new?skuId=${sku.id}`);
  };

  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ height: 44, marginBottom: 16 }}
      >
        返回
      </Button>

      {loadState === 'loading' && (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" tip="加载中..." />
        </div>
      )}

      {loadState === 'error' && (
        <Result
          status="error"
          title="加载失败"
          subTitle={errorMsg}
          extra={
            <Button
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
              style={{ height: 44 }}
            >
              重试
            </Button>
          }
        />
      )}

      {loadState === 'ok' && sku && (
        <>
          <Card>
            <Row gutter={[24, 24]}>
              {/* 封面 */}
              <Col xs={24} md={10}>
                <div
                  style={{
                    width: '100%',
                    minHeight: 280,
                    borderRadius: 8,
                    background: sku.cover_url
                      ? `url(${sku.cover_url}) center/cover no-repeat`
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 64,
                  }}
                >
                  {!sku.cover_url && '🎭'}
                </div>
              </Col>

              {/* 基本信息 */}
              <Col xs={24} md={14}>
                <Typography.Title level={3}>{sku.name}</Typography.Title>
                <Space size={4} wrap style={{ marginBottom: 16 }}>
                  <Tag color="blue">
                    {BUSINESS_LINE_LABELS[sku.business_line]}
                  </Tag>
                  {sku.style_tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                  {sku.applicable_scenes.map((scene) => (
                    <Tag key={scene} color="green">{scene}</Tag>
                  ))}
                </Space>

                <Typography.Paragraph type="secondary">
                  {sku.description}
                </Typography.Paragraph>

                <Descriptions column={2} size="small" style={{ marginTop: 16 }}>
                  <Descriptions.Item label="时长">
                    {sku.duration_minutes} 分钟
                  </Descriptions.Item>
                  <Descriptions.Item label="演员人数">
                    {sku.performers_count} 人
                  </Descriptions.Item>
                  <Descriptions.Item label="演员画像">
                    {sku.performer_profile}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Space size="large" align="center">
                  <div>
                    <Typography.Text type="secondary" delete>
                      ¥{sku.base_price.toLocaleString()}
                    </Typography.Text>
                    <Typography.Text style={{ fontSize: 12 }} type="secondary">
                      {' '}甲方标准价
                    </Typography.Text>
                  </div>
                  <div>
                    <Typography.Text
                      strong
                      style={{ color: '#ff4d4f', fontSize: 24 }}
                    >
                      ¥{sku.agent_price.toLocaleString()}
                    </Typography.Text>
                    <Typography.Text style={{ fontSize: 12 }} type="secondary">
                      {' '}活动公司专享价
                    </Typography.Text>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    icon={<DollarOutlined />}
                    onClick={handleGetQuote}
                    style={{ height: 44 }}
                  >
                    获取报价
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* 样片/案例 */}
          {sku.media_urls && sku.media_urls.length > 0 && (
            <Card title="样片 / 案例" style={{ marginTop: 16 }}>
              <Image.PreviewGroup>
                <Space wrap>
                  {sku.media_urls.map((url, idx) => (
                    <Image
                      key={idx}
                      src={url}
                      width={200}
                      height={150}
                      style={{ objectFit: 'cover', borderRadius: 8 }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                    />
                  ))}
                </Space>
              </Image.PreviewGroup>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
