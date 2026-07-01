import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/Login';
import SkuListPage from './pages/SkuList';
import SkuDetailPage from './pages/SkuDetail';
import SubmitRequestPage from './pages/SubmitRequest';
import RequestHistoryPage from './pages/RequestHistory';

export default function App(): React.ReactElement {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <AntApp>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                {/* 默认重定向到 SKU 浏览 */}
                <Route index element={<Navigate to="/skus" replace />} />
                <Route path="skus" element={<SkuListPage />} />
                <Route path="skus/:id" element={<SkuDetailPage />} />
                <Route path="demands/new" element={<SubmitRequestPage />} />
                <Route path="demands" element={<RequestHistoryPage />} />
                <Route path="login" element={<LoginPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}
