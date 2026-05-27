import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Plane } from 'lucide-react';
import toast from 'react-hot-toast';
import '../Login/Login.css';

export default function ResetPassword() {
  const { resetPassword }       = useAuth();
  const navigate                = useNavigate();
  const [searchParams]          = useSearchParams();
  const [form, setForm]         = useState({ password: '', confirm: '' });
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const resetToken = searchParams.get('token');

  useEffect(() => {
    if (!resetToken) {
      setTokenValid(false);
    }
  }, [resetToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      return toast.error('Passwords do not match');
    }
    if (form.password.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }
    setLoading(true);
    try {
      await resetPassword(resetToken, form.password);
      toast.success('Password reset! You can now login. ✅');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="auth-page page-wrapper">
        <div className="auth-card card">
          <div className="auth-logo">
            <Plane size={32} className="auth-plane" />
            <span>AVIATOR PRO</span>
          </div>
          <div className="sent-box">
            <div className="sent-icon">❌</div>
            <p>Invalid or missing reset token.</p>
            <Link to="/forgot-password" className="btn-primary" style={{ marginTop: 16, textDecoration: 'none' }}>
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-card card">
        <div className="auth-logo">
          <Plane size={32} className="auth-plane" />
          <span>AVIATOR PRO</span>
        </div>
        <h2 className="auth-title">New Password</h2>
        <p className="auth-sub">Enter your new password below.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>New Password</label>
            <div className="input-eye">
              <input
                type={show ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                minLength={8}
                required
              />
              <button type="button" onClick={() => setShow(!show)} className="eye-btn">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat new password"
              value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password →'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}