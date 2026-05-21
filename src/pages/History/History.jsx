import { useAuth } from '../../context/AuthContext';
import './History.css';

const MOCK_HISTORY = [
  { id:1, type:'bet', date:'2025-05-20 14:32', amount:-500, multiplier:'2.4x', result:'win', payout:1200 },
  { id:2, type:'deposit', date:'2025-05-20 12:00', amount:5000, result:'success' },
  { id:3, type:'bet', date:'2025-05-19 20:15', amount:-1000, multiplier:'1.1x', result:'loss', payout:0 },
  { id:4, type:'withdraw', date:'2025-05-19 18:00', amount:-3000, result:'success' },
  { id:5, type:'bet', date:'2025-05-18 10:45', amount:-200, multiplier:'8.7x', result:'win', payout:1740 },
  { id:6, type:'bet', date:'2025-05-17 22:10', amount:-500, multiplier:'1.5x', result:'win', payout:750 },
];

export default function History() {
  const { user } = useAuth();

  return (
    <div className="history-page page-wrapper">
      <div className="container" style={{maxWidth:700, padding:'40px 20px'}}>
        <h1 className="page-heading">Transaction History</h1>
        <p className="page-sub">All your bets, deposits, and withdrawals.</p>

        <div className="history-list">
          {MOCK_HISTORY.map(h => (
            <div key={h.id} className="history-item card">
              <div className="hist-icon" data-type={h.type}>
                {h.type === 'bet' ? '✈️' : h.type === 'deposit' ? '💰' : '🏦'}
              </div>
              <div className="hist-details">
                <div className="hist-title">
                  {h.type === 'bet' ? `Bet — ${h.multiplier}` : h.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                </div>
                <div className="hist-date">{h.date}</div>
              </div>
              <div className="hist-right">
                <div className={`hist-amount ${h.amount < 0 ? 'neg' : 'pos'}`}>
                  {h.amount < 0 ? '-' : '+'}₦{Math.abs(h.amount).toLocaleString()}
                </div>
                {h.type === 'bet' && h.result === 'win' && (
                  <div className="hist-payout">+₦{h.payout.toLocaleString()}</div>
                )}
                <div className={`hist-badge ${h.result}`}>{h.result}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}