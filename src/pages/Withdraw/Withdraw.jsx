import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowUpRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './Withdraw.css';

const BASE = import.meta.env.VITE_API_URL;

export default function Withdraw() {
  const { user, token, updateBalance } = useAuth();
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState({ amount: '', walletAddress: '', network: 'TRC20' });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [usdtRate, setUsdtRate] = useState(1600);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const estimatedUsdt = form.amount && usdtRate
    ? (parseInt(form.amount) / usdtRate).toFixed(4)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseInt(form.amount);
    if (!amt || amt < 1000)      return toast.error('Minimum withdrawal is ₦1,000');
    if (amt > user.balance)      return toast.error('Insufficient balance');
    if (!form.walletAddress)     return toast.error('Enter your USDT wallet address');
    if (!/^T[a-zA-Z0-9]{33}$/.test(form.walletAddress)) {
      return toast.error('Invalid TRC20 address — must start with T and be 34 characters');
    }

    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/wallet/withdraw`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount:        amt,
          walletAddress: form.walletAddress,
          network:       form.network,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      updateBalance(data.balance);
      setResult(data);
      setStep(2);
      toast.success('Withdrawal request submitted! ✅');
    } catch (err) {
      toast.error(err.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="withdraw-page page-wrapper">
      <div className="withdraw-container">

        <div className="deposit-header">
          <div className="deposit-header-icon" style={{
            background: 'rgba(245,166,35,0.1)',
            borderColor: 'rgba(245,166,35,0.25)',
            color: 'var(--accent-gold)'
          }}>
            <ArrowUpRight size={22} />
          </div>
          <div>
            <h1 className="deposit-title">Withdraw Funds</h1>
            <p className="deposit-subtitle">
              Balance:&nbsp;
              <strong style={{ color: 'var(--accent-green)' }}>
                ₦{user?.balance?.toLocaleString()}
              </strong>
            </p>
          </div>
        </div>

        {/* STEP 1 — FORM */}
        {step === 1 && (
          <div className="step-card card">

            <div className="crypto-badge">
              <img
                src="https://cryptologos.cc/logos/tether-usdt-logo.png"
                alt="USDT"
                className="usdt-logo"
              />
              <span>Receive as <strong>USDT TRC20</strong></span>
              <span className="network-tag">TRC20</span>
            </div>

            <div className="rate-bar">
              <span>Live Rate</span>
              <span className="rate-val">1 USDT ≈ ₦{usdtRate.toLocaleString()}</span>
            </div>

            <form onSubmit={handleSubmit} className="withdraw-form">

              <div className="field-group">
                <label className="section-label">Amount to Withdraw (₦)</label>
                <input
                  type="number"
                  placeholder="Minimum ₦1,000"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  min={1000}
                  max={user?.balance}
                />
                <div className="field-row-between">
                  {estimatedUsdt && (
                    <span className="usdt-preview" style={{ marginTop: 0 }}>
                      ≈ <strong>{estimatedUsdt} USDT</strong> you receive
                    </span>
                  )}
                  <button
                    type="button"
                    className="max-btn"
                    onClick={() => set('amount', String(Math.floor(user?.balance)))}
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div className="field-group">
                <label className="section-label">Your USDT Wallet Address (TRC20)</label>
                <input
                  type="text"
                  placeholder="Starts with T — e.g. TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"
                  value={form.walletAddress}
                  onChange={e => set('walletAddress', e.target.value.trim())}
                />
                <p className="field-hint">
                  ⚠️ Double-check this address. Wrong address = permanent loss of funds.
                </p>
              </div>

              <button
                type="submit"
                className="btn-gold"
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                disabled={loading}
              >
                {loading
                  ? <><span className="spinner" /> Processing...</>
                  : <>Submit Withdrawal →</>}
              </button>
            </form>

            <div className="deposit-notes">
              <p>⏱ USDT sent within 30 minutes of approval</p>
              <p>💸 Minimum withdrawal: ₦1,000</p>
              <p>📱 TRC20 network only — no ERC20 or BEP20</p>
            </div>
          </div>
        )}

        {/* STEP 2 — SUCCESS */}
        {step === 2 && result && (
          <div className="step-card card">
            <div className="status-screen success-screen">
              <div className="status-icon-wrap success-icon-wrap">
                <CheckCircle size={52} />
              </div>
              <h2>Withdrawal Submitted!</h2>
              <p>{result.message}</p>

              <div className="withdraw-result-box">
                <div className="wr-row">
                  <span>Amount</span>
                  <strong>₦{parseInt(form.amount).toLocaleString()}</strong>
                </div>
                <div className="wr-row">
                  <span>USDT Amount</span>
                  <strong style={{ color: '#26A17B' }}>{result.usdtAmount} USDT</strong>
                </div>
                <div className="wr-row">
                  <span>Wallet</span>
                  <strong style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                    {result.walletAddress}
                  </strong>
                </div>
                <div className="wr-row">
                  <span>Reference</span>
                  <strong style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {result.reference}
                  </strong>
                </div>
                <div className="wr-row">
                  <span>New Balance</span>
                  <strong style={{ color: 'var(--accent-green)' }}>
                    ₦{user?.balance?.toLocaleString()}
                  </strong>
                </div>
              </div>

              <button
                className="btn-primary"
                style={{ width: '100%', padding: '14px' }}
                onClick={() => { setStep(1); setForm({ amount: '', walletAddress: '', network: 'TRC20' }); setResult(null); }}
              >
                Make Another Withdrawal
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}