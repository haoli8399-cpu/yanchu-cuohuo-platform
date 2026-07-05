/**
 * SKU 详情/编辑页 (P-22, P0)
 *
 * 支持新建和编辑模式
 * 三态处理：loading / error
 */
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, history } from '@umijs/max';
import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormDigit,
  ProFormTextArea,
  ProFormGroup,
} from '@ant-design/pro-components';
import { Button, Space, message, Spin, Result, Descriptions, Tag, Divider } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import type { SKU, BusinessLine } from '@/types/sku';
import { BusinessLineLabel } from '@/types/sku';
import { getSKUDetail, createSKU, updateSKU } from '@/services/sku';

/** 格式化价格（分 → 元） */
function formatPrice(cents: number): string {
  return `¥${(cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const statusColorMap: Record<SKU['status'], string> = {
  online: 'green',
  offline: 'default',
  draft: 'orange',
};

const statusLabelMap: Record<SKU['status'], string> = {
  online: '已上架',
  offline: '已下架',
  draft: '草稿',
};

const SKUDetailPage: React.FC = () => {
  const params = useParams<{ id?: string }>();
  const location = useLocation();
  const isCreate = !params.id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sku, setSku] = useState<SKU | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 加载SKU详情
  useEffect(() => {
    if (isCreate) return;

    setLoading(true);
    setError(null);

    getSKUDetail(params.id!)
      .then((res) => {
        setSku(res.data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('加载失败'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id, isCreate]);

  // 返回列表
  const handleBack = () => {
    history.push('/sku/list');
  };

  // 提交表单
  const handleSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      // 价格：表单输入为元，转换为分
      const clientPriceYuan = Number(values.clientPrice) || 0;
      const clientPriceCents = Math.round(clientPriceYuan * 100);

      const payload: Omit<SKU, 'id' | 'createdAt' | 'updatedAt'> = {
        name: String(values.name || ''),
        businessLine: values.businessLine as BusinessLine,
        actorProfile: {
          style: String(values.style || ''),
          tierRange: String(values.tierRange || ''),
          count: Number(values.count) || 1,
        },
        internalPrice: Math.round(clientPriceCents * 0.67),
        companyPrice: Math.round(clientPriceCents * 0.7),
        clientPrice: clientPriceCents,
        duration: Number(values.duration) || 60,
        scenarios: String(values.scenarios || '')
          .split(/[、,;，；]/)
          .map((s) => s.trim())
          .filter(Boolean),
        sampleVideos: [],
        status: 'draft',
      };

      if (isCreate) {
        await createSKU(payload);
        message.success('SKU创建成功');
      } else {
        await updateSKU(params.id!, payload);
        message.success('SKU更新成功');
      }
      history.push('/sku/list');
    } catch (err) {
      message.error(err instanceof Error ? err.message : '操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 加载中
  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" tip="加载SKU详情..." />
        </div>
      </PageContainer>
    );
  }

  // 错误状态
  if (error) {
    return (
      <PageContainer onBack={handleBack}>
        <Result
          status="error"
          title="SKU详情加载失败"
          subTitle={error.message}
          extra={
            <Button
              type="primary"
              style={{ minHeight: 44 }}
              onClick={() => window.location.reload()}
            >
              重试
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      onBack={handleBack}
      title={isCreate ? '新增SKU' : 'SKU详情'}
    >
      {/* 只读模式：展示详情信息块 */}
      {!isCreate && sku && (
        <ProCard title="基本信息" style={{ marginBottom: 16 }}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="SKU名称">{sku.name}</Descriptions.Item>
            <Descriptions.Item label="业务线">
              <Tag color="blue">{BusinessLineLabel[sku.businessLine]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="演员风格">
              {sku.actorProfile.style}
            </Descriptions.Item>
            <Descriptions.Item label="建议咖位">
              {sku.actorProfile.tierRange}
            </Descriptions.Item>
            <Descriptions.Item label="建议人数">
              {sku.actorProfile.count}人
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColorMap[sku.status]}>
                {statusLabelMap[sku.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="甲方标准价">
              {formatPrice(sku.clientPrice)}
            </Descriptions.Item>
            <Descriptions.Item label="活动公司价（7折）">
              {formatPrice(sku.companyPrice)}
            </Descriptions.Item>
            <Descriptions.Item label="内部结算价">
              {formatPrice(sku.internalPrice)}
            </Descriptions.Item>
            <Descriptions.Item label="演出时长">
              {sku.duration}分钟
            </Descriptions.Item>
            <Descriptions.Item label="适用场景" span={2}>
              {sku.scenarios.join('、') || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(sku.createdAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(sku.updatedAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
          </Descriptions>
        </ProCard>
      )}

      {/* 编辑表单 */}
      <ProCard title={isCreate ? '填写SKU信息' : '编辑SKU'}>
        <ProForm
          onFinish={handleSubmit}
          submitter={{
            render: (_, dom) => (
              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button onClick={handleBack} style={{ minHeight: 44 }}>
                    取消
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    icon={<SaveOutlined />}
                    style={{ minHeight: 44 }}
                  >
                    {isCreate ? '创建SKU' : '保存修改'}
                  </Button>
                </Space>
              </div>
            ),
          }}
          initialValues={
            sku
              ? {
                  name: sku.name,
                  businessLine: sku.businessLine,
                  style: sku.actorProfile.style,
                  tierRange: sku.actorProfile.tierRange,
                  count: sku.actorProfile.count,
                  clientPrice: sku.clientPrice / 100,
                  duration: sku.duration,
                  scenarios: sku.scenarios.join('、'),
                }
              : undefined
          }
        >
          <ProFormGroup>
            <ProFormText
              name="name"
              label="SKU名称"
              placeholder="如：脱口秀专场 · 60min标准版"
              rules={[{ required: true, message: '请输入SKU名称' }]}
              width="md"
            />
            <ProFormSelect
              name="businessLine"
              label="业务线"
              placeholder="选择业务线"
              options={Object.entries(BusinessLineLabel).map(([value, label]) => ({
                label,
                value,
              }))}
              rules={[{ required: true, message: '请选择业务线' }]}
              width="md"
            />
          </ProFormGroup>

          <Divider orientation="left">演员画像</Divider>
          <ProFormGroup>
            <ProFormText
              name="style"
              label="演员风格"
              placeholder="如：脱口秀、即兴喜剧"
              rules={[{ required: true, message: '请输入演员风格' }]}
              width="sm"
            />
            <ProFormText
              name="tierRange"
              label="建议咖位范围"
              placeholder="如：T2-T4"
              rules={[{ required: true, message: '请输入咖位范围' }]}
              width="sm"
            />
            <ProFormDigit
              name="count"
              label="建议人数"
              placeholder="如：2"
              min={1}
              max={10}
              rules={[{ required: true, message: '请输入建议人数' }]}
              width="sm"
            />
          </ProFormGroup>

          <Divider orientation="left">价格配置（元）</Divider>
          <ProFormGroup>
            <ProFormDigit
              name="clientPrice"
              label="甲方标准价"
              placeholder="如：1200"
              min={0}
              fieldProps={{ precision: 2 }}
              rules={[{ required: true, message: '请输入甲方标准价' }]}
              width="sm"
              extra="活动公司价 = 此价格 × 0.7（自动计算）"
            />
          </ProFormGroup>

          <Divider orientation="left">其他</Divider>
          <ProFormGroup>
            <ProFormDigit
              name="duration"
              label="演出时长（分钟）"
              placeholder="如：60"
              min={1}
              max={480}
              rules={[{ required: true, message: '请输入演出时长' }]}
              width="sm"
            />
          </ProFormGroup>
          <ProFormTextArea
            name="scenarios"
            label="适用场景"
            placeholder="如：企业年会、品牌发布会、商场开业（用中文顿号分隔）"
            width="xl"
          />
        </ProForm>
      </ProCard>
    </PageContainer>
  );
};

export default SKUDetailPage;
