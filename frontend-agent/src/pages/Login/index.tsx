import React, { useState, useEffect } from 'react';
import { Input, Button, Tabs, Checkbox, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Typography } from 'antd';

const { Text } = Typography;

/* ─── Design Tokens ─── */
const THEME = {
  brand: '#7c3aed',
  brandDark: '#5b21b6',
  bgPage: '#f5f5f7',
  bgCard: '#ffffff',
  textPrimary: '#1a1a2e',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  border: '#e5e7eb',
};

/* ─── Styles ─── */
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
  },
  /* ── Left Brand Area ── */
  leftPanel: {
    width: '55%',
    background: `linear-gradient(135deg, ${THEME.brand} 0%, ${THEME.brandDark} 100%)`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    overflow: 'hidden',
    padding: '60px 48px',
    boxSizing: 'border-box',
  },
  leftBgCircle: {
    position: 'absolute' as const,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  leftBgCircle1: {
    width: 400,
    height: 400,
    top: -100,
    right: -80,
  },
  leftBgCircle2: {
    width: 300,
    height: 300,
    bottom: -60,
    left: -40,
  },
  leftBgCircle3: {
    width: 200,
    height: 200,
    top: '40%',
    left: '10%',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  brandContent: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: 480,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: 16,
    lineHeight: 1,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 12,
  },
  slogan: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: '24px',
    textAlign: 'center' as const,
    marginBottom: 56,
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    width: '100%',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureIconSvg: {
    width: 24,
    height: 24,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    lineHeight: '22px',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '18px',
  },
  copyright: {
    position: 'absolute' as const,
    bottom: 32,
    left: 0,
    right: 0,
    textAlign: 'center' as const,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  /* ── Right Form Area ── */
  rightPanel: {
    width: '45%',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 48px',
    boxSizing: 'border-box',
  },
  formWrapper: {
    width: '100%',
    maxWidth: 400,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: THEME.textPrimary,
    marginBottom: 32,
    textAlign: 'center' as const,
  },
  tabsWrapper: {
    marginBottom: 28,
  },
  /* QR Code */
  qrSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 0 24px',
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    border: `2px dashed ${THEME.border}`,
    borderRadius: 12,
    backgroundColor: '#fafafa',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  qrIcon: {
    width: 48,
    height: 48,
    color: THEME.textTertiary,
  },
  qrLabel: {
    fontSize: 14,
    color: THEME.textTertiary,
  },
  qrHint: {
    fontSize: 13,
    color: THEME.textSecondary,
    textAlign: 'center' as const,
  },
  /* Phone Login */
  phoneSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  phoneInputRow: {
    display: 'flex',
    gap: 8,
  },
  phonePrefix: {
    width: 80,
    flexShrink: 0,
  },
  phoneInput: {
    flex: 1,
  },
  codeRow: {
    display: 'flex',
    gap: 8,
  },
  codeInput: {
    flex: 1,
  },
  codeButton: {
    width: 120,
    flexShrink: 0,
  },
  loginButton: {
    marginTop: 8,
    height: 48,
    fontSize: 16,
    fontWeight: 600,
    borderRadius: 8,
  },
  /* Agreement */
  agreementRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 4,
  },
  agreementText: {
    fontSize: 12,
    color: THEME.textTertiary,
  },
  agreementLink: {
    fontSize: 12,
    color: THEME.brand,
    cursor: 'pointer',
  },
};

/* ─── Mock Data ─── */
const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    title: '海量方案',
    desc: '汇聚优质喜剧演出内容',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
      </svg>
    ),
    title: '智能匹配',
    desc: 'AI精准匹配演员与活动',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9,12 11,14 15,10" />
      </svg>
    ),
    title: '全程保障',
    desc: '从咨询到签约一站式服务',
  },
];

/* ─── Login Component ─── */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('qr');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [agreed, setAgreed] = useState(false);

  /* Countdown timer */
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleGetCode = () => {
    if (!phone || phone.length < 11) {
      message.warning('请输入正确的手机号');
      return;
    }
    setCountdown(60);
    message.success('验证码已发送');
  };

  const handlePhoneLogin = () => {
    if (!phone || phone.length < 11) {
      message.warning('请输入正确的手机号');
      return;
    }
    if (!code || code.length < 4) {
      message.warning('请输入验证码');
      return;
    }
    if (!agreed) {
      message.warning('请先阅读并同意用户协议和隐私政策');
      return;
    }
    // Mock login success
    message.success('登录成功');
    navigate('/');
  };

  const tabItems = [
    {
      key: 'qr',
      label: '微信扫码登录',
      children: (
        <div style={styles.qrSection}>
          <div style={styles.qrPlaceholder}>
            <svg style={styles.qrIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="5" y="5" width="3" height="3" rx="0.5" />
              <rect x="16" y="5" width="3" height="3" rx="0.5" />
              <rect x="5" y="16" width="3" height="3" rx="0.5" />
              <rect x="16" y="16" width="3" height="3" rx="0.5" />
            </svg>
            <span style={styles.qrLabel}>微信扫码登录</span>
          </div>
          <span style={styles.qrHint}>请使用微信扫描二维码登录</span>
        </div>
      ),
    },
    {
      key: 'phone',
      label: '手机号登录',
      children: (
        <div style={styles.phoneSection}>
          <div style={styles.phoneInputRow}>
            <Input
              style={styles.phonePrefix}
              value="+86"
              disabled
            />
            <Input
              style={styles.phoneInput}
              placeholder="请输入手机号"
              maxLength={11}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              size="large"
            />
          </div>
          <div style={styles.codeRow}>
            <Input
              style={styles.codeInput}
              placeholder="请输入验证码"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              size="large"
            />
            <Button
              style={styles.codeButton}
              disabled={countdown > 0 || !phone || phone.length < 11}
              onClick={handleGetCode}
              size="large"
            >
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </Button>
          </div>
          <Button
            type="primary"
            block
            size="large"
            style={{
              ...styles.loginButton,
              backgroundColor: THEME.brand,
              borderColor: THEME.brand,
            }}
            onClick={handlePhoneLogin}
          >
            登录
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      {/* ── Left Brand Panel ── */}
      <div style={styles.leftPanel}>
        {/* Decorative background circles */}
        <div style={{ ...styles.leftBgCircle, ...styles.leftBgCircle1 }} />
        <div style={{ ...styles.leftBgCircle, ...styles.leftBgCircle2 }} />
        <div style={{ ...styles.leftBgCircle, ...styles.leftBgCircle3 }} />

        <div style={styles.brandContent}>
          <span style={styles.logoEmoji}>&#x1F3AD;</span>
          <div style={styles.logoText}>喜剧工厂</div>
          <div style={styles.slogan}>连接优质喜剧演出内容与商业活动需求</div>

          <div style={styles.features}>
            {features.map((feat, idx) => (
              <div key={idx} style={styles.featureItem}>
                <div style={styles.featureIcon}>{feat.icon}</div>
                <div style={styles.featureText}>
                  <div style={styles.featureTitle}>{feat.title}</div>
                  <div style={styles.featureDesc}>{feat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.copyright}>
          &copy; 2024 喜剧工厂 Comedy Factory. All rights reserved.
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div style={styles.rightPanel}>
        <div style={styles.formWrapper}>
          <div style={styles.formTitle}>欢迎登录</div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            centered
            style={styles.tabsWrapper}
          />

          {/* Agreement */}
          <div style={styles.agreementRow}>
            <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <Text style={styles.agreementText}>
              我已阅读并同意
              <a style={styles.agreementLink}>用户协议</a>
              {' '}和{' '}
              <a style={styles.agreementLink}>隐私政策</a>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
