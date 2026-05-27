import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { User, Wallet, History, LogOut, Shield, Key, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import './Profile.css';

const BASE = import.meta.env.VITE_API_URL;

export default function Profile() {
  const { user, token, logout, refreshBalance } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('info');

  // Change password
  const [pwForm, setPwForm]   = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  // 2FA
  const [tfaStep, setTfaStep]   = useState(1);
  const [tfaCode, setTfaCode]   = useState('');
  const [tfaSecret, setTfaSecret] = useState(null);
  const [tfaQR, setTfaQR]       = useState(null);
  const [tfaLoading, setTfaLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) {
      return toast.error('New passwords do not match');
    }
    setPwLoading(true);
    try {
      const res  = await fetch(`${BASE}/auth/password`, {
        method:  'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: pwForm.current,
          newPassword:     pwForm.newPw,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Password changed successfully! ✅');
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const setup2FA = async () => {
    setTfaLoading(true);
    try {
      const res  = await fetch(`${BASE}/auth/2fa/setup`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTfaSecret(data.secret);
      setTfaQR(data.qrCode);
      setTfaStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTfaLoading(false);
    }
  };

  const verify2FA = async () => {
    if (!tfaCode || tfaCode.length !== 6) {
      return toast.error('Enter the 6-digit code from your authenticator app');
    }
    setTfaLoading(true);
    try {
      const res  = await fetch(`${BASE}/auth/2fa/verify`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ code: tfaCode, secret: tfaSecret }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('2FA enabled successfully! 🔐');
      setTfaStep(3);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTfaLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="profile-page page-wrapper">
      <div className="container" style={{ maxWidth: 700, padding: '40px 20px' }}>

        {/* HEADER */}
        <div className="profile-header card">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            <div className="profile-balance" onClick={refreshBalance} style={{ cursor: 'pointer' }} title="Click to refresh">
              <Wallet size={16} />
              ₦{user?.balance?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="profile-tabs">
          {[
            { id: 'info',     label: 'Info',     icon: <User size={14} /> },
            { id: 'password', label: 'Password', icon: <Key size={14} /> },
            { id: 'security', label: '2FA',      icon: <Shield size={14} /> },
          ].map(t => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* INFO TAB */}
        {tab === 'info' && (
          <div className="card profile-section">
            <div className="info-row"><span>Full Name</span><strong>{user?.name}</strong></div>
            <div className="info-row"><span>Email</span><strong>{user?.email}</strong></div>
            <div className="info-row"><span>Phone</span><strong>{user?.phone || 'Not set'}</strong></div>
            <div className="info-row">
              <span>Account Status</span>
              <strong style={{ color: 'var(--accent-green)' }}>Active ✓</strong>
            </div>
          </div>
        )}

        {/* PASSWORD TAB */}
        {tab === 'password' && (
          <div className="card profile-section">
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.9rem' }}>
              Choose a strong password with at least 8 characters.
            </p>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="pw-label">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={pwForm.current}
                  onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="pw-label">New Password</label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={pwForm.newPw}
                  onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))}
                  minLength={8}
                  required
                />
              </div>
              <div className="form-group">
                <label className="pw-label">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={pwForm.confirm}
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '12px' }}
                disabled={pwLoading}
              >
                {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* 2FA TAB */}
        {tab === 'security' && (
          <div className="card profile-section">

            {tfaStep === 1 && (
              <>
                <div className="tfa-intro">
                  <Smartphone size={32} style={{ color: 'var(--accent-gold)' }} />
                  <h3>Two-Factor Authentication</h3>
                  <p>
                    Add an extra layer of security. Use Google Authenticator or
                    Authy to scan the QR code and generate login codes.
                  </p>
                </div>
                <button
                  className="btn-gold"
                  style={{ width: '100%', padding: '12px' }}
                  onClick={setup2FA}
                  disabled={tfaLoading}
                >
                  {tfaLoading ? 'Setting up...' : 'Enable 2FA →'}
                </button>
              </>
            )}

            {tfaStep === 2 && tfaQR && (
              <>
                <div className="tfa-step">
                  <p className="tfa-instruction">
                    <strong>Step 1:</strong> Open Google Authenticator or Authy on your phone
                  </p>
                  <p className="tfa-instruction">
                    <strong>Step 2:</strong> Scan this QR code
                  </p>
                  <div className="tfa-qr">
                    <img src={tfaQR} alt="2FA QR Code" style={{ width: 180, height: 180 }} />
                  </div>
                  <p className="tfa-instruction">
                    <strong>Step 3:</strong> Enter the 6-digit code from the app
                  </p>
                  <input
                    type="text"
                    placeholder="000000"
                    value={tfaCode}
                    onChange={e => setTfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.4rem', fontFamily: 'Orbitron' }}
                    maxLength={6}
                  />
                  <button
                    className="btn-primary"
                    style={{ width: '100%', padding: '12px', marginTop: 8 }}
                    onClick={verify2FA}
                    disabled={tfaLoading || tfaCode.length !== 6}
                  >
                    {tfaLoading ? 'Verifying...' : 'Verify & Enable 2FA'}
                  </button>
                </div>
              </>
            )}

            {tfaStep === 3 && (
              <div className="tfa-success">
                <div style={{ fontSize: '3rem' }}>🔐</div>
                <h3>2FA Enabled!</h3>
                <p>Your account is now protected with two-factor authentication.</p>
              </div>
            )}
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="profile-actions">
          <Link to="/deposit"  className="btn-primary"  style={{ textDecoration: 'none', textAlign: 'center' }}>Deposit</Link>
          <Link to="/withdraw" className="btn-gold"     style={{ textDecoration: 'none', textAlign: 'center' }}>Withdraw</Link>
          <Link to="/history"  className="btn-outline"  style={{ textDecoration: 'none', textAlign: 'center' }}>
            <History size={14} /> History
          </Link>
          <button onClick={handleLogout} className="btn-outline logout-red">
            <LogOut size={14} /> Logout
          </button>
        </div>

      </div>
    </div>
  );
}