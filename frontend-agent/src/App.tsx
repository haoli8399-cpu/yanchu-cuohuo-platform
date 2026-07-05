import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';

/* ─── Global Styles ─── */
import './styles/global.less';
import './styles/theme.less';

/* ─── Lazy-loaded Pages ─── */
const Login = React.lazy(() => import('./pages/Login'));
const Discover = React.lazy(() => import('./pages/Discover'));
const SkuList = React.lazy(() => import('./pages/SkuList'));
const SkuDetail = React.lazy(() => import('./pages/SkuDetail'));
const DemandList = React.lazy(() => import('./pages/DemandList'));
const DemandDetail = React.lazy(() => import('./pages/DemandDetail'));
const SubmitRequest = React.lazy(() => import('./pages/SubmitRequest'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const CaseDetail = React.lazy(() => import('./pages/CaseDetail'));

/* ─── Loading Fallback ─── */
const Fallback: React.FC = () => {
  const fallbackStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    color: '#9ca3af',
    fontSize: 14,
    fontFamily: '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
  };

  return (
    <div style={fallbackStyle}>
      <span>页面加载中...</span>
    </div>
  );
};

/* ─── Suspense Wrapper ─── */
const LazyPage = (Component: React.LazyExoticComponent<React.FC>) => (
  <Suspense fallback={<Fallback />}>
    <Component />
  </Suspense>
);

/* ─── App ─── */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          {/* Login - No layout */}
          <Route path="/login" element={LazyPage(Login)} />

          {/* Main layout routes */}
          <Route path="/" element={<MainLayout />}>
            {/* Discover / Home */}
            <Route index element={LazyPage(Discover)} />

            {/* SKU routes */}
            <Route path="skus" element={LazyPage(SkuList)} />
            <Route path="skus/:id" element={LazyPage(SkuDetail)} />

            {/* Demand routes */}
            <Route path="demands" element={LazyPage(DemandList)} />
            <Route path="demands/submit" element={LazyPage(SubmitRequest)} />
            <Route path="demands/:id" element={LazyPage(DemandDetail)} />

            {/* User */}
            <Route path="user" element={LazyPage(UserProfile)} />

            {/* Notifications */}
            <Route path="notifications" element={LazyPage(Notifications)} />

            {/* Case Detail */}
            <Route path="cases/:id" element={LazyPage(CaseDetail)} />
          </Route>

          {/* Redirect /index.html to / */}
          <Route path="/index.html" element={<Navigate to="/" replace />} />

          {/* Catch-all 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
