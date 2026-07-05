import { PhoneOutlined } from '@ant-design/icons';

export default function FloatingPhoneButton() {
  const phone = '400-xxx-xxxx'; // 平台电话
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
    }}>
      <a href={`tel:${phone}`} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 56, height: 56, borderRadius: '50%',
        background: '#7c3aed', color: '#fff', boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
        fontSize: 24, textDecoration: 'none',
      }}>
        <PhoneOutlined />
      </a>
      <div style={{
        fontSize: 11, color: '#7c3aed', textAlign: 'center', marginTop: 4,
      }}>电话咨询</div>
    </div>
  );
}
