import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Withdraw.css';

const BANKS = ['Access Bank','First Bank','GTBank','Zenith Bank','UBA','Sterling Bank','Opay','Kuda','Palmpay'];

export default function Withdraw() {
  const { user, updateBalance } = useAuth();
  const [form, setForm] = useState({ bank: '', accountNumber: '', accountName: '', amount: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const verifyAccount = async () => {
    if (!form.bank || form.accountNumber.length !== 10) return toast.error('Enter a valid 10-digit account number');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    set('accountName', 'JOHN DOE'); // Simulate bank verification
    setStep(2);
    setLoading(false);
    toast.success('Account verified ✅');
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amt = parseInt(form.amount);
    if (!amt || amt < 500) return toast.error('Minimum withdrawal is ₦500');
    if (amt > user.balance) return toast.error('Insufficient balance');
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    updateBalance(-amt);
    toast.success(`₦${amt.toLocaleString()} withdrawal initiated! 5-10 minutes 🎉`);
    setForm({ bank: '', accountNumber: '', accountName: '', amount: '' });
    setStep(1);
    setLoading(false);
  };

  return (
    <div className="withdraw-page page-wrapper">
      <div className="container" style={{maxWidth:540, padding:'40px 20px'}}>
        <h1 className="page-heading">Withdraw Funds</h1>
        <p className="page-sub">Balance: <strong style={{color:'var(--accent-green)'}}>₦{user?.balance?.toLocaleString()}</strong></p>

        <div className="steps-bar">
          {['Bank Details','Amount & Confirm'].map((s,i) => (
            <div key={i} className={`step-item ${step >= i+1 ? 'active' : ''}`}>
              <div className="step-dot">{i+1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="card">
          {step === 1 && (
            <div className="withdraw-step">
              <div className="form-group">
                <label>Select Bank</label>
                <select value={form.bank} onChange={e => set('bank', e.target.value)}>
                  <option value="">-- Choose Bank --</option>
                  {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Account Number</label>
                <input placeholder="10-digit account number" maxLength={10}
                  value={form.accountNumber} onChange={e => set('accountNumber', e.target.value.replace(/\D/g,''))} />
              </div>
              <button onClick={verifyAccount} className="btn-primary" style={{width:'100%', padding:'14px'}} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Account →'}
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleWithdraw} className="withdraw-step">
              <div className="verified-account">
                <span className="verified-badge">✓ Verified</span>
                <div className="verified-name">{form.accountName}</div>
                <div className="verified-info">{form.bank} • {form.accountNumber}</div>
                <button type="button" className="btn-outline" style={{padding:'6px 14px', fontSize:'0.75rem', marginTop:8}}
                  onClick={() => setStep(1)}>Change</button>
              </div>
              <div className="form-group">
                <label>Amount to Withdraw (₦)</label>
                <input type="number" placeholder="Minimum ₦500" value={form.amount}
                  onChange={e => set('amount', e.target.value)} min={500} max={user.balance} />
                <button type="button" className="max-btn" onClick={() => set('amount', user.balance)}>MAX</button>
              </div>
              <button type="submit" className="btn-primary" style={{width:'100%', padding:'14px', fontSize:'1rem'}} disabled={loading}>
                {loading ? 'Processing...' : `Withdraw ₦${parseInt(form.amount||0).toLocaleString()}`}
              </button>
              <p style={{textAlign:'center', color:'var(--text-muted)', fontSize:'0.8rem', marginTop:12}}>
                Processing time: 5–10 minutes
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}