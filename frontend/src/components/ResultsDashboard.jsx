import React, { useEffect, useState } from 'react';
import {
  CheckCircle, XCircle, AlertTriangle, Clock,
  Film, BarChart2, Shield, Activity
} from 'lucide-react';

/* ── Animated circular progress ring ── */
const RingMeter = ({ percent, isFake }) => {
  const radius   = 54;
  const stroke   = 6;
  const circ     = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circ - (percent / 100) * circ);
    }, 300);
    return () => clearTimeout(timer);
  }, [percent, circ]);

  const color     = isFake ? '#ef4444' : '#22c55e';
  const glowColor = isFake ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)';
  const trackColor = 'rgba(255,255,255,0.06)';

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Track */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.1,0.64,1)',
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black" style={{ color }}>{percent}%</span>
        <span className="text-xs font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
          confidence
        </span>
      </div>
    </div>
  );
};

/* ── Single stat card ── */
// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: IconComponent, label, value, color = '#3b82f6', delay = 0 }) => (
  <div
    className="stat-card p-4 flex items-center gap-3 animate-fade-up"
    style={{ animationDelay: `${delay}ms`, opacity: 0, animationFillMode: 'forwards' }}
  >
    <div className="p-2.5 rounded-xl shrink-0"
      style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
      <IconComponent className="w-4 h-4" style={{ color }} />
    </div>
    <div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-sm font-bold text-white mt-0.5">{value}</p>
    </div>
  </div>
);

/* ── Timeline bar ── */
const TimelineBar = ({ frame, maxProb, index }) => {
  const isFakeFrame = frame.fake_prob > 0.5;
  const heightPct   = Math.max(4, (frame.fake_prob / (maxProb || 1)) * 100);
  const color       = isFakeFrame ? '#ef4444' : '#22c55e';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800 + index * 40);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className="timeline-bar relative flex-1 flex flex-col justify-end group"
      style={{ height: '100%', minWidth: 0 }}
    >
      {/* Bar fill */}
      <div
        style={{
          height: visible ? `${heightPct}%` : '0%',
          background: isFakeFrame
            ? 'linear-gradient(to top, #dc2626, #f87171)'
            : 'linear-gradient(to top, #16a34a, #4ade80)',
          borderRadius: '3px 3px 0 0',
          transition: `height 0.8s cubic-bezier(0.34,1.1,0.64,1) ${index * 35}ms`,
          boxShadow: visible ? `0 0 8px ${color}60` : 'none',
        }}
      />
      {/* Tooltip */}
      <div className="hidden group-hover:flex absolute bottom-full mb-2 left-1/2 -translate-x-1/2
        flex-col items-center z-20 pointer-events-none">
        <div className="px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap font-mono"
          style={{
            background: 'rgba(10,15,30,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
          }}>
          <span style={{ color }}>●</span>{' '}
          {(frame.fake_prob * 100).toFixed(0)}% fake
          <div className="text-slate-500 text-center">t={frame.timestamp.toFixed(1)}s</div>
        </div>
        <div className="w-1.5 h-1.5 rotate-45 -mt-0.5"
          style={{ background: 'rgba(10,15,30,0.95)', borderRight:'1px solid rgba(255,255,255,0.1)', borderBottom:'1px solid rgba(255,255,255,0.1)' }} />
      </div>
    </div>
  );
};

/* ── Main Dashboard ── */
const ResultsDashboard = ({ results }) => {
  if (!results) return null;

  const isFake           = results.verdict === 'FAKE';
  const isUnknown        = results.verdict === 'UNKNOWN';
  const confidencePct    = Math.round((results.confidence || 0) * 100);
  const avgFakePct       = Math.round((results.avg_fake_score || 0) * 100);
  const avgRealPct       = Math.round((results.avg_real_score || 0) * 100);
  const framesAnalyzed   = results.frames_analyzed || results.timeline?.length || 0;
  const timeline         = results.timeline || [];
  const maxProb          = Math.max(...timeline.map(f => f.fake_prob), 0.01);

  const verdictColor     = isUnknown ? '#94a3b8' : isFake ? '#ef4444' : '#22c55e';
  const verdictGlow      = isUnknown ? 'none'
    : isFake ? '0 0 40px rgba(239,68,68,0.2)' : '0 0 40px rgba(34,197,94,0.2)';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">

      {/* ── Hero verdict card ── */}
      <div
        className="animate-scale-in relative overflow-hidden rounded-3xl p-6 md:p-8"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: `1px solid ${verdictColor}28`,
          boxShadow: verdictGlow,
        }}
      >
        {/* BG glow blob */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${verdictColor}10 0%, transparent 70%)`,
            transform: 'translate(30%, -30%)',
          }} />

        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Left: file info + verdict */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-500 font-mono">
              <Film className="w-3.5 h-3.5" />
              <span className="truncate max-w-xs">{results.filename}</span>
              <span>·</span>
              <Clock className="w-3.5 h-3.5" />
              <span>{(results.duration || 0).toFixed(1)}s</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Verdict badge */}
              <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl"
                style={{
                  background: `${verdictColor}12`,
                  border: `1px solid ${verdictColor}35`,
                }}>
                {isUnknown
                  ? <AlertTriangle className="w-5 h-5" style={{ color: verdictColor }} />
                  : isFake
                    ? <XCircle className="w-5 h-5" style={{ color: verdictColor }} />
                    : <CheckCircle className="w-5 h-5" style={{ color: verdictColor }} />
                }
                <span className="text-xl font-black tracking-widest" style={{ color: verdictColor }}>
                  {results.verdict}
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {isUnknown
                ? 'Could not extract enough frames to make a determination.'
                : isFake
                  ? 'High probability of manipulation detected across analyzed frames. This video likely contains synthetic or edited content.'
                  : 'No significant manipulation artifacts detected. The video appears to be authentic based on frame analysis.'
              }
            </p>
          </div>

          {/* Right: Ring meter */}
          {!isUnknown && (
            <div className="shrink-0">
              <RingMeter percent={confidencePct} isFake={isFake} />
              <p className="text-center text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {isFake ? 'fake' : 'real'} probability
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={BarChart2}  label="Frames Analyzed"  value={`${framesAnalyzed} frames`}  color="#3b82f6" delay={100} />
        <StatCard icon={Activity}   label="Avg Fake Score"   value={`${avgFakePct}%`}              color="#ef4444" delay={200} />
        <StatCard icon={Shield}     label="Avg Real Score"   value={`${avgRealPct}%`}              color="#22c55e" delay={300} />
        <StatCard icon={Clock}      label="Duration"         value={`${(results.duration||0).toFixed(1)}s`} color="#a78bfa" delay={400} />
      </div>

      {/* ── Score bars ── */}
      <div
        className="animate-fade-up rounded-2xl p-5 space-y-4"
        style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', animationDelay:'500ms', opacity:0, animationFillMode:'forwards' }}
      >
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-blue-400" /> Score Breakdown
        </h3>

        {/* Fake score bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-red-400 font-medium">Fake Probability</span>
            <span className="font-mono text-white">{avgFakePct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
            <ScoreBar pct={avgFakePct} color="linear-gradient(90deg,#dc2626,#f87171)" delay={600} />
          </div>
        </div>

        {/* Real score bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-green-400 font-medium">Real Probability</span>
            <span className="font-mono text-white">{avgRealPct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
            <ScoreBar pct={avgRealPct} color="linear-gradient(90deg,#16a34a,#4ade80)" delay={700} />
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      {timeline.length > 0 && (
        <div
          className="animate-fade-up rounded-2xl p-5 space-y-4"
          style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', animationDelay:'600ms', opacity:0, animationFillMode:'forwards' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> Frame-by-Frame Analysis
            </h3>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ background:'#ef4444' }} />
                Fake &gt;50%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ background:'#22c55e' }} />
                Real ≤50%
              </span>
            </div>
          </div>

          {/* Bar chart */}
          <div className="relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs font-mono text-slate-700 pr-2" style={{ width:'32px' }}>
              <span>100</span>
              <span>50</span>
              <span>0</span>
            </div>

            {/* Chart area */}
            <div className="ml-8">
              {/* 50% threshold line */}
              <div className="relative h-36 flex items-end gap-0.5">
                <div className="absolute w-full border-t border-dashed pointer-events-none"
                  style={{ top:'50%', borderColor:'rgba(255,255,255,0.08)' }} />

                {timeline.map((frame, i) => (
                  <TimelineBar
                    key={i}
                    frame={frame}
                    maxProb={maxProb}
                    index={i}
                    total={timeline.length}
                  />
                ))}
              </div>

              {/* X-axis */}
              <div className="flex justify-between text-xs font-mono text-slate-700 mt-2 border-t"
                style={{ borderColor:'rgba(255,255,255,0.06)', paddingTop:'6px' }}>
                <span>0:00</span>
                <span>{Math.floor((results.duration||0)/60)}:{String(Math.round((results.duration||0)%60)).padStart(2,'0')}</span>
              </div>
            </div>
          </div>

          {/* Frame count legend */}
          <p className="text-xs text-center text-slate-600 pt-1">
            Analyzed {framesAnalyzed} frames · Hover bars for frame details
          </p>
        </div>
      )}

      {/* ── Interpretation note ── */}
      <div
        className="animate-fade-up rounded-2xl p-4 flex items-start gap-3"
        style={{ background:'rgba(59,130,246,0.04)', border:'1px solid rgba(59,130,246,0.1)', animationDelay:'700ms', opacity:0, animationFillMode:'forwards' }}
      >
        <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
        <p className="text-xs leading-relaxed text-slate-500">
          <span className="text-slate-400 font-medium">Disclaimer: </span>
          This tool uses AI to detect potential deepfakes and should be used as a guide, not a definitive judgment.
          Results depend on video quality, compression, and model capability. Always verify findings through multiple sources.
        </p>
      </div>
    </div>
  );
};

/* Animated horizontal score bar */
const ScoreBar = ({ pct, color, delay }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), delay || 100);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div
      className="h-full rounded-full"
      style={{
        width: `${width}%`,
        background: color,
        transition: `width 1.2s cubic-bezier(0.34,1.1,0.64,1)`,
        boxShadow: `0 0 12px ${color.includes('dc2626') ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
      }}
    />
  );
};

export default ResultsDashboard;
