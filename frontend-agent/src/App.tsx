import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Login from './pages/Login';
import SkuList from './pages/SkuList';
import SkuDetail from './pages/SkuDetail';
import SubmitRequest from './pages/SubmitRequest';
import RequestHistory from './pages/RequestHistory';
import DemandDetail from './pages/DemandDetail';
import { AuthProvider, useAuth } from './services/auth';
import FloatingPhoneButton from './components/FloatingPhoneButton';

// Supplier Console
import SupplierLayout from './pages/supplier/SupplierLayout';
import DailyReport from './pages/supplier/DailyReport';
import SalesWarRoom from './pages/supplier/SalesWarRoom';
import SkuManage from './pages/supplier/SkuManage';
import ProfitDashboard from './pages/supplier/ProfitDashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#7c3aed' } }}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* 活动公司/甲方端 */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<SkuList />} />
            <Route path="/skus/:id" element={<SkuDetail />} />
            <Route path="/demands/:id" element={<ProtectedRoute><DemandDetail /></ProtectedRoute>} />
            <Route path="/demands/new" element={<ProtectedRoute><SubmitRequest /></ProtectedRoute>} />
            <Route path="/demands" element={<ProtectedRoute><RequestHistory /></ProtectedRoute>} />

            {/* 供应商端 (supplier-console) — 内部成交工具 */}
            <Route path="/supplier" element={<SupplierLayout />}>
              <Route index element={<Navigate to="/supplier/daily-report" replace />} />
              <Route path="daily-report" element={<DailyReport />} />
              <Route path="war-room" element={<SalesWarRoom />} />
              <Route path="skus" element={<SkuManage />} />
              <Route path="profit" element={<ProfitDashboard />} />
              <Route path="orders" element={<div style={{padding:40,textAlign:'center',color:'#9ca3af'}}>订单管理 — 开发中</div>} />
            </Route>
          </Routes>
          <FloatingPhoneButton />
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}
