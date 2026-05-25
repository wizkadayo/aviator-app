import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, CheckCircle, Clock, RefreshCw, AlertCircle, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import './Deposit.css';

const BASE = import.meta.env.VITE_API_URL;

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

export default function Deposit() {
  const { user, token, updateBalance } = useAuth();

  // Step 1 = enter amount, Step 2 = pay screen
  const [step, setStep]               = useState(1);
  const [amount, setAmount]           = useState('');
  const [loading, setLoading]         = useState(false);

  // Payment data from backend
  const [payment, setPayment]         = useState(null);

  // Status polling
  const [status, setStatus]           = useState('waiting');
  // waiting | confirming | success | failed | expired
  const [copied, setCopied]           = useState(false);
  const [usdtRate, setUsdtRate]       = useState(null);
  const [timeLeft, setTimeLeft]       = useState(30 * 60); // 30 min countdown
  const pollRef                       = useRef(null);
  const timerRef                      = useRef(null);

  // ── Fetch live USDT rate on mount ──
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res  = await fetch(`${BASE}/wallet/rate`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUsdtRate(data.usdt_ngn);
      } catch {
        setUsdtRate(1600); // fallback
      }
    };
    fetchRate();
  }, [token]);

  // ── Countdown timer (runs on step 2) ──
  useEffect(() => {
    if (step !== 2) return;
    setTimeLeft(30 * 60);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setStatus('expired');
          stopPolling();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [step]);

  // ── Poll payment status every 15 seconds ──
  const startPolling = (paymentId) => {
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`${BASE}/wallet/deposit/status/${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.status === 'success') {
          stopPolling();
          clearInterval(timerRef.current);
          setStatus('success');
          updateBalance(data.balance);
          toast.success(`₦${parseFloat(payment?.ngnAmount || 0).toLocaleString()} deposited! 🎉`);
        } else if (data.status === 'confirming') {
          setStatus('confirming');
        } else if (data.status === 'failed' || data.status === 'expired') {
          stopPolling();
          setStatus(data.status);
        }
      } catch {
        // silent fail — keep polling
      }
    }, 15000);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopPolling();
      clearInterval(timerRef.current);
    };
  }, []);

  // ── Create deposit ──
  const handleCreateDeposit = async (e) => {
    e.preventDefault();
    const amt = parseInt(amount);
    if (!amt || amt < 500) return toast.error('Minimum deposit is ₦500');
    setLoading(true);

    try {
      const res  = await fetch(`${BASE}/wallet/deposit`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPayment(data);
      setStatus('waiting');
      setStep(2);
      startPolling(data.paymentId);
      toast.success('Payment created! Send USDT to complete deposit.');
    } catch (err) {
      toast.error(err.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  // ── Copy wallet address ──
  const copyAddress = () => {
    navigator.clipboard.writeText(payment.walletAddress);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  // ── Manual status refresh ──
  const manualRefresh = async () => {
    if (!payment?.paymentId) return;
    try {
      const res  = await fetch(`${BASE}/wallet/deposit/status/${payment.paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') {
        stopPolling();
        clearInterval(timerRef.current);
        setStatus('success');
        updateBalance(data.balance);
        toast.success('Payment confirmed! ✅');
      } else {
        toast('Still waiting for payment...', { icon: '⏳' });
      }
    } catch {
      toast.error('Could not check status');
    }
  };

  // ── Start new deposit ──
  const startOver = () => {
    stopPolling();
    clearInterval(timerRef.current);
    setStep(1);
    setAmount('');
    setPayment(null);
    setStatus('waiting');
    setTimeLeft(30 * 60);
  };

  // ── Format countdown ──
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const estimatedUsdt = amount && usdtRate
    ? (parseInt(amount) / usdtRate).toFixed(4)
    : null;

  return (
    <div className="deposit-page page-wrapper">
      <div className="deposit-container">

        {/* ── HEADER ── */}
        <div className="deposit-header">
          <div className="deposit-header-icon">
            <Wallet size={22} />
          </div>
          <div>
            <h1 className="deposit-title">Deposit Funds</h1>
            <p className="deposit-subtitle">
              Balance: <strong style={{ color: 'var(--accent-green)' }}>
                ₦{user?.balance?.toLocaleString()}
              </strong>
            </p>
          </div>
        </div>

        {/* ════════════════════════
            STEP 1 — ENTER AMOUNT
        ════════════════════════ */}
        {step === 1 && (
          <div className="step-card card">

            <div className="crypto-badge">
              <img
                src="https://cryptologos.cc/logos/tether-usdt-logo.png"
                alt="USDT"
                className="usdt-logo"
              />
              <span>Pay with <strong>USDT TRC20</strong></span>
              <span className="network-tag">TRC20</span>
            </div>

            {/* Live rate */}
            {usdtRate && (
              <div className="rate-bar">
                <span>Live Rate</span>
                <span className="rate-val">1 USDT = ₦{usdtRate.toLocaleString()}</span>
              </div>
            )}

            {/* Quick amounts */}
            <div className="section-label">Quick Select</div>
            <div className="quick-grid">
              {QUICK_AMOUNTS.map(a => (
                <button
                  key={a}
                  className={`quick-amount-btn ${parseInt(amount) === a ? 'active' : ''}`}
                  onClick={() => setAmount(String(a))}
                >
                  ₦{a.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Manual input */}
            <form onSubmit={handleCreateDeposit}>
              <div className="field-group">
                <label className="section-label">Or Enter Amount (₦)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  min={500}
                />
                {/* USDT preview */}
                {estimatedUsdt && (
                  <div className="usdt-preview">
                    ≈ <strong>{estimatedUsdt} USDT</strong> to send
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary deposit-submit-btn"
                disabled={loading || !amount}
              >
                {loading ? (
                  <><span className="spinner" /> Generating Payment...</>
                ) : (
                  <>Generate Payment Address →</>
                )}
              </button>
            </form>

            <div className="deposit-notes">
              <p>⚡ Balance credited instantly after confirmation</p>
              <p>🔒 Payments verified on the blockchain</p>
              <p>📱 Send USDT on <strong>TRC20 network only</strong></p>
            </div>
          </div>
        )}

        {/* ════════════════════════
            STEP 2 — PAY SCREEN
        ════════════════════════ */}
        {step === 2 && payment && (
          <div className="step-card card">

            {/* ── SUCCESS STATE ── */}
            {status === 'success' && (
              <div className="status-screen success-screen">
                <div className="status-icon-wrap success-icon-wrap">
                  <CheckCircle size={52} />
                </div>
                <h2>Payment Confirmed!</h2>
                <p>
                  <strong style={{ color: 'var(--accent-green)', fontSize: '1.4rem' }}>
                    ₦{parseInt(payment.ngnAmount).toLocaleString()}
                  </strong>
                  {' '}has been added to your balance.
                </p>
                <div className="new-balance-box">
                  New Balance:&nbsp;
                  <strong>₦{user?.balance?.toLocaleString()}</strong>
                </div>
                <button className="btn-primary" style={{ width: '100%', padding: '14px' }}
                  onClick={startOver}>
                  Make Another Deposit
                </button>
              </div>
            )}

            {/* ── EXPIRED / FAILED STATE ── */}
            {(status === 'expired' || status === 'failed') && (
              <div className="status-screen failed-screen">
                <div className="status-icon-wrap failed-icon-wrap">
                  <AlertCircle size={52} />
                </div>
                <h2>{status === 'expired' ? 'Payment Expired' : 'Payment Failed'}</h2>
                <p>
                  {status === 'expired'
                    ? 'The payment window has closed. Please start a new deposit.'
                    : 'Something went wrong with this payment. Please try again.'}
                </p>
                <button className="btn-primary" style={{ width: '100%', padding: '14px' }}
                  onClick={startOver}>
                  Try Again
                </button>
              </div>
            )}

            {/* ── WAITING / CONFIRMING STATE ── */}
            {(status === 'waiting' || status === 'confirming') && (
              <>
                {/* Amount summary */}
                <div className="pay-summary">
                  <div className="pay-summary-row">
                    <span>You deposit</span>
                    <strong>₦{parseInt(payment.ngnAmount).toLocaleString()}</strong>
                  </div>
                  <div className="pay-summary-row">
                    <span>You send</span>
                    <strong style={{ color: '#26A17B' }}>
                      {payment.usdtAmount} USDT
                    </strong>
                  </div>
                  <div className="pay-summary-row">
                    <span>Network</span>
                    <span className="network-tag">TRC20</span>
                  </div>
                </div>

                {/* Status indicator */}
                <div className={`status-bar ${status}`}>
                  {status === 'confirming' ? (
                    <><span className="pulse-dot confirming-dot" />
                      Confirming on blockchain...</>
                  ) : (
                    <><span className="pulse-dot waiting-dot" />
                      Waiting for payment...</>
                  )}
                </div>

                {/* Countdown */}
                <div className="countdown-row">
                  <Clock size={14} />
                  <span>Expires in </span>
                  <span className={`countdown-val ${timeLeft < 300 ? 'urgent' : ''}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>

                {/* QR CODE */}
                <div className="qr-section">
                  <p className="qr-label">Scan QR to send USDT</p>
                  <div className="qr-wrap">
                    <QRCodeSVG
                      value={payment.walletAddress}
                      size={180}
                      bgColor="#1a1a2e"
                      fgColor="#ffffff"
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>

                {/* Wallet address */}
                <div className="address-section">
                  <p className="section-label">Send exactly&nbsp;
                    <strong style={{ color: '#26A17B' }}>{payment.usdtAmount} USDT</strong>
                    &nbsp;to this address:
                  </p>
                  <div className="address-box">
                    <span className="address-text">{payment.walletAddress}</span>
                    <button
                      className={`copy-btn ${copied ? 'copied' : ''}`}
                      onClick={copyAddress}
                    >
                      {copied
                        ? <><CheckCircle size={14} /> Copied</>
                        : <><Copy size={14} /> Copy</>}
                    </button>
                  </div>
                </div>

                {/* Warning */}
                <div className="address-warning">
                  ⚠️ Send <strong>only USDT on TRC20</strong> network to this address.
                  Sending any other coin or using a different network will result in
                  permanent loss of funds.
                </div>

                {/* Manual refresh */}
                <button className="refresh-btn" onClick={manualRefresh}>
                  <RefreshCw size={14} /> Check Payment Status
                </button>

                {/* Cancel */}
                <button className="cancel-btn" onClick={startOver}>
                  Cancel &amp; Start Over
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}