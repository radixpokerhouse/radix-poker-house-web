import { useState, useEffect } from 'react';
import { rdt, GENESIS_TABLE_COMPONENT, DEALER_URL, onSessionReady, onDebugLog, debugLog } from './radix.js';
import { getBadgeLocalId, startHand, commitAndReveal, fold, check, call as callAction, raise, showdown, getTableState } from './gameplay.js';
import {
  Hexagon, Plus, X, Users, ShieldCheck, ChevronRight, Sparkles,
  Lock, LogOut, Minus, TrendingUp, Smartphone, Fingerprint,
} from 'lucide-react';

const SUIT_GLYPH = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLOR = { s: 'text-slate-900', h: 'text-rose-500', d: 'text-rose-500', c: 'text-slate-900' };

const PlayingCard = ({ rank, suit, size = 'md', faceDown = false }) => {
  const sizes = {
    sm: { box: 'w-8 h-11', corner: 'text-[8px]', center: 'text-sm' },
    md: { box: 'w-11 h-15', corner: 'text-[10px]', center: 'text-lg' },
    lg: { box: 'w-20 h-28', corner: 'text-sm', center: 'text-4xl' },
  };
  const s = sizes[size];

  if (faceDown) {
    return (
      <div className={`${s.box} rounded-md bg-gradient-to-br from-[#1c2440] to-[#0a0f1c] border border-emerald-400/20 shadow-lg relative overflow-hidden shrink-0`}>
        <div
          className="absolute inset-0 opacity-25"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(52,211,153,0.5) 0px, rgba(52,211,153,0.5) 1.5px, transparent 1.5px, transparent 7px)' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Hexagon className="w-1/3 h-1/3 text-emerald-400/50" fill="currentColor" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${s.box} rounded-md bg-gradient-to-b from-white to-slate-100 shadow-lg relative shrink-0 border border-black/5 font-mono`}>
      <div className={`absolute top-1 left-1 flex flex-col items-center leading-none font-bold ${s.corner} ${SUIT_COLOR[suit]}`}>
        <span>{rank}</span>
        <span>{SUIT_GLYPH[suit]}</span>
      </div>
      <div className={`absolute bottom-1 right-1 flex flex-col items-center leading-none font-bold rotate-180 ${s.corner} ${SUIT_COLOR[suit]}`}>
        <span>{rank}</span>
        <span>{SUIT_GLYPH[suit]}</span>
      </div>
      <div className={`absolute inset-0 flex items-center justify-center ${s.center} ${SUIT_COLOR[suit]} opacity-70`}>
        {SUIT_GLYPH[suit]}
      </div>
    </div>
  );
};

const PokerChipIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M12 1.6v3.1M12 19.3v3.1M1.6 12h3.1M19.3 12h3.1M5.2 5.2l2.2 2.2M16.6 16.6l2.2 2.2M18.8 5.2l-2.2 2.2M7.4 16.6l-2.2 2.2"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const AVATAR_COLORS = [
  'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500',
  'bg-violet-500', 'bg-orange-500', 'bg-pink-500',
];

const Avatar = ({ index }) => {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div className={`w-10 h-10 rounded-full ${color}/15 border-2 border-white/10 flex items-center justify-center`}>
      <Fingerprint className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} strokeWidth={2} />
    </div>
  );
};

const ChipTag = ({ amount, tone = 'cyan' }) => {
  const tones = {
    cyan: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/25',
    green: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/25',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold font-mono ${tones[tone]}`}>
      ${amount}
    </span>
  );
};

const StatusPill = ({ live }) => (
  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide ${live ? 'bg-emerald-400/15 text-emerald-300' : 'bg-slate-500/15 text-slate-400'}`}>
    {live ? 'LIVE' : 'FULL'}
  </span>
);

const TABLES = [
  { id: 1, name: 'Archipelago Table', stakes: '0.01 – 0.1 XRD', seats: '5/9', live: true },
  { id: 2, name: 'Garuda Table', stakes: '0.1 – 1 XRD', seats: '9/9', live: false },
  { id: 3, name: 'Voyager Table', stakes: '1 – 5 XRD', seats: '3/6', live: true },
  { id: 4, name: 'Genesis Table', stakes: '0.01 – 0.05 XRD', seats: '2/9', live: true },
];

const BOTS = [
  { id: 1, name: '0x4F…a2c1', chips: 5800, seat: 'top-left' },
  { id: 2, name: 'anders.xrd', chips: 9200, seat: 'top' },
  { id: 3, name: '0x9C…e17f', chips: 3250, seat: 'top-right' },
  { id: 4, name: 'stakr_dev', chips: 6800, seat: 'right' },
  { id: 5, name: '0x2B…7fd3', chips: 7050, seat: 'bottom-right' },
  { id: 6, name: 'vaultan', chips: 2500, seat: 'bottom-left' },
  { id: 7, name: '0x71…d9e2', chips: 5500, seat: 'left' },
];

const SEAT_POS = {
  'top-left': 'top-[2%] left-[16%]',
  'top': 'top-[-4%] left-1/2 -translate-x-1/2',
  'top-right': 'top-[2%] right-[16%]',
  'right': 'top-[40%] right-[-1%]',
  'bottom-right': 'bottom-[12%] right-[16%]',
  'bottom-left': 'bottom-[12%] left-[16%]',
  'left': 'top-[40%] left-[-1%]',
};

function OrientationHint() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const check = () => {
      const isSmallPortrait = window.innerHeight > window.innerWidth && window.innerWidth < 500;
      setShow(isSmallPortrait);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  if (!show) return null;
  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur text-[10px] text-slate-300 border border-white/10">
      <Smartphone className="w-3 h-3 rotate-90" />
      Rotate for a roomier table view
    </div>
  );
}


const SUIT_MAP = ['s', 'h', 'd', 'c'];
const RANK_MAP = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
function toCardProps(card) {
  if (!card) return null;
  return { rank: RANK_MAP[card.rank] || String(card.rank), suit: SUIT_MAP[card.suit] };
}

export default function App() {
  const [screen, setScreen] = useState('lobby');
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    const subscription = rdt.walletApi.walletData$.subscribe((state) => {
      const account = state.accounts?.[0];
      setWalletAddress(account?.address || null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const [selectedTable, setSelectedTable] = useState(null);
  const [buyIn, setBuyIn] = useState(0.1);
  const [joinStatus, setJoinStatus] = useState('idle'); // idle | pending | error
  const [joinError, setJoinError] = useState(null);
  const [session, setSession] = useState(null); // { sessionToken, seat }
  const [wsStatus, setWsStatus] = useState('disconnected'); // disconnected | connecting | connected
  const [badgeLocalId, setBadgeLocalId] = useState(null);
  const [holeCards, setHoleCards] = useState(null);
  const [communityCards, setCommunityCards] = useState([]);
  const [actionStatus, setActionStatus] = useState('idle');
  const [showdownResult, setShowdownResult] = useState(null);

  useEffect(() => {
    onSessionReady((data) => {
      setSession(data);
      setWsStatus('connecting');
      const ws = new WebSocket(DEALER_URL.replace('https://', 'wss://').replace('http://', 'ws://'));
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'register', sessionToken: data.sessionToken }));
        setWsStatus('connected');
      };
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'hole_cards') {
          setHoleCards(msg.cards);
          setCommunityCards(msg.community || []);
        }
      };
      ws.onerror = () => setWsStatus('disconnected');
      ws.onclose = () => setWsStatus('disconnected');
    });
  }, []);

  useEffect(() => {
    if (walletAddress) {
      debugLog('Fetching badge for ' + walletAddress.slice(0, 20));
      getBadgeLocalId(walletAddress)
        .then((id) => {
          debugLog('Badge lookup result: ' + id);
          setBadgeLocalId(id);
        })
        .catch((e) => debugLog('Badge lookup FAILED: ' + e.message));
    }
  }, [walletAddress]);

  const [liveState, setLiveState] = useState(null);

  const refreshTableState = async () => {
    try {
      const state = await getTableState();
      setLiveState(state);
    } catch (e) {
      debugLog('Refresh table state failed: ' + e.message);
    }
  };

  const runAction = async (fn, { resetCards, isShowdown } = {}) => {
    setActionStatus('pending');
    try {
      await fn();
      if (resetCards) {
        setHoleCards(null);
        setCommunityCards([]);
        setShowdownResult(null);
      }
      if (isShowdown) {
        setShowdownResult('Showdown submitted — refresh in a few seconds to see the payout on-chain.');
      }
      await refreshTableState();
      setActionStatus('idle');
    } catch (e) {
      setActionStatus('error');
      setJoinError(e.message);
      setTimeout(() => setActionStatus('idle'), 3000);
    }
  };

  const [debugError, setDebugError] = useState(null);
  const [debugLogs, setDebugLogs] = useState([]);
  useEffect(() => {
    onDebugLog((msg) => setDebugLogs((logs) => [...logs.slice(-40), msg]));
  }, []);
  useEffect(() => {
    const onError = (event) => {
      setDebugError(`${event.message} (${event.filename}:${event.lineno})`);
    };
    const onRejection = (event) => {
      setDebugError(`Unhandled promise rejection: ${event.reason?.message || event.reason}`);
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);
  const [raiseAmt, setRaiseAmt] = useState(0.05);

  const XRD_RESOURCE_STOKENET = 'resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc';

  const handleJoinTable = async () => {
    if (!walletAddress) {
      setJoinStatus('error');
      setJoinError('Connect your wallet first.');
      return;
    }
    setJoinStatus('pending');
    setJoinError(null);

    const manifest = `
      CALL_METHOD
        Address("${walletAddress}")
        "withdraw"
        Address("${XRD_RESOURCE_STOKENET}")
        Decimal("${buyIn}")
      ;
      TAKE_ALL_FROM_WORKTOP
        Address("${XRD_RESOURCE_STOKENET}")
        Bucket("payment")
      ;
      CALL_METHOD
        Address("${GENESIS_TABLE_COMPONENT}")
        "join_table"
        Bucket("payment")
      ;
      CALL_METHOD
        Address("${walletAddress}")
        "deposit_batch"
        Expression("ENTIRE_WORKTOP")
      ;
    `;

    try {
      const result = await rdt.walletApi.sendTransaction({
        transactionManifest: manifest,
        version: 1,
      });

      console.log('sendTransaction result:', result);

      if (result.isErr()) {
        setJoinStatus('error');
        setJoinError(result.error?.message || JSON.stringify(result.error) || 'Transaction failed or was rejected.');
        return;
      }

      setJoinStatus('idle');
      setScreen('table');
    } catch (err) {
      console.error('handleJoinTable threw:', err);
      setJoinStatus('error');
      setJoinError(err?.message || 'Unexpected error sending transaction.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#05070D] p-4 font-sans">
      <div className="w-full max-w-[420px] h-[860px] rounded-[2.5rem] bg-[#0A0E1A] border border-white/10 overflow-hidden relative shadow-2xl flex flex-col">
        <OrientationHint />
        {debugError && (
          <div className="absolute top-10 left-2 right-2 z-50 bg-rose-950 border border-rose-500 rounded-lg p-2 text-[9px] text-rose-200 font-mono break-words">
            {debugError}
          </div>
        )}
        {debugLogs.length > 0 && (
          <button
            onClick={() => navigator.clipboard.writeText(debugLogs.join('\n'))}
            className="absolute top-10 right-2 z-50 bg-cyan-500 text-[#05070D] text-[10px] font-bold px-2 py-1 rounded-md"
          >
            Copy {debugLogs.length} logs
          </button>
        )}

        <div className="flex items-center justify-between px-6 pt-4 pb-2 text-[11px] text-slate-500 font-mono">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 rounded-sm bg-slate-600" />
            <div className="w-3 h-2 rounded-sm bg-slate-600" />
            <div className="w-4 h-2 rounded-sm bg-emerald-400" />
          </div>
        </div>

        {screen === 'lobby' && (
          <div className="flex-1 overflow-y-auto px-5 pb-6">
            <div className="flex items-center justify-between mt-2 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                  <Hexagon className="w-4.5 h-4.5 text-[#05070D]" strokeWidth={2.5} fill="currentColor" />
                </div>
                <div>
                  <div className="font-bold text-[15px] tracking-tight font-display">Radix Poker House</div>
                  <div className="text-[10px] text-slate-500 -mt-0.5">Stokenet · Non-custodial</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <radix-connect-button />
                {walletAddress && (
                  <span className="text-[9px] text-emerald-400 font-mono">{walletAddress.slice(0, 20)}...</span>
                )}
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0F1B2E] via-[#0C1522] to-[#101828] border border-white/10 p-5 mb-6">
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-emerald-400/10 blur-2xl" />
              <div className="relative flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[10px] font-semibold text-amber-300 tracking-wide">SHUFFLE PROVABLY FAIR</span>
              </div>
              <h1 className="relative text-xl font-bold leading-tight mb-1.5 font-display">
                Every card can be<br />audited by anyone.
              </h1>
              <p className="relative text-[12px] text-slate-400 mb-4 max-w-[220px]">
                Funds and shuffle results live in a Radix contract — not a promise, a provable fact.
              </p>
              <button className="relative flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-400 text-[#05070D] text-sm font-bold">
                Create Private Table <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-200 font-display">Active Tables</h2>
              <span className="text-[11px] text-slate-500">{TABLES.filter((t) => t.live).length} live now</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {TABLES.map((t) => (
                <div key={t.id} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3.5 flex items-center justify-between hover:border-emerald-400/30 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A2436] to-[#0F1622] border border-white/10 flex items-center justify-center">
                      <PokerChipIcon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold">{t.name}</span>
                        <StatusPill live={t.live} />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-500 font-mono">{t.stakes}</span>
                        <span className="flex items-center gap-0.5 text-[11px] text-slate-500">
                          <Users className="w-3 h-3" /> {t.seats}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (!t.live) return;
                      if (walletAddress) {
                        try {
                          const existing = await getBadgeLocalId(walletAddress);
                          if (existing) {
                            setBadgeLocalId(existing);
                            setScreen('table');
                            return;
                          }
                        } catch (e) {
                          debugLog('Pre-join badge check failed: ' + e.message);
                        }
                      }
                      setSelectedTable(t);
                      setScreen('join');
                    }}
                    disabled={!t.live}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${t.live ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-400/20' : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'}`}
                  >
                    {t.live ? 'Join' : 'Full'}
                  </button>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-600 text-center mt-6 leading-relaxed">
              All bets and card shuffles are verified on-chain via commit-reveal.<br />No hidden dealer.
            </p>
          </div>
        )}

        {screen === 'join' && selectedTable && (
          <div className="flex-1 flex flex-col justify-end">
            <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
              <div className="flex -space-x-4">
                <div className="rotate-[-8deg]">
                  <PlayingCard rank="A" suit="s" size="lg" faceDown />
                </div>
                <div className="rotate-[6deg]">
                  <PlayingCard rank="8" suit="h" size="lg" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold font-display">Join {selectedTable.name}</h2>
                <p className="text-xs text-slate-500 mt-1">Your stack: <span className="text-slate-300 font-semibold">1.284 XRD</span></p>
              </div>
            </div>

            <div className="bg-white/[0.03] border-t border-white/10 rounded-t-3xl px-6 pt-6 pb-8">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Buy-in amount</span>
                <button onClick={() => setScreen('lobby')} className="text-slate-500"><X className="w-4 h-4" /></button>
              </div>
              <div className="text-3xl font-bold mb-1 font-mono">{buyIn.toFixed(2)} XRD</div>
              <input
                type="range" min="0.01" max="1" step="0.01" value={buyIn}
                onChange={(e) => setBuyIn(+e.target.value)}
                className="w-full accent-emerald-400 mb-3"
              />
              <div className="flex gap-2 mb-4">
                {[0.05, 0.1, 0.5].map((v) => (
                  <button key={v} onClick={() => setBuyIn(v)} className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${buyIn === v ? 'bg-emerald-400 text-[#05070D] border-emerald-400' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                    {v} XRD
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white/[0.03] border border-white/[0.06] rounded-xl p-2.5 mb-4">
                <ShieldCheck className="w-4 h-4 text-cyan-300 shrink-0" />
                This transaction issues a session badge — no further wallet prompts until you leave the table.
              </div>
              <button
                onClick={handleJoinTable}
                disabled={joinStatus === 'pending'}
                className="w-full py-3 rounded-xl bg-emerald-400 text-[#05070D] font-bold text-sm disabled:opacity-50"
              >
                {joinStatus === 'pending' ? 'Waiting for wallet...' : 'Confirm & Sign'}
              </button>
              {joinStatus === 'error' && (
                <p className="text-[11px] text-rose-400 mt-2 text-center">{joinError}</p>
              )}
            </div>
          </div>
        )}

        {screen === 'table' && (
          <div className="flex-1 flex flex-col px-3 pb-3">
            <div className="flex items-center justify-between px-2 py-2">
              <button onClick={() => setScreen('lobby')} className="flex items-center gap-1 text-[11px] text-slate-500">
                <LogOut className="w-3.5 h-3.5" /> Leave
              </button>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${wsStatus === 'connected' ? 'bg-emerald-400/10 border-emerald-400/25' : 'bg-amber-400/10 border-amber-400/25'}`}>
                <Lock className={`w-3 h-3 ${wsStatus === 'connected' ? 'text-emerald-300' : 'text-amber-300'}`} />
                <span className={`text-[10px] font-semibold ${wsStatus === 'connected' ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {wsStatus === 'connected' ? `SEAT ${session?.seat} VERIFIED` : 'VERIFYING...'}
                </span>
              </div>
              <span className="text-xs font-mono">
                {liveState ? (liveState.handActive ? 'Hand Active' : 'Hand Over') : 'Loading...'}
              </span>
            </div>

            <div className="relative flex-1 rounded-[3rem] bg-gradient-to-b from-[#101c30] to-[#0a1220] border-2 border-white/[0.06] mt-3 mb-4 min-h-[380px]">
              {BOTS.map((b) => (
                <div key={b.id} className={`absolute ${SEAT_POS[b.seat]} flex flex-col items-center gap-1`}>
                  <div className="relative">
                    <Avatar index={b.id} />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a1220]" />
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">{b.name}</span>
                  <ChipTag amount={b.chips} />
                </div>
              ))}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="flex gap-1.5">
                  {communityCards.length > 0
                    ? communityCards.map((c, i) => <PlayingCard key={i} {...toCardProps(c)} size="sm" />)
                    : [0, 1, 2, 3, 4].map((i) => <PlayingCard key={i} faceDown size="sm" />)}
                </div>
                <span className="text-[9px] uppercase tracking-widest text-slate-600">
                  {communityCards.length > 0 ? 'Community Cards' : 'Waiting for showdown'}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 mb-3">
              <div className="flex gap-1.5">
                {holeCards
                  ? holeCards.map((c, i) => <PlayingCard key={i} {...toCardProps(c)} size="sm" />)
                  : [0, 1].map((i) => <PlayingCard key={i} faceDown size="sm" />)}
              </div>
              {showdownResult && (
                <p className="text-[10px] text-cyan-300 font-mono text-center max-w-[280px]">{showdownResult}</p>
              )}
            </div>

            <div className="flex gap-2 mb-2">
              <button
                disabled={actionStatus === 'pending'}
                onClick={() => runAction(() => startHand(), { resetCards: true })}
                className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-300 disabled:opacity-40"
              >
                Start Hand
              </button>
              <button
                disabled={actionStatus === 'pending' || !badgeLocalId}
                onClick={() => runAction(() => commitAndReveal(walletAddress, badgeLocalId))}
                className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-300 disabled:opacity-40"
              >
                Ready (Fair Shuffle)
              </button>
              <button
                disabled={actionStatus === 'pending'}
                onClick={() => runAction(() => showdown(), { isShowdown: true })}
                className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-300 disabled:opacity-40"
              >
                Showdown
              </button>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  {['Min', '1/2', 'Pot', 'Max'].map((l) => (
                    <button key={l} className="px-2.5 py-1.5 rounded-lg bg-white/5 text-[10px] text-slate-400 font-medium">{l}</button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setRaiseAmt((a) => Math.max(0.01, +(a - 0.01).toFixed(2)))} className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                  <span className="text-xs font-semibold w-16 text-center font-mono">{raiseAmt} XRD</span>
                  <button onClick={() => setRaiseAmt((a) => +(a + 0.01).toFixed(2))} className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={actionStatus === 'pending' || !badgeLocalId}
                  onClick={() => runAction(() => fold(walletAddress, badgeLocalId))}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500/90 text-xs font-bold disabled:opacity-40"
                >
                  Fold
                </button>
                <button
                  disabled={actionStatus === 'pending' || !badgeLocalId}
                  onClick={() => runAction(() => check(walletAddress, badgeLocalId))}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-bold disabled:opacity-40"
                >
                  Check
                </button>
                <button
                  disabled={actionStatus === 'pending' || !badgeLocalId}
                  onClick={() => runAction(() => callAction(walletAddress, badgeLocalId))}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-400/90 text-[#05070D] text-xs font-bold disabled:opacity-40"
                >
                  Call
                </button>
                <button
                  disabled={actionStatus === 'pending' || !badgeLocalId}
                  onClick={() => runAction(() => raise(walletAddress, badgeLocalId, raiseAmt))}
                  className="flex-[1.3] py-2.5 rounded-xl bg-emerald-400 text-[#05070D] text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-40"
                >
                  <TrendingUp className="w-3.5 h-3.5" /> Raise
                </button>
              </div>
              {actionStatus === 'error' && (
                <p className="text-[10px] text-rose-400 text-center">{joinError}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
