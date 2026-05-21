import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Plane } from 'lucide-react';
import toast from 'react-hot-toast';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    // Simulate login — replace with real API call later
    login({ name: 'Player', email: form.email, balance: 5000 });
    toast.success('Welcome back! 🚀');
    navigate('/play');
    setLoading(false);
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-card card">
        <div className="auth-logo"><Plane size={32} className="auth-plane" /><span>AVIATOR PRO</span></div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-sub">Login to your account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@email.com" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-eye">
              <input type={show ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} required />
              <button type="button" onClick={() => setShow(!show)} className="eye-btn">
                {show ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}