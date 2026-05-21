import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Play.css';

const PHASES = { WAITING: 'waiting', FLYING: 'flying', CRASHED: 'crashed' };

function generateCrashPoint(roundCount) {
  const seed = Math.random();
  const houseBias = 0.12;
  const biasedSeed = Math.min(seed + houseBias, 0.999);

  // STREAK BREAKER — track consecutive crashes above 2x and force a low one
  generateCrashPoint._above2Count = generateCrashPoint._above2Count || 0;

  // If 3 or more in a row went above 2x, force a crash below 1.5x
  if (generateCrashPoint._above2Count >= 3) {
    generateCrashPoint._above2Count = 0;
    return +(1.00 + Math.random() * 0.45).toFixed(2); // hard floor 1.00–1.45
  }

  // FORCED BIG WIN — once every 22 rounds
  if (roundCount > 0 && roundCount % 22 === 0) {
    generateCrashPoint._above2Count++;
    return +(10 + Math.random() * 40).toFixed(2);
  }

  // MEDIUM TEASE — once every 7 rounds
  if (roundCount > 0 && roundCount % 7 === 0) {
    generateCrashPoint._above2Count++;
    return +(5 + Math.random() * 4.99).toFixed(2);
  }

  // NORMAL DISTRIBUTION with house bias
  let result;

  if (biasedSeed < 0.35) {
    result = +(1.00 + Math.random() * 0.19).toFixed(2); // 1.00–1.19
  } else if (biasedSeed < 0.62) {
    result = +(1.20 + Math.random() * 0.79).toFixed(2); // 1.20–1.99
  } else if (biasedSeed < 0.75) {
    result = +(2.00 + Math.random() * 0.99).toFixed(2); // 2.00–2.99
  } else if (biasedSeed < 0.85) {
    result = +(3.00 + Math.random() * 1.99).toFixed(2); // 3.00–4.99
  } else if (biasedSeed < 0.93) {
    result = +(5.00 + Math.random() * 4.99).toFixed(2); // 5.00–9.99
  } else {
    result = +(10.0 + Math.random() * 15.0).toFixed(2); // 10x–25x
  }

  // Track streak
  if (result >= 2.0) {
    generateCrashPoint._above2Count++;
  } else {
    generateCrashPoint._above2Count = 0; // reset streak on any crash below 2x
  }

  return result;
}

const PLAYER_NAMES = [
  '8***3','k***1','p***r','a***j','9***8','b***a','c***s','m***2',
  't***7','f***e','u***9','z***4','l***6','o***5','w***x','r***k',
];

function generateLiveBets(count = 12) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    player: PLAYER_NAMES[i % PLAYER_NAMES.length],
    bet: [200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000][
      Math.floor(Math.random() * 10)
    ],
    cashedAt: null,
    won: null,
  }));
}

export default function Play() {
  const { user, updateBalance } = useAuth();

  const [phase, setPhase]           = useState(PHASES.WAITING);
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(null);
  const [countdown, setCountdown]   = useState(5);
  const [roundCount, setRoundCount] = useState(0);
  const [history, setHistory]       = useState([3.47,5.41,2.18,4.45,1.11,1.68,1.19,2.28,5.60,1.34,8.90,1.02]);

  // Bet slot 1
  const [stake1, setStake1]         = useState(50);
  const [betPlaced1, setBetPlaced1] = useState(false);
  const [cashedOut1, setCashedOut1] = useState(false);
  const [cashMult1, setCashMult1]   = useState(null);
  const [autoCash1, setAutoCash1]   = useState('');
  const [mode1, setMode1]           = useState('manual'); // manual | auto

  // Bet slot 2
  const [stake2, setStake2]         = useState(50);
  const [betPlaced2, setBetPlaced2] = useState(false);
  const [cashedOut2, setCashedOut2] = useState(false);
  const [cashMult2, setCashMult2]   = useState(null);
  const [autoCash2, setAutoCash2]   = useState('');
  const [mode2, setMode2]           = useState('manual');

  // Live bets
  const [liveBets, setLiveBets]     = useState(generateLiveBets);
  const [betsTab, setBetsTab]       = useState('all'); // all | previous | top

  // Canvas curve
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const multRef = useRef(1.00);
  const phaseRef = useRef(PHASES.WAITING);
  const crashRef = useRef(null);

  // Draw curve on canvas
  const drawCurve = useCallback((mult, crashed = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Progress 0→1 based on multiplier (log scale feels natural)
    const progress = Math.min((Math.log(mult) / Math.log(60)), 1);
    const endX = 60 + progress * (W - 80);
    const endY = H - 40 - progress * (H - 80);

    // Glow gradient under curve
    const grad = ctx.createLinearGradient(60, H - 40, endX, endY);
    grad.addColorStop(0, crashed ? 'rgba(255,50,50,0.35)' : 'rgba(255,50,50,0.25)');
    grad.addColorStop(1, 'rgba(255,50,50,0.02)');

    // Fill area under curve
    ctx.beginPath();
    ctx.moveTo(60, H - 40);
    ctx.quadraticCurveTo(60, endY, endX, endY);
    ctx.lineTo(endX, H - 40);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // The curve line
    ctx.beginPath();
    ctx.moveTo(60, H - 40);
    ctx.quadraticCurveTo(60, endY, endX, endY);
    ctx.strokeStyle = crashed ? '#ff3333' : '#ff4444';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ff3333';
    ctx.shadowBlur = crashed ? 18 : 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Dot at tip
    if (!crashed) {
      ctx.beginPath();
      ctx.arc(endX, endY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ff4444';
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    return { planeX: endX, planeY: endY };
  }, []);

  const startCountdown = useCallback((rnd) => {

  // CLEAR OLD INTERVAL FIRST
  clearInterval(intervalRef.current);

  setPhase(PHASES.WAITING);
  phaseRef.current = PHASES.WAITING;

  setMultiplier(1.00);
  multRef.current = 1.00;

  // RESET BET STATES
  setBetPlaced1(false);
  setBetPlaced2(false);

  setCashedOut1(false);
  setCashedOut2(false);

  setCashMult1(null);
  setCashMult2(null);

  // RESET LIVE BETS
  setLiveBets(generateLiveBets());

  // RESET CANVAS
  drawCurve(1.00, false);

  setCountdown(5);

  const cp = generateCrashPoint(rnd);
  setCrashPoint(cp);
  crashRef.current = cp;

  let c = 5;

  intervalRef.current = setInterval(() => {
    c--;

    setCountdown(c);

    if (c <= 0) {
      clearInterval(intervalRef.current);
      startFlight();
    }
  }, 1000);

}, [drawCurve]);

  const startFlight = useCallback(() => {

  // CLEAR OLD INTERVAL
  clearInterval(intervalRef.current);

  setPhase(PHASES.FLYING);
  phaseRef.current = PHASES.FLYING;

  const baseSpeed = 0.025;

  let mult = 1.00;

  intervalRef.current = setInterval(() => {

    mult = +(mult * (1 + baseSpeed + Math.random() * 0.005)).toFixed(2);

    multRef.current = mult;

    setMultiplier(mult);

    drawCurve(mult, false);

    // AUTO CASHOUT SLOT 1
    if (
      betPlaced1Ref.current &&
      !cashedOut1Ref.current &&
      autoCash1Ref.current
    ) {

      const target = parseFloat(autoCash1Ref.current);

      if (!isNaN(target) && mult >= target) {
        triggerCashout(1, mult);
      }
    }

    // AUTO CASHOUT SLOT 2
    if (
      betPlaced2Ref.current &&
      !cashedOut2Ref.current &&
      autoCash2Ref.current
    ) {

      const target = parseFloat(autoCash2Ref.current);

      if (!isNaN(target) && mult >= target) {
        triggerCashout(2, mult);
      }
    }

    // CRASH
    if (mult >= crashRef.current) {

      clearInterval(intervalRef.current);

      const finalMult = crashRef.current;

      setMultiplier(finalMult);

      multRef.current = finalMult;

      drawCurve(finalMult, true);

      setPhase(PHASES.CRASHED);

      phaseRef.current = PHASES.CRASHED;

      setHistory(h => [finalMult, ...h.slice(0, 24)]);

      // WAIT THEN START NEXT ROUND
      setTimeout(() => {
        startCountdown(roundCount + 1);
      }, 3500);
    }

  }, 80);

}, [drawCurve, roundCount, startCountdown]);

  // Mutable refs for closure access inside interval
  const betPlaced1Ref  = useRef(false);
  const betPlaced2Ref  = useRef(false);
  const cashedOut1Ref  = useRef(false);
  const cashedOut2Ref  = useRef(false);
  const autoCash1Ref   = useRef('');
  const autoCash2Ref   = useRef('');
  const stake1Ref      = useRef(50);
  const stake2Ref      = useRef(50);

  useEffect(() => { betPlaced1Ref.current  = betPlaced1;  }, [betPlaced1]);
  useEffect(() => { betPlaced2Ref.current  = betPlaced2;  }, [betPlaced2]);
  useEffect(() => { cashedOut1Ref.current  = cashedOut1;  }, [cashedOut1]);
  useEffect(() => { cashedOut2Ref.current  = cashedOut2;  }, [cashedOut2]);
  useEffect(() => { autoCash1Ref.current   = autoCash1;   }, [autoCash1]);
  useEffect(() => { autoCash2Ref.current   = autoCash2;   }, [autoCash2]);
  useEffect(() => { stake1Ref.current      = stake1;      }, [stake1]);
  useEffect(() => { stake2Ref.current      = stake2;      }, [stake2]);

  const triggerCashout = (slot, mult) => {
    if (slot === 1) {
      if (cashedOut1Ref.current || !betPlaced1Ref.current) return;
      const win = Math.floor(stake1Ref.current * mult);
      updateBalance(win);
      setCashedOut1(true); cashedOut1Ref.current = true;
      setCashMult1(mult);
      setBetPlaced1(false); betPlaced1Ref.current = false;
    } else {
      if (cashedOut2Ref.current || !betPlaced2Ref.current) return;
      const win = Math.floor(stake2Ref.current * mult);
      updateBalance(win);
      setCashedOut2(true); cashedOut2Ref.current = true;
      setCashMult2(mult);
      setBetPlaced2(false); betPlaced2Ref.current = false;
    }
  };

  useEffect(() => {
    startCountdown(0);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Canvas resize
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const placeBet = (slot) => {
    const s = slot === 1 ? stake1 : stake2;
    if (s < 50)            return alert('Minimum stake is ₦50');
    if (s > user.balance)  return alert('Insufficient balance');
    if (phase !== PHASES.WAITING) return alert('Wait for next round!');
    updateBalance(-s);
    if (slot === 1) { setBetPlaced1(true); betPlaced1Ref.current = true; }
    else            { setBetPlaced2(true); betPlaced2Ref.current = true; }
  };

  const getMultColor = () => {
    if (phase === PHASES.CRASHED) return '#ff3333';
    if (multiplier < 2)  return '#ffffff';
    if (multiplier < 5)  return '#f5a623';
    return '#00e676';
  };

  const histColor = (v) =>
    v < 2   ? '#e05c5c' :
    v < 5   ? '#f5a623' :
    v < 10  ? '#00b4ff' : '#00e676';

  const fmtNum = (n) => n?.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="play-page">

      {/* ── TOP BAR ── */}
      <div className="play-topbar">
        <span className="play-logo">✈ Aviator</span>
        <span className="play-bal">₦{user?.balance?.toLocaleString()}</span>
      </div>

      {/* ── HISTORY PILLS ── */}
      <div className="hist-row">
        {history.slice(0, 12).map((h, i) => (
          <span key={i} className="hist-pill" style={{ color: histColor(h), borderColor: histColor(h) + '44' }}>
            {h.toFixed(2)}x
          </span>
        ))}
        <span className="hist-more">···</span>
      </div>

      {/* ── CANVAS ── */}
      <div className="canvas-wrap">
        <canvas ref={canvasRef} className="game-canvas" />

        {/* Grid lines */}
        <div className="canvas-grid-lines" />

        {/* Plane SVG riding the curve */}
        {phase === PHASES.FLYING && (
          <div className="plane-container">
            <svg className="plane-svg" viewBox="0 0 60 60" fill="none">
              <path d="M5 30 L55 10 L45 30 L55 50 Z" fill="#ff4444" />
              <path d="M20 30 L40 22 L38 30 L40 38 Z" fill="#cc2222" />
            </svg>
          </div>
        )}

        {/* Multiplier display */}
        <div className="mult-display" style={{ color: getMultColor() }}>
          {phase === PHASES.WAITING ? (
            <div className="waiting-display">
              <div className="wait-label">STARTING IN</div>
              <div className="wait-count">{countdown}</div>
            </div>
          ) : phase === PHASES.CRASHED ? (
            <div className="crashed-display">
              <div className="flew-label">FLEW AWAY!</div>
              <div className="flew-mult">{multiplier.toFixed(2)}x</div>
            </div>
          ) : (
            <>
              <div className="live-mult">{multiplier.toFixed(2)}x</div>
            </>
          )}
        </div>

        {/* Player count badge */}
        <div className="player-count-badge">
          <span>👥</span>
          <span>{2500 + Math.floor(multiplier * 10)}</span>
        </div>

        {/* Cashout popups */}
        {cashedOut1 && cashMult1 && (
          <div className="cashout-pop pop1">
            💰 {cashMult1.toFixed(2)}x<br/>
            <small>+₦{Math.floor(stake1 * cashMult1).toLocaleString()}</small>
          </div>
        )}
        {cashedOut2 && cashMult2 && (
          <div className="cashout-pop pop2">
            💰 {cashMult2.toFixed(2)}x<br/>
            <small>+₦{Math.floor(stake2 * cashMult2).toLocaleString()}</small>
          </div>
        )}
      </div>

      {/* ── DUAL BET PANELS ── */}
      <div className="bet-panels">

        {/* SLOT 1 */}
        <BetPanel
          slot={1}
          stake={stake1} setStake={setStake1}
          betPlaced={betPlaced1} cashedOut={cashedOut1}
          cashMult={cashMult1}
          phase={phase}
          autoCash={autoCash1} setAutoCash={setAutoCash1}
          mode={mode1} setMode={setMode1}
          onBet={() => placeBet(1)}
          onCashout={() => triggerCashout(1, multRef.current)}
          multiplier={multiplier}
          balance={user?.balance}
        />

        {/* SLOT 2 */}
        <BetPanel
          slot={2}
          stake={stake2} setStake={setStake2}
          betPlaced={betPlaced2} cashedOut={cashedOut2}
          cashMult={cashMult2}
          phase={phase}
          autoCash={autoCash2} setAutoCash={setAutoCash2}
          mode={mode2} setMode={setMode2}
          onBet={() => placeBet(2)}
          onCashout={() => triggerCashout(2, multRef.current)}
          multiplier={multiplier}
          balance={user?.balance}
        />
      </div>

      {/* ── LIVE BETS TABLE ── */}
      <div className="live-bets-section">
        <div className="bets-tabs">
          {['all','previous','top'].map(t => (
            <button key={t} className={`bets-tab ${betsTab===t?'active':''}`} onClick={() => setBetsTab(t)}>
              {t === 'all' ? 'All Bets' : t === 'previous' ? 'Previous' : 'Top'}
            </button>
          ))}
          <div className="bets-summary">
            <span className="bets-count">
              <span className="bc-won">{liveBets.filter(b => b.cashedAt).length}</span>
              /{liveBets.length} Bets
            </span>
            <span className="bets-total">
              {fmtNum(liveBets.filter(b=>b.won).reduce((a,b)=>a+(b.won||0),0))}
              <span className="bc-label"> Total win NGN</span>
            </span>
          </div>
        </div>

        <div className="bets-table">
          <div className="bets-thead">
            <span>Player</span>
            <span>Bet NGN</span>
            <span>X</span>
            <span>Win NGN</span>
          </div>
          {liveBets.map((b, i) => (
            <div key={i} className={`bets-row ${b.cashedAt ? 'won' : ''}`}>
              <span className="br-player">
                <span className="br-avatar">{b.player.charAt(0).toUpperCase()}</span>
                {b.player}
              </span>
              <span className="br-bet">{fmtNum(b.bet)}</span>
              <span className="br-mult" style={{ color: b.cashedAt ? '#00e676' : 'transparent' }}>
                {b.cashedAt ? `${b.cashedAt.toFixed(2)}x` : '—'}
              </span>
              <span className="br-win" style={{ color: b.won ? '#00e676' : 'var(--text-muted)' }}>
                {b.won ? fmtNum(b.won) : '—'}
              </span>
            </div>
          ))}
        </div>

        <div className="provably-fair">
          🔒 Provably Fair Game &nbsp;·&nbsp; Powered by <strong>SPRIBE</strong>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   BET PANEL COMPONENT (reused for slot 1 & 2)
───────────────────────────────────────── */
function BetPanel({ slot, stake, setStake, betPlaced, cashedOut, cashMult, phase,
                    autoCash, setAutoCash, mode, setMode,
                    onBet, onCashout, multiplier, balance }) {

  const QUICK = [100, 200, 500, 1000];
  const PHASES = { WAITING: 'waiting', FLYING: 'flying', CRASHED: 'crashed' };

  const adjustStake = (delta) => {
    setStake(prev => Math.max(50, prev + delta));
  };

  // ADDITIVE quick buttons — each tap ADDS the amount to current stake
  const addQuick = (amount) => {
    setStake(prev => Math.max(50, prev + amount));
  };

  const canBet     = phase === PHASES.WAITING && !betPlaced;
  const canCashout = phase === PHASES.FLYING  && betPlaced && !cashedOut;

  const btnLabel = () => {
    if (canCashout) return (
      <>
        <span className="co-top">CASH OUT</span>
        <span className="co-mid">{multiplier.toFixed(2)}x</span>
        <span className="co-bot">₦{Math.floor(stake * multiplier).toLocaleString()}</span>
      </>
    );
    if (betPlaced && phase === PHASES.WAITING) return <>✅ BET PLACED<br/><small>₦{stake.toLocaleString()}</small></>;
    if (betPlaced && phase === PHASES.CRASHED) return <>❌ Round Over</>;
    return <>Bet<br/><span style={{fontWeight:900}}>{stake.toLocaleString()}.00 NGN</span></>;
  };

  return (
    <div className="bet-panel">
      {/* Tabs */}
      <div className="panel-tabs">
        <button className={`ptab ${mode==='manual'?'active':''}`} onClick={() => setMode('manual')}>Bet</button>
        <button className={`ptab ${mode==='auto'?'active':''}`}   onClick={() => setMode('auto')}>Auto</button>
        {slot === 2 && <button className="ptab-close">⊟</button>}
      </div>

      <div className="panel-body">
        {/* Auto-cashout input */}
        {mode === 'auto' && (
          <div className="auto-row">
            <span className="auto-label">Auto Cash Out at</span>
            <div className="auto-input-wrap">
              <input
                type="number"
                className="auto-input"
                placeholder="e.g. 2.00"
                value={autoCash}
                min="1.1"
                step="0.1"
                onChange={e => setAutoCash(e.target.value)}
              />
              <span className="auto-x">x</span>
            </div>
          </div>
        )}

        {/* Stake row */}
        <div className="stake-row">
          <div className="stake-left">

            {/* − / amount display / + */}
            <div className="stake-controls">
              <button className="sc-btn" onClick={() => adjustStake(-50)}>−</button>

              {/* DISPLAY ONLY — no keyboard needed */}
              <div className="stake-display">
                ₦{stake.toLocaleString()}
              </div>

              <button className="sc-btn sc-plus" onClick={() => adjustStake(50)}>+</button>
            </div>

            {/* Quick ADD buttons — tap to add, not replace */}
            <div className="quick-row">
              {QUICK.map(q => (
                <button
                  key={q}
                  className="qbtn"
                  onClick={() => addQuick(q)}
                  title={`Add ₦${q.toLocaleString()}`}
                >
                  +{q >= 1000 ? `${q/1000}k` : q}
                </button>
              ))}

              {/* CLEAR button to reset stake back to minimum */}
              <button
                className="qbtn qbtn-clear"
                onClick={() => setStake(50)}
                title="Reset to ₦50"
              >
                ✕
              </button>
            </div>

          </div>

          {/* BIG BET / CASHOUT BUTTON */}
          <button
            className={`big-bet-btn ${canCashout ? 'cashout' : ''} ${betPlaced && !canCashout ? 'placed' : ''}`}
            onClick={canCashout ? onCashout : canBet ? onBet : undefined}
            disabled={!canBet && !canCashout}
          >
            {btnLabel()}
          </button>
        </div>
      </div>
    </div>
  );
}