import { Link } from 'react-router-dom';
import { Plane, TrendingUp, Shield, Zap, Users, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

const RECENT_WINS = [
  { user: 'Ola***', amount: '₦45,200', multiplier: '12.5x' },
  { user: 'Chi***', amount: '₦18,900', multiplier: '6.3x' },
  { user: 'Ade***', amount: '₦92,000', multiplier: '23.0x' },
  { user: 'Emy***', amount: '₦7,500', multiplier: '2.5x' },
  { user: 'Bam***', amount: '₦120,000', multiplier: '30.0x' },
  { user: 'Tun***', amount: '₦33,000', multiplier: '8.2x' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home page-wrapper">
      {/* TICKER */}
      <div className="ticker-bar">
        <div className="ticker-track">
          {RECENT_WINS.concat(RECENT_WINS).map((w, i) => (
            <span key={i} className="ticker-item">
              🎉 <strong>{w.user}</strong> won <strong>{w.amount}</strong> at <strong style={{color:'var(--accent-red)'}}>{w.multiplier}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-glow" />
        <div className="hero-content">
          <div className="hero-badge">🔴 LIVE NOW • 2,841 PLAYERS</div>
          <h1 className="hero-title">
            WATCH IT FLY.<br />
            <span className="hero-accent">CASH OUT IN TIME.</span>
          </h1>
          <p className="hero-sub">
            Nigeria's most thrilling crash game. Stake your bet, watch the multiplier soar, and cash out before it crashes. Instant deposits & withdrawals.
          </p>
          <div className="hero-cta">
            {user ? (
              <Link to="/play" className="btn-primary hero-btn">🚀 Play Now</Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary hero-btn">Get Started Free</Link>
                <Link to="/login" className="btn-outline hero-btn">Login</Link>
              </>
            )}
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-val">₦2.4B+</span><span className="stat-label">Total Paid Out</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-val">142K+</span><span className="stat-label">Active Players</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-val">1,000x</span><span className="stat-label">Max Multiplier</span></div>
          </div>
        </div>
        <div className="hero-plane">
          <div className="plane-trail" />
          <Plane size={80} className="big-plane" />
          <div className="multiplier-bubble">12.5x</div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section container">
        <h2 className="section-title">HOW IT WORKS</h2>
        <div className="how-grid">
          {[
            { icon: '1', title: 'Register & Deposit', desc: 'Create your account and fund it instantly via Paystack or Flutterwave.', color: 'var(--accent-blue)' },
            { icon: '2', title: 'Place Your Bet', desc: 'Choose your stake amount before the round begins.', color: 'var(--accent-gold)' },
            { icon: '3', title: 'Watch the Plane', desc: 'The multiplier climbs from 1.0x — the longer it flies, the bigger your win.', color: 'var(--accent-red)' },
            { icon: '4', title: 'Cash Out!', desc: 'Hit CASH OUT at any time. Wait too long and it crashes — you lose your bet.', color: 'var(--accent-green)' },
          ].map((s, i) => (
            <div key={i} className="how-card card">
              <div className="how-num" style={{color: s.color}}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section container">
        <h2 className="section-title">WHY AVIATOR PRO</h2>
        <div className="features-grid">
          {[
            { icon: <Zap size={24}/>, title: 'Instant Cashout', desc: 'Funds hit your wallet in seconds.' },
            { icon: <Shield size={24}/>, title: 'Provably Fair', desc: 'Every round is cryptographically verified.' },
            { icon: <TrendingUp size={24}/>, title: 'High Multipliers', desc: 'Win up to 1,000x your stake.' },
            { icon: <Users size={24}/>, title: 'Live Community', desc: 'See other players bets in real time.' },
            { icon: <Award size={24}/>, title: 'Daily Bonuses', desc: 'Login daily for free bonus credits.' },
            { icon: <Plane size={24}/>, title: '24/7 Games', desc: 'Rounds run non-stop around the clock.' },
          ].map((f, i) => (
            <div key={i} className="feature-card card">
              <div className="feature-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RECENT WINS TABLE */}
      <section className="wins-section container">
        <h2 className="section-title">🔥 RECENT BIG WINS</h2>
        <div className="wins-table card">
          <div className="wins-head">
            <span>Player</span><span>Bet</span><span>Multiplier</span><span>Won</span>
          </div>
          {RECENT_WINS.map((w, i) => (
            <div key={i} className="wins-row">
              <span>{w.user}</span>
              <span>₦1,000</span>
              <span className="mult-badge" style={{color: parseFloat(w.multiplier)>10 ? 'var(--accent-red)' : 'var(--accent-green)'}}>
                {w.multiplier}
              </span>
              <span className="win-amount">{w.amount}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}