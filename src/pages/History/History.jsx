import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './History.css';

const BASE = import.meta.env.VITE_API_URL;

export default function History() {
  const { user, token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [activeTab, setActiveTab]       = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res  = await fetch(`${BASE}/wallet`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setTransactions(data.transactions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchHistory();
  }, [token]);

  const filtered = transactions.filter(t => {
    if (activeTab === 'all')         return true;
    if (activeTab === 'bets')        return t.type === 'bet' || t.type === 'win';
    if (activeTab === 'deposits')    return t.type === 'deposit' || t.type === 'bonus';
    if (activeTab === 'withdrawals') return t.type === 'withdrawal';
    return true;
  });

  const getIcon = (type) => {
    if (type === 'bet')        return '✈️';
    if (type === 'win')        return '💰';
    if (type === 'deposit')    return '⬇️';
    if (type === 'bonus')      return '🎁';
    if (type === 'withdrawal') return '⬆️';
    return '💳';
  };

  const getTitle = (t) => {
    if (t.type === 'bet')        return 'Bet Placed';
    if (t.type === 'win')        return 'Bet Won';
    if (t.type === 'deposit')    return 'Deposit';
    if (t.type === 'bonus')      return 'Bonus Credit';
    if (t.type === 'withdrawal') return 'Withdrawal';
    return t.type;
  };

  const getBadgeClass = (t) => {
    if (t.type === 'win')        return 'win';
    if (t.type === 'bet')        return 'loss';
    if (t.status === 'success')  return 'success';
    if (t.status === 'pending')  return 'pending';
    if (t.status === 'failed')   return 'failed';
    return 'success';
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-NG', {
      day:    '2-digit',
      month:  'short',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    });
  };

  const isPositive = (t) =>
    t.type === 'deposit' || t.type === 'win' || t.type === 'bonus';

  return (
    <div className="history-page page-wrapper">
      <div className="container" style={{ maxWidth: 700, padding: '40px 20px' }}>

        <h1 className="page-heading">Transaction History</h1>
        <p className="page-sub">
          Balance:&nbsp;
          <strong style={{ color: 'var(--accent-green)' }}>
            ₦{user?.balance?.toLocaleString()}
          </strong>
        </p>

        {/* TABS */}
        <div className="hist-tabs">
          {['all','deposits','bets','withdrawals'].map(tab => (
            <button
              key={tab}
              className={`hist-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="hist-loading">
            <div className="hist-spinner" />
            <p>Loading transactions...</p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="hist-error">
            ⚠️ {error}
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && filtered.length === 0 && (
          <div className="hist-empty">
            <span>📭</span>
            <p>No transactions yet</p>
            <small>Your deposits, bets and withdrawals will appear here</small>
          </div>
        )}

        {/* LIST */}
        {!loading && !error && filtered.length > 0 && (
          <div className="history-list">
            {filtered.map(t => (
              <div key={t.id} className="history-item card">
                <div className="hist-icon">
                  {getIcon(t.type)}
                </div>
                <div className="hist-details">
                  <div className="hist-title">{getTitle(t)}</div>
                  <div className="hist-ref">
                    {t.reference && (
                      <span className="hist-ref-text">{t.reference}</span>
                    )}
                  </div>
                  <div className="hist-date">{formatDate(t.created_at)}</div>
                </div>
                <div className="hist-right">
                  <div className={`hist-amount ${isPositive(t) ? 'pos' : 'neg'}`}>
                    {isPositive(t) ? '+' : '-'}₦{parseFloat(t.amount).toLocaleString()}
                  </div>
                  <div className="hist-balance-after">
                    Bal: ₦{parseFloat(t.balance_after).toLocaleString()}
                  </div>
                  <div className={`hist-badge ${getBadgeClass(t)}`}>
                    {t.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}