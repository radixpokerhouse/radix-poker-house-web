import { useState, useEffect } from 'react';
import './radix.js';
import {
  Flame, Plus, X, Users, ShieldCheck, ChevronRight, Sparkles,
  Lock, LogOut, Minus, TrendingUp, Smartphone, Spade, CircleUserRound,
} from 'lucide-react';

const CardMini = ({ rank, suit, color }) => (
  <div className="w-8 h-11 rounded-md bg-[#F4F6FA] flex flex-col items-center justify-center shadow-md shrink-0 font-mono">
    <span className={`text-xs font-semibold ${color}`}>{rank}</span>
    <span className={`text-sm ${color}`}>{suit}</span>
  </div>
);

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


const AVATAR_COLORS = [
  'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500',
  'bg-violet-500', 'bg-orange-500', 'bg-pink-500',
];

const Avatar = ({ index }) => {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div className={`w-10 h-10 rounded-full ${color}/15 border-2 border-white/10 flex items-center justify-center`}>
      <CircleUserRound className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} strokeWidth={2} />
    </div>
  );
};
};

const TABLES = [
  { id: 1, name: 'Archipelago Table', stakes: '0.01 – 0.1 XRD', seats: '5/9', live: true },
  { id: 2, name: 'Garuda Table', stakes: '0.1 – 1 XRD', seats: '9/9', live: false },
  { id: 3, name: 'Voyager Table', stakes: '1 – 5 XRD', seats: '3/6', live: true },
  { id: 4, name: 'Genesis Table', stakes: '0.01 – 0.05 XRD', seats: '2/9', live: true },
];

const BOTS = [
  { id: 1, name: '0x4F…a2c1', avatar: '🦊', chips: 5800, seat: 'top-left' },
  { id: 2, name: 'anders.xrd', avatar: '🐯', chips: 9200, seat: 'top' },
  { id: 3, name: '0x9C…e17f', avatar: '🐺', chips: 3250, seat: 'top-right' },
  { id: 4, name: 'stakr_dev', avatar: '🦁', chips: 6800, seat: 'right' },
  { id: 5, name: '0x2B…7fd3', avatar: '🐢', chips: 7050, seat: 'bottom-right' },
  { id: 6, name: 'vaultan', avatar: '🦅', chips: 2500, seat: 'bottom-left' },
  { id: 7, name: '0x71…d9e2', avatar: '🐸', chips: 5500, seat: 'left' },
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

export default function App() {
  const [screen, setScreen] = useState('lobby');
  const [selectedTable, setSelectedTable] = useState(null);
  const [buyIn, setBuyIn] = useState(150);
  const [raiseAmt, setRaiseAmt] = useState(550);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#05070D] p-4 font-sans">
      <div className="w-full max-w-[420px] h-[860px] rounded-[2.5rem] bg-[#0A0E1A] border border-white/10 overflow-hidden relative shadow-2xl flex flex-col">
        <OrientationHint />

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
                  <Flame className="w-4.5 h-4.5 text-[#05070D]" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="font-bold text-[15px] tracking-tight font-display">Radix Poker House</div>
                  <div className="text-[10px] text-slate-500 -mt-0.5">Stokenet · Non-custodial</div>
                </div>
              </div>
              {/* Real wallet connect button, provided by the Radix dApp Toolkit */}
              <radix-connect-button />
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
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A2436] to-[#0F1622] border border-white/10 flex items-center justify-center text-base">
                      <Spade className="w-4 h-4 text-emerald-400" />
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
                    onClick={() => { if (t.live) { setSelectedTable(t); setScreen('join'); } }}
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
              <div className="flex -space-x-3">
                <div className="w-16 h-24 rounded-lg bg-[#F4F6FA] rotate-[-8deg] shadow-xl" />
                <div className="w-16 h-24 rounded-lg bg-[#F4F6FA] rotate-[6deg] shadow-xl flex items-center justify-center text-3xl font-bold text-rose-500 font-display">8</div>
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
              <div className="text-3xl font-bold mb-1 font-mono">${buyIn}</div>
              <input
                type="range" min="100" max="200" value={buyIn}
                onChange={(e) => setBuyIn(+e.target.value)}
                className="w-full accent-emerald-400 mb-3"
              />
              <div className="flex gap-2 mb-4">
                {[100, 150, 200].map((v) => (
                  <button key={v} onClick={() => setBuyIn(v)} className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${buyIn === v ? 'bg-emerald-400 text-[#05070D] border-emerald-400' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                    ${v}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white/[0.03] border border-white/[0.06] rounded-xl p-2.5 mb-4">
                <ShieldCheck className="w-4 h-4 text-cyan-300 shrink-0" />
                This transaction issues a session badge — no further wallet prompts until you leave the table.
              </div>
              <button
                onClick={() => setScreen('table')}
                className="w-full py-3 rounded-xl bg-emerald-400 text-[#05070D] font-bold text-sm"
              >
                Confirm &amp; Sign
              </button>
            </div>
          </div>
        )}

        {screen === 'table' && (
          <div className="flex-1 flex flex-col px-3 pb-3">
            <div className="flex items-center justify-between px-2 py-2">
              <button onClick={() => setScreen('lobby')} className="flex items-center gap-1 text-[11px] text-slate-500">
                <LogOut className="w-3.5 h-3.5" /> Leave
              </button>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/25">
                <Lock className="w-3 h-3 text-emerald-300" />
                <span className="text-[10px] font-semibold text-emerald-300">BADGE ACTIVE</span>
              </div>
              <span className="text-xs font-mono">
                Pot <span className="text-cyan-300 font-semibold">$1,500.22</span>
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
                  <CardMini rank="A" suit="♦" color="text-rose-500" />
                  <CardMini rank="Q" suit="♣" color="text-slate-800" />
                  <CardMini rank="8" suit="♥" color="text-rose-500" />
                  <CardMini rank="J" suit="♦" color="text-rose-500" />
                  <CardMini rank="10" suit="♣" color="text-slate-800" />
                </div>
                <span className="text-[9px] uppercase tracking-widest text-slate-600">River</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 mb-3">
              <div className="flex gap-1.5">
                <CardMini rank="K" suit="♠" color="text-slate-800" />
                <CardMini rank="K" suit="♥" color="text-rose-500" />
              </div>
              <ChipTag amount="12,549" tone="green" />
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  {['Min', '1/2', 'Pot', 'Max'].map((l) => (
                    <button key={l} className="px-2.5 py-1.5 rounded-lg bg-white/5 text-[10px] text-slate-400 font-medium">{l}</button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setRaiseAmt((a) => Math.max(50, a - 50))} className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                  <span className="text-xs font-semibold w-12 text-center font-mono">${raiseAmt}</span>
                  <button onClick={() => setRaiseAmt((a) => a + 50)} className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex-1 py-2.5 rounded-xl bg-rose-500/90 text-xs font-bold">Fold</button>
                <button className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-bold">Check</button>
                <button className="flex-1 py-2.5 rounded-xl bg-cyan-400/90 text-[#05070D] text-xs font-bold">Call $100</button>
                <button className="flex-[1.3] py-2.5 rounded-xl bg-emerald-400 text-[#05070D] text-xs font-bold flex items-center justify-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Raise
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
