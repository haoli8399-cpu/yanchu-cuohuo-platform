/**
 * 功能占位页
 * 用于尚未实现的功能模块（CODE_STANDARDS UX-2: 三态处理）
 */
import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Result, Button } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';

const PlaceholderPage: React.FC = () => {
  return (
    <PageContainer>
      <Result
        icon={<ToolOutlined />}
        title="功能开发中"
        subTitle="该模块正在紧张开发中，敬请期待"
        extra={
          <Button
            type="primary"
            style={{ minHeight: 44 }}
            onClick={() => history.push('/dashboard')}
          >
            返回工作台
          </Button>
        }
      />
    </PageContainer>
  );
};

export default PlaceholderPage;
