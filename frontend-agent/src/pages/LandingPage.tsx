import { useState } from 'react';
import { Button, Card, Col, Input, Row, Space, Tag, Typography } from 'antd';
import { ArrowRightOutlined, DollarOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const activityTags = ['脱口秀', '年会', '团建', '商业活动', '路演'];

const highlights = [
  { value: '15 分钟', label: '模糊需求进来，标准报价出去', icon: <ThunderboltOutlined /> },
  { value: '×0.7', label: '渠道价 = 标准价 ×0.7，透明可算', icon: <DollarOutlined /> },
  { value: '0 佣金', label: '自有单不收费，只赚该赚的差价', icon: <ArrowRightOutlined /> },
];

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');

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
          <Space size={10} style={{ marginBottom: 18 }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: '#7c3aed' }} />
            <Text strong style={{ color: '#7c3aed', fontSize: 16 }}>演立方 YANLI</Text>
          </Space>

          <Title style={{ fontSize: 48, lineHeight: 1.12, marginBottom: 14, color: '#111827' }}>
            有商演需求？一句话，成交一场演出。
          </Title>
          <Text style={{ display: 'block', fontSize: 18, color: '#7c3aed', fontWeight: 700, marginBottom: 18 }}>
            演立方 · AI 商演成交机器（YANLI）
          </Text>
          <Paragraph style={{ fontSize: 16, color: '#4b5563', marginBottom: 32 }}>
            说一句需求，AI「小演」替你匹配方案、出报价、盯到成单。
          </Paragraph>

          <Input.Search
            size="large"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="商演找演立方"
            enterButton={<Button type="primary" size="large">生成报价方案</Button>}
            style={{ maxWidth: 600, margin: '0 auto 20px' }}
          />

          <Space size={10} wrap style={{ justifyContent: 'center' }}>
            {activityTags.map((tag) => (
              <Tag
                key={tag}
                onClick={() => setPrompt(`${tag}活动，帮我生成报价方案`)}
                style={{
                  padding: '6px 14px',
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
        <Row gutter={[18, 18]}>
          {highlights.map((item) => (
            <Col xs={24} md={8} key={item.value}>
              <Card hoverable style={{ borderRadius: 8, height: '100%' }} styles={{ body: { padding: 24 } }}>
                <Space size={12} align="start">
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
                    <div style={{ fontSize: 30, fontWeight: 800, color: '#111827', fontFamily: "'JetBrains Mono', monospace" }}>
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
    </div>
  );
}
