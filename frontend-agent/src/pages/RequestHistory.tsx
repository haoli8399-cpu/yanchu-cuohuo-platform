import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Tag,
  Typography,
  Space,
  Select,
  Button,
  Spin,
  Empty,
  Result,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as api from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import {
  DEMAND_STATUS_LABELS,
  DEMAND_STATUS_COLORS,
} from '../types';
import type { DemandListItem, DemandStatus, PaginatedResponse } from '../types';
import type { ApiError } from '../services/apiClient';
import type { ColumnsType } from 'antd/es/table';

type LoadState = 'loading' | 'error' | 'empty' | 'ok';

export default function RequestHistoryPage(): React.ReactElement {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [demands, setDemands] = useState<DemandListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<DemandStatus | ''>('');

  const fetchDemands = useCallback(async () => {
    setLoadState('loading');
    try {
      const data = (await api.getDemandList({
        page,
        pageSize,
        role: 'my',
        status: statusFilter || undefined,
      })) as PaginatedResponse<DemandListItem>;

      if (data.items.length === 0) {
        setLoadState('empty');
        setDemands([]);
        setTotal(0);
      } else {
        setLoadState('ok');
        setDemands(data.items);
        setTotal(data.total);
      }
    } catch (err) {
      const e = err as ApiError;
      setLoadState('error');
      setErrorMsg(e.message ?? '加载失败');
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    if (isLoggedIn) {
      void fetchDemands();
    } else {
      setLoadState('empty');
    }
  }, [fetchDemands, isLoggedIn]);

  // 未登录
  if (!isLoggedIn) {
    return (
      <Result
        status="warning"
        title="请先登录"
        subTitle="登录后查看需求历史记录"
        extra={
          <Button type="primary" onClick={() => navigate('/login')} style={{ height: 44 }}>
            去登录
          </Button>
        }
      />
    );
  }

  const columns: ColumnsType<DemandListItem> = [
    {
      title: '需求标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text: string) => (
        <Typography.Text ellipsis style={{ maxWidth: 180 }}>
          {text}
        </Typography.Text>
      ),
    },
    {
      title: '活动类型',
      dataIndex: 'event_type',
      key: 'event_type',
      width: 100,
    },
    {
      title: '活动日期',
      dataIndex: 'event_date',
      key: 'event_date',
      width: 110,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD'),
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 80,
    },
    {
      title: '预算',
      dataIndex: 'budget',
      key: 'budget',
      width: 120,
      render: (val: number) =>
        val ? `¥${val.toLocaleString()}` : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: DemandStatus) => (
        <Tag color={DEMAND_STATUS_COLORS[status]}>
          {DEMAND_STATUS_LABELS[status]}
        </Tag>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          需求历史记录
        </Typography.Title>
        <Space>
          <Select
            placeholder="按状态筛选"
            allowClear
            style={{ width: 160, minWidth: 44, height: 44 }}
            value={statusFilter || undefined}
            onChange={(val) => {
              setStatusFilter((val as DemandStatus) || '');
              setPage(1);
            }}
            options={Object.entries(DEMAND_STATUS_LABELS).map(([key, label]) => ({
              value: key,
              label,
            }))}
          />
          <Button
            type="primary"
            onClick={() => navigate('/demands/new')}
            style={{ height: 44 }}
          >
            提交新需求
          </Button>
        </Space>
      </div>

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
                void fetchDemands();
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
          description="暂无需求记录"
          style={{ padding: 80 }}
        >
          <Button
            type="primary"
            onClick={() => navigate('/demands/new')}
            style={{ height: 44 }}
          >
            提交第一个需求
          </Button>
        </Empty>
      )}

      {loadState === 'ok' && (
        <Card>
          <Table
            columns={columns}
            dataSource={demands}
            rowKey="id"
            pagination={
              total > pageSize
                ? {
                    current: page,
                    pageSize,
                    total,
                    onChange: (p) => setPage(p),
                    showSizeChanger: false,
                  }
                : false
            }
            scroll={{ x: 900 }}
            size="middle"
          />
        </Card>
      )}
    </div>
  );
}
