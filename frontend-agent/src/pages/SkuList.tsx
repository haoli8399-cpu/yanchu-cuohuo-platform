import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Select,
  Input,
  Tag,
  Typography,
  Spin,
  Empty,
  Button,
  Result,
  Space,
  Pagination,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import * as api from '../services/apiClient';
import type { SkuItem, BusinessLine, PaginatedResponse } from '../types';
import { BUSINESS_LINE_LABELS } from '../types';
import type { ApiError } from '../services/apiClient';

const { Meta } = Card;

type LoadState = 'loading' | 'error' | 'empty' | 'ok';

export default function SkuListPage(): React.ReactElement {
  const navigate = useNavigate();
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [skus, setSkus] = useState<SkuItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  // 筛选
  const [businessLine, setBusinessLine] = useState<BusinessLine | ''>('');
  const [keyword, setKeyword] = useState('');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  const fetchSkus = useCallback(async () => {
    setLoadState('loading');
    try {
      const data = (await api.getSkuList({
        page,
        pageSize,
        business_line: businessLine || undefined,
        keyword: keyword || undefined,
        min_price: minPrice,
        max_price: maxPrice,
      })) as PaginatedResponse<SkuItem>;

      if (data.items.length === 0) {
        setLoadState('empty');
        setSkus([]);
        setTotal(0);
      } else {
        setLoadState('ok');
        setSkus(data.items);
        setTotal(data.total);
      }
    } catch (err) {
      const e = err as ApiError;
      setLoadState('error');
      setErrorMsg(e.message ?? '加载失败');
    }
  }, [page, pageSize, businessLine, keyword, minPrice, maxPrice]);

  useEffect(() => {
    void fetchSkus();
  }, [fetchSkus]);

  const handleSearch = (): void => {
    setPage(1);
    void fetchSkus();
  };

  return (
    <div>
      {/* 筛选栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Select
            placeholder="业务线"
            allowClear
            style={{ width: 160, minWidth: 44 }}
            value={businessLine || undefined}
            onChange={(val) => {
              setBusinessLine(val as BusinessLine | '');
            }}
            options={Object.entries(BUSINESS_LINE_LABELS).map(([key, label]) => ({
              value: key,
              label,
            }))}
          />
          <Input
            placeholder="搜索 SKU 名称"
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 200, minWidth: 44, height: 44 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Input
            placeholder="最低价"
            type="number"
            style={{ width: 120, height: 44 }}
            value={minPrice ?? ''}
            onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            placeholder="最高价"
            type="number"
            style={{ width: 120, height: 44 }}
            value={maxPrice ?? ''}
            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
          />
          <Button
            type="primary"
            icon={<FilterOutlined />}
            onClick={handleSearch}
            style={{ height: 44 }}
          >
            筛选
          </Button>
        </Space>
      </Card>

      {/* 三态处理 */}
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
              onClick={() => {
                void fetchSkus();
              }}
              style={{ height: 44 }}
            >
              重试
            </Button>
          }
        />
      )}

      {loadState === 'empty' && (
        <Empty
          description="暂无 SKU 方案"
          style={{ padding: 80 }}
        >
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => {
              setBusinessLine('');
              setKeyword('');
              setMinPrice(undefined);
              setMaxPrice(undefined);
              setPage(1);
            }}
            style={{ height: 44 }}
          >
            重置筛选
          </Button>
        </Empty>
      )}

      {loadState === 'ok' && (
        <>
          <Row gutter={[16, 16]}>
            {skus.map((sku) => (
              <Col key={sku.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: 180,
                        background: sku.cover_url
                          ? `url(${sku.cover_url}) center/cover no-repeat`
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 32,
                      }}
                    >
                      {!sku.cover_url && '🎭'}
                    </div>
                  }
                  onClick={() => {
                    navigate(`/skus/${sku.id}`);
                  }}
                  style={{ minHeight: 360 }}
                >
                  <Meta
                    title={
                      <Typography.Text ellipsis>
                        {sku.name}
                      </Typography.Text>
                    }
                    description={
                      <div>
                        <Space size={4} wrap style={{ marginBottom: 8 }}>
                          <Tag color="blue">
                            {BUSINESS_LINE_LABELS[sku.business_line]}
                          </Tag>
                          {sku.style_tags.slice(0, 2).map((tag) => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </Space>
                        <div style={{ marginTop: 8 }}>
                          <Typography.Text type="secondary">
                            {sku.duration_minutes}分钟 · {sku.performers_count}人
                          </Typography.Text>
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <Typography.Text type="secondary" delete>
                            ¥{sku.base_price.toLocaleString()}
                          </Typography.Text>
                          <Typography.Text
                            strong
                            style={{ color: '#ff4d4f', fontSize: 16, marginLeft: 8 }}
                          >
                            ¥{sku.agent_price.toLocaleString()}
                          </Typography.Text>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {' '}活动公司价
                          </Typography.Text>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {total > pageSize && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
