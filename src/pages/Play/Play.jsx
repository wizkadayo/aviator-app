import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plane, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import './Play.css';

const PHASES = { WAITING: 'waiting', FLYING: 'flying', CRASHED: 'crashed' };

function generateCrashPoint() {
  const r = Math.random();
  if (r < 0.3) return +(1.0 + Math.random() * 0.9).toFixed(2);
  if (r < 0.6) return +(2.0 + Math.random() * 3.0).toFixed(2);
  if (r < 0.85) return +(5.0 + Math.random() * 10.0).toFixed(2);
  return +(15.0 + Math.random() * 85.0).toFixed(2);
}

const LIVE_BETS = [
  { user: 'Ola***', bet: 500 }, { user: 'Chi***', bet: 1000 },
  { user: 'Ade***', bet: 2000 }, { user: 'Bam***', bet: 500 },
  { user: 'Emy***', bet: 1500 }, { user: 'Tun***', bet: 3000 },
  { user: 'Kay***', bet: 750 }, { user: 'Ife***', bet: 250 },
];

export default function Play() {
  const { user, updateBalance } = useAuth();
  const [phase, setPhase] = useState(PHASES.WAITING);
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [stake, setStake] = useState(100);
  const [betPlaced, setBetPlaced] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashoutMultiplier, setCashoutMultiplier] = useState(null);
  const [history, setHistory] = useState([2.4, 1.2, 8.7, 14.0, 1.1, 3.3, 22.5, 1.5, 6.2, 2.0]);
  const intervalRef = useRef(null);

  const startCountdown = useCallback(() => {
    setPhase(PHASES.WAITING);
    setMultiplier(1.0);
    setBetPlaced(false);
    setCashedOut(false);
    setCashoutMultiplier(null);
    setCountdown(5);
    const cp = generateCrashPoint();
    setCrashPoint(cp);

    let count = 5;
    intervalRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(intervalRef.current);
        startFlight(cp);
      }
    }, 1000);
  }, []);

  const startFlight = (cp) => {
    setPhase(PHASES.FLYING);
    let mult = 1.0;
    const speed = 0.03;
    intervalRef.current = setInterval(() => {
      mult = +(mult + mult * speed).toFixed(2);
      setMultiplier(mult);
      if (mult >= cp) {
        clearInterval(intervalRef.current);
        setMultiplier(cp);
        setPhase(PHASES.CRASHED);
        setHistory(h => [cp, ...h.slice(0, 19)]);
        setBetPlaced(prev => {
          if (prev) toast.error(`💥 Crashed at ${cp}x! Bet lost.`);
          return false;
        });
        setTimeout(() => startCountdown(), 3000);
      }
    }, 100);
  };

  useEffect(() => {
    startCountdown();
    return () => clearInterval(intervalRef.current);
  }, [startCountdown]);

  const placeBet = () => {
    if (stake < 50) return toast.error('Minimum stake is ₦50');
    if (stake > user.balance) return toast.error('Insufficient balance');
    if (phase !== PHASES.WAITING) return toast.error('Wait for next round');
    updateBalance(-stake);
    setBetPlaced(true);
    toast.success(`Bet of ₦${stake.toLocaleString()} placed! 🎯`);
  };

  const cashOut = () => {
    if (!betPlaced || cashedOut || phase !== PHASES.FLYING) return;
    const winnings = +(stake * multiplier).toFixed(0);
    updateBalance(winnings);
    setCashedOut(true);
    setCashoutMultiplier(multiplier);
    setBetPlaced(false);
    toast.success(`💰 Cashed out at ${multiplier}x! Won ₦${winnings.toLocaleString()}`);
  };

  const getMultiplierColor = () => {
    if (phase === PHASES.CRASHED) return '#ff3333';
    if (multiplier < 2) return '#ffffff';
    if (multiplier < 5) return '#f5a623';
    return '#00e676';
  };

  const setQuickStake = (val) => setStake(Math.min(val, user.balance));

  return (
    <div className="play-page page-wrapper">
      <div className="play-layout">
        {/* LEFT: GAME */}
        <div className="game-section">
          {/* History bar */}
          <div className="history-bar">
            {history.map((h, i) => (
              <span key={i} className="hist-badge" style={{
                background: h < 2 ? 'rgba(255,51,51,0.15)' : h < 5 ? 'rgba(245,166,35,0.15)' : 'rgba(0,230,118,0.15)',
                color: h < 2 ? 'var(--accent-red)' : h < 5 ? 'var(--accent-gold)' : 'var(--accent-green)',
              }}>{h.toFixed(2)}x</span>
            ))}
          </div>

          {/* Game canvas */}
          <div className={`game-canvas ${phase === PHASES.CRASHED ? 'crashed' : ''}`}>
            <div className="canvas-grid" />

            {phase === PHASES.WAITING && (
              <div className="waiting-overlay">
                <p className="waiting-text">NEXT ROUND IN</p>
                <div className="countdown">{countdown}</div>
                <p className="waiting-sub">{betPlaced ? '✅ Bet Confirmed — Good luck!' : 'Place your bet below!'}</p>
              </div>
            )}

            {phase === PHASES.FLYING && (
              <div className="flying-plane-wrap">
                <Plane size={48} className="flying-plane" style={{color: 'var(--accent-red)'}} />
              </div>
            )}

            {phase === PHASES.CRASHED && (
              <div className="crashed-overlay">
                <p className="crashed-label">FLEW AWAY!</p>
                <div className="crashed-mult">{multiplier.toFixed(2)}x</div>
              </div>
            )}

            {(phase === PHASES.FLYING || phase === PHASES.CRASHED) && (
              <div className="big-multiplier" style={{color: getMultiplierColor()}}>
                {multiplier.toFixed(2)}x
              </div>
            )}

            {cashedOut && cashoutMultiplier && (
              <div className="cashout-banner">
                💰 CASHED OUT @ {cashoutMultiplier}x
              </div>
            )}
          </div>

          {/* Bet controls */}
          <div className="bet-controls card">
            <div className="bet-top">
              <div className="bet-input-wrap">
                <label>Stake Amount (₦)</label>
                <div className="quick-stakes">
                  {[50, 100, 500, 1000, 5000].map(v => (
                    <button key={v} onClick={() => setQuickStake(v)} className={`quick-btn ${stake === v ? 'active' : ''}`}>
                      {v >= 1000 ? `₦${v/1000}K` : `₦${v}`}
                    </button>
                  ))}
                </div>
                <input type="number" value={stake} min={50} max={user?.balance}
                  onChange={e => setStake(+e.target.value)} placeholder="Enter amount" />
              </div>
            </div>
            <div className="bet-actions">
              {!betPlaced ? (
                <button onClick={placeBet} className="btn-primary bet-btn" disabled={phase === PHASES.FLYING || phase === PHASES.CRASHED}>
                  {phase === PHASES.WAITING ? `Place Bet ₦${stake.toLocaleString()}` : 'Wait for next round...'}
                </button>
              ) : phase === PHASES.FLYING ? (
                <button onClick={cashOut} className="btn-green bet-btn cashout-btn">
                  💰 CASH OUT @ {multiplier.toFixed(2)}x<br/>
                  <small>+₦{(stake * multiplier).toFixed(0)}</small>
                </button>
              ) : (
                <button className="btn-primary bet-btn" disabled>
                  {phase === PHASES.CRASHED ? 'Round over...' : '✅ Bet Placed'}
                </button>
              )}
            </div>
            <div className="bet-info">
              <span>Balance: <strong style={{color:'var(--accent-green)'}}>₦{user?.balance?.toLocaleString()}</strong></span>
              <span>Min Stake: <strong>₦50</strong></span>
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE BETS */}
        <div className="live-panel card">
          <h3 className="live-title"><TrendingUp size={16} /> Live Bets</h3>
          <div className="live-list">
            {LIVE_BETS.map((b, i) => (
              <div key={i} className="live-item">
                <span className="live-user">{b.user}</span>
                <span className="live-bet">₦{b.bet.toLocaleString()}</span>
                <span className="live-status" style={{
                  color: phase === PHASES.CRASHED ? 'var(--accent-red)' :
                         phase === PHASES.FLYING ? 'var(--accent-gold)' : 'var(--text-muted)'
                }}>
                  {phase === PHASES.CRASHED ? `${(1 + Math.random() * 2).toFixed(2)}x` :
                   phase === PHASES.FLYING ? 'Flying...' : 'Waiting'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}