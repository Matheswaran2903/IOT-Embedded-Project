import type { Visual } from '../../data/experiments';

function Led({ v }: { v: Extract<Visual, { kind: 'led' }> }) {
  const lvl = v.on ? Math.max(0.12, v.level) : 0;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="h-14 w-14 rounded-full border-2 border-white/30 transition-all duration-100"
        style={{ background: v.on ? v.color : '#1f1b3a', opacity: v.on ? 0.25 + 0.75 * lvl : 1, boxShadow: v.on ? `0 0 ${10 + 40 * lvl}px ${v.color}` : 'none' }} />
      <span className="text-xs text-slate-300">{v.label}: {v.on ? 'ON' : 'OFF'}</span>
    </div>
  );
}

function Buzzer({ on }: { on: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative grid h-16 w-16 place-items-center">
        {on && <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/40" />}
        <div className={`relative grid h-14 w-14 place-items-center rounded-full border-2 text-lg font-bold ${on ? 'border-amber-300 bg-amber-500 text-black' : 'border-white/30 bg-[#151515] text-slate-500'}`}>{on ? '♪' : '–'}</div>
      </div>
      <span className="text-xs text-slate-300">Buzzer: {on ? 'BEEPING' : 'SILENT'}</span>
    </div>
  );
}

function Relay({ on }: { on: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="110" height="60" viewBox="0 0 110 60" aria-label="relay switch">
        <circle cx="20" cy="40" r="5" fill="#cbd5e1" /><circle cx="90" cy="40" r="5" fill="#cbd5e1" />
        <line x1="20" y1="40" x2={on ? 90 : 84} y2={on ? 40 : 12} stroke={on ? '#22c55e' : '#f97316'} strokeWidth="5" strokeLinecap="round" style={{ transition: 'all .15s' }} />
      </svg>
      <span className="text-xs text-slate-300">Relay contact: {on ? 'CLOSED' : 'OPEN'}</span>
    </div>
  );
}

function Lcd({ lines }: { lines: string[] }) {
  return (
    <div className="w-full max-w-[260px] rounded-xl border-4 border-red-600 bg-red-600 p-1.5">
      <div className="rounded bg-[#06101c] p-3 font-mono text-sm leading-6 text-cyan-300">{lines.map((l, i) => <div key={i} className="min-h-6 whitespace-pre">{l || ' '}</div>)}</div>
    </div>
  );
}

function Log({ v }: { v: Extract<Visual, { kind: 'log' }> }) {
  return (
    <div className="w-full rounded-xl bg-black/50 p-3 font-mono text-xs text-emerald-300">
      <p className="mb-1 text-slate-400">{v.title}</p>
      {v.lines.length === 0 ? <p className="text-slate-500">Nothing yet. Use the buttons above.</p> : v.lines.map((l, i) => <p key={i}>&gt; {l}</p>)}
    </div>
  );
}

function Bar({ v }: { v: Extract<Visual, { kind: 'bar' }> }) {
  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-xs text-slate-300"><span>{v.label}</span><span>{v.value}{v.unit ? ` ${v.unit}` : ''}</span></div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400 transition-all" style={{ width: `${Math.min(100, (v.value / v.max) * 100)}%` }} /></div>
    </div>
  );
}

function Slots({ v }: { v: Extract<Visual, { kind: 'slots' }> }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-3">
        {v.slots.map((taken, i) => (
          <div key={i} className={`grid h-20 w-24 place-items-center rounded-lg border-2 text-xs font-semibold ${taken ? 'border-red-400 bg-red-500/30' : 'border-emerald-400 bg-emerald-500/20'}`}>
            <span>{taken ? '🚗' : 'Free'}</span><span>Slot {i + 1}</span>
          </div>
        ))}
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${v.gateOpen ? 'bg-emerald-500/30 text-emerald-200' : 'bg-red-500/30 text-red-200'}`}>Gate: {v.gateOpen ? 'OPEN' : 'CLOSED (FULL)'}</span>
    </div>
  );
}

function Sms({ v }: { v: Extract<Visual, { kind: 'sms' }> }) {
  return (
    <div className="w-full max-w-[260px] rounded-2xl border border-white/20 bg-black/40 p-3 text-sm">
      <p className="mb-2 text-xs text-slate-400">Phone {v.to || '...'} (simulated)</p>
      {v.delivered ? <div className="rounded-xl rounded-tl-none bg-sky-600 px-3 py-2">{v.text || '(empty)'}</div> : <p className="text-xs text-slate-500">No message yet.</p>}
    </div>
  );
}

export default function VisualView({ v }: { v: Visual }) {
  switch (v.kind) {
    case 'led': return <Led v={v} />;
    case 'buzzer': return <Buzzer on={v.on} />;
    case 'relay': return <Relay on={v.on} />;
    case 'lcd': return <Lcd lines={v.lines} />;
    case 'log': return <Log v={v} />;
    case 'bar': return <Bar v={v} />;
    case 'slots': return <Slots v={v} />;
    case 'sms': return <Sms v={v} />;
  }
}
