import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Input, Result, Row, Skeleton, Space, Tag, Typography } from 'antd';
import { ArrowRightOutlined, ApartmentOutlined, DollarOutlined, TeamOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const activityTags = ['脱口秀', '年会', '团建', '商业活动', '路演'];

const highlights = [
  { value: '15 分钟', label: '模糊需求进来，标准报价出去', icon: <ThunderboltOutlined /> },
  { value: '×0.7', label: '渠道价 = 标准价 ×0.7，透明可算', icon: <DollarOutlined /> },
  { value: '0 佣金', label: '自有单不收费，只赚该赚的差价', icon: <ArrowRightOutlined /> },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // 模拟首次加载，实际项目替换为真实数据请求
    const t = setTimeout(() => {
      setLoading(false);
      // 模拟错误场景：取消下行注释可测试 error 状态
      // setError(true);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', padding: '64px 24px' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <Skeleton active paragraph={{ rows: 2 }} />
          <Skeleton.Input active size="large" style={{ width: '100%', maxWidth: 600, marginTop: 32 }} />
          <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} active title={false} paragraph={{ rows: 2 }} style={{ flex: 1 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Result
          status="error"
          title="加载失败"
          subTitle="页面数据加载异常，请稍后重试"
          extra={[
            <Button type="primary" key="retry" onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 600); }}>
              重新加载
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Inter, PingFang SC, sans-serif' }}>
      <section style={{
        minHeight: 560,
        padding: '64px 24px 80px',
        background: 'linear-gradient(180deg, #f5f3ff 0%, #ffffff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: 920, textAlign: 'center' }}>
          <Space size={8} style={{ marginBottom: 16 }}>
            <div style={{ width: 24, height: 24, borderRadius: 5, background: '#7c3aed' }} />
            <Text strong style={{ color: '#7c3aed', fontSize: 16 }}>演立方 YANLI</Text>
          </Space>

          <Title style={{ fontSize: 48, lineHeight: 1.12, marginBottom: 16, color: '#1a1a2e' }}>
            有商演需求？一句话，成交一场演出。
          </Title>
          <Text style={{ display: 'block', fontSize: 18, color: '#7c3aed', fontWeight: 700, marginBottom: 16 }}>
            演立方 · AI 商演成交机器（YANLI）
          </Text>
          <Paragraph style={{ fontSize: 16, color: '#6b7280', marginBottom: 32 }}>
            说一句需求，AI「小演」替你匹配方案、出报价、盯到成单。
          </Paragraph>

          <Input.Search
            size="large"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onSearch={(value) => {
              const q = (value || prompt).trim();
              if (q) navigate(`/browse?prompt=${encodeURIComponent(q)}`);
            }}
            placeholder="例如：周五晚公司年会有200人，想找1小时脱口秀暖场"
            enterButton={<Button type="primary" size="large">生成报价方案</Button>}
            style={{ maxWidth: 600, margin: '0 auto 16px' }}
          />

          <Space size={8} wrap style={{ justifyContent: 'center' }}>
            {activityTags.map((tag) => (
              <Tag
                key={tag}
                onClick={() => setPrompt(`${tag}活动，帮我生成报价方案`)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 999,
                  background: '#fff',
                  borderColor: '#ddd6fe',
                  color: '#7c3aed',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {tag}
              </Tag>
            ))}
          </Space>
        </div>
      </section>

      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 72px' }}>
        <Row gutter={[16, 16]}>
          {highlights.map((item) => (
            <Col xs={24} md={8} key={item.value}>
              <Card hoverable style={{ borderRadius: 8, height: '100%' }} styles={{ body: { padding: 24 } }}>
                <Space size={16} align="start">
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: '#f5f3ff',
                    color: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 30, fontWeight: 800, color: '#1a1a2e', fontFamily: "'JetBrains Mono', monospace" }}>
                      {item.value}
                    </div>
                    <Text type="secondary">{item.label}</Text>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* 角色入口 */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px 72px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <Card
              hoverable
              onClick={() => navigate('/login')}
              style={{
                borderRadius: 12,
                border: '1px solid #ddd6fe',
                height: '100%',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              styles={{
                body: { padding: 32, textAlign: 'center' },
              }}
            >
              <ApartmentOutlined style={{ fontSize: 40, color: '#7c3aed', marginBottom: 16 }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>我是活动公司</div>
              <Text type="secondary">撮合演员、出方案、管履约 · 一站式搞定</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card
              hoverable
              onClick={() => navigate('/browse')}
              style={{
                borderRadius: 12,
                border: '1px solid #ddd6fe',
                height: '100%',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              styles={{
                body: { padding: 32, textAlign: 'center' },
              }}
            >
              <TeamOutlined style={{ fontSize: 40, color: '#7c3aed', marginBottom: 16 }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>我是甲方/散客</div>
              <Text type="secondary">浏览方案、看报价、直接下单 · 简单快捷</Text>
            </Card>
          </Col>
        </Row>
      </section>
    </div>
  );
}
