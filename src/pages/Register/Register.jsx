import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Plane } from 'lucide-react';
import toast from 'react-hot-toast';
import '../Login/Login.css';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    login({ name: `${form.firstName} ${form.lastName}`, email: form.email, phone: form.phone, balance: 5000 });
    toast.success('Account created! Welcome bonus: ₦5,000 🎉');
    navigate('/play');
    setLoading(false);
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-card card" style={{maxWidth: 500}}>
        <div className="auth-logo"><Plane size={32} className="auth-plane" /><span>AVIATOR PRO</span></div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-sub">Join 142,000+ players. Get ₦5,000 welcome bonus.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input placeholder="Bright" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input placeholder="Doe" value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" placeholder="08012345678" value={form.phone} onChange={e => set('phone', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-eye">
              <input type={show ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password}
                onChange={e => set('password', e.target.value)} minLength={8} required />
              <button type="button" onClick={() => setShow(!show)} className="eye-btn">
                {show ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account →'}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
}