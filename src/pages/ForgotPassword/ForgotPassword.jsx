import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plane } from 'lucide-react';
import toast from 'react-hot-toast';
import '../Login/Login.css';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-card card">
        <div className="auth-logo">
          <Plane size={32} className="auth-plane" />
          <span>AVIATOR PRO</span>
        </div>
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-sub">Enter your email and we'll send you a reset link.</p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link →'}
            </button>
          </form>
        ) : (
          <div className="sent-box">
            <div className="sent-icon">📧</div>
            <p>We sent a password reset link to <strong>{email}</strong></p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
              Check your inbox and spam folder. The link expires in 1 hour.
            </p>
          </div>
        )}

        <p className="auth-footer">
          <Link to="/login">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}