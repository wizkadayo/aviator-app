import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Wallet, LogOut, User, History, Plane } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <Plane size={22} className="brand-icon" />
          <span>AVIATOR</span>
          <span className="brand-badge">PRO</span>
        </Link>

        <div className={`nav-links ${open ? 'open' : ''}`}>
          <Link to="/" className={isActive('/') ? 'active' : ''} onClick={() => setOpen(false)}>Home</Link>
          {user && <Link to="/play" className={isActive('/play') ? 'active' : ''} onClick={() => setOpen(false)}>Play</Link>}
          {user && <Link to="/history" className={isActive('/history') ? 'active' : ''} onClick={() => setOpen(false)}>History</Link>}
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <div className="nav-balance">
                <Wallet size={14} />
                <span>₦{user.balance?.toLocaleString()}</span>
              </div>
              <Link to="/deposit" className="btn-primary" style={{padding:'8px 16px', fontSize:'0.75rem', textDecoration:'none', borderRadius:'8px'}}>Deposit</Link>
              <div className="nav-avatar" onClick={() => navigate('/profile')}>
                <User size={16} />
              </div>
              <button className="nav-logout" onClick={handleLogout} title="Logout">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline" style={{padding:'8px 20px', fontSize:'0.8rem', textDecoration:'none'}}>Login</Link>
              <Link to="/register" className="btn-primary" style={{padding:'8px 20px', fontSize:'0.8rem', textDecoration:'none'}}>Register</Link>
            </>
          )}
          <button className="nav-toggle" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}