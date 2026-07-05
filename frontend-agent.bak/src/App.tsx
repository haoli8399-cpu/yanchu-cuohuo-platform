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
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<SkuList />} />
            <Route path="/skus/:id" element={<SkuDetail />} />
            <Route path="/demands/:id" element={<ProtectedRoute><DemandDetail /></ProtectedRoute>} />
            <Route path="/demands/new" element={<ProtectedRoute><SubmitRequest /></ProtectedRoute>} />
            <Route path="/demands" element={<ProtectedRoute><RequestHistory /></ProtectedRoute>} />
          </Routes>
          <FloatingPhoneButton />
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}
