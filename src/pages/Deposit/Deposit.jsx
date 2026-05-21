import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import './Deposit.css';

const METHODS = [
  { id: 'paystack', name: 'Paystack', icon: '💳', desc: 'Card, Bank Transfer, USSD' },
  { id: 'flutterwave', name: 'Flutterwave', icon: '🦋', desc: 'Card, Mobile Money, Bank' },
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

export default function Deposit() {
  const { user, updateBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('paystack');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e) => {
    e.preventDefault();
    const amt = parseInt(amount);
    if (!amt || amt < 100) return toast.error('Minimum deposit is ₦100');
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    // In production: call Paystack/Flutterwave API here, verify callback, then update balance
    updateBalance(amt);
    toast.success(`₦${amt.toLocaleString()} deposited successfully! 🎉`);
    setAmount('');
    setLoading(false);
  };

  return (
    <div className="deposit-page page-wrapper">
      <div className="container" style={{maxWidth: 600, padding: '40px 20px'}}>
        <h1 className="page-heading">Deposit Funds</h1>
        <p className="page-sub">Current Balance: <strong style={{color:'var(--accent-green)'}}>₦{user?.balance?.toLocaleString()}</strong></p>

        <div className="method-cards">
          {METHODS.map(m => (
            <div key={m.id} className={`method-card card ${method === m.id ? 'selected' : ''}`}
              onClick={() => setMethod(m.id)}>
              <div className="method-icon">{m.icon}</div>
              <div>
                <div className="method-name">{m.name}</div>
                <div className="method-desc">{m.desc}</div>
              </div>
              {method === m.id && <div className="method-check">✓</div>}
            </div>
          ))}
        </div>

        <div className="card deposit-form-card">
          <label className="field-label">Quick Select</label>
          <div className="quick-grid">
            {QUICK_AMOUNTS.map(a => (
              <button key={a} className={`quick-amount-btn ${+amount === a ? 'active' : ''}`}
                onClick={() => setAmount(a)}>
                ₦{a.toLocaleString()}
              </button>
            ))}
          </div>

          <form onSubmit={handleDeposit}>
            <div className="form-group" style={{marginBottom:20}}>
              <label className="field-label">Or Enter Amount (₦)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 5000" min={100} />
              {amount && <p className="amount-note">You will receive: ₦{parseInt(amount || 0).toLocaleString()}</p>}
            </div>
            <button type="submit" className="btn-primary" style={{width:'100%', padding:'14px', fontSize:'1rem'}} disabled={loading}>
              {loading ? 'Processing...' : `Pay with ${METHODS.find(m=>m.id===method)?.name} →`}
            </button>
          </form>
        </div>

        <div className="deposit-notes card">
          <p>⚡ Deposits are instant after payment confirmation</p>
          <p>🔒 All transactions are secured with 256-bit encryption</p>
          <p>💬 Issues? Contact support: support@aviatorpro.ng</p>
        </div>
      </div>
    </div>
  );
}