import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Wallet, History, LogOut, Shield } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('info');

  return (
    <div className="profile-page page-wrapper">
      <div className="container" style={{maxWidth:700, padding:'40px 20px'}}>
        <div className="profile-header card">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            <div className="profile-balance">
              <Wallet size={16} /> ₦{user?.balance?.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          {['info','security'].map(t => (
            <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={() => setTab(t)}>
              {t === 'info' ? <><User size={14}/> Info</> : <><Shield size={14}/> Security</>}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <div className="card profile-section">
            <div className="info-row"><span>Full Name</span><strong>{user?.name}</strong></div>
            <div className="info-row"><span>Email</span><strong>{user?.email}</strong></div>
            <div className="info-row"><span>Phone</span><strong>{user?.phone || 'Not set'}</strong></div>
            <div className="info-row"><span>Account Status</span><strong style={{color:'var(--accent-green)'}}>Active ✓</strong></div>
          </div>
        )}

        {tab === 'security' && (
          <div className="card profile-section">
            <p style={{color:'var(--text-secondary)', marginBottom:16, fontSize:'0.9rem'}}>Manage your security settings below.</p>
            <button className="btn-outline" style={{width:'100%', marginBottom:12}}>Change Password</button>
            <button className="btn-outline" style={{width:'100%'}}>Enable 2FA</button>
          </div>
        )}

        <div className="profile-actions">
          <Link to="/deposit" className="btn-primary" style={{textDecoration:'none', textAlign:'center'}}>Deposit Funds</Link>
          <Link to="/withdraw" className="btn-gold" style={{textDecoration:'none', textAlign:'center'}}>Withdraw</Link>
          <Link to="/history" className="btn-outline" style={{textDecoration:'none', textAlign:'center'}}><History size={14}/> History</Link>
          <button onClick={logout} className="btn-outline logout-red"><LogOut size={14}/> Logout</button>
        </div>
      </div>
    </div>
  );
}