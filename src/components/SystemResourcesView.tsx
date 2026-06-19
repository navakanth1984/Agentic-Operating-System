import React, { useState, useEffect, useMemo } from 'react';
import { Cpu, RefreshCw, Zap, TrendingUp, ShieldAlert, Server, BarChart3, Clock, Database, Play, Pause } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ResourceMetric } from '../types';

interface SystemResourcesViewProps {
  metrics: ResourceMetric[];
  onSimulateSpike: () => Promise<void>;
  onRefreshMetrics: () => Promise<void>;
}

// Extract CustomTooltip outside component to prevent re-creating the function on every render,
// which avoids unmounting/remounting the DOM node and layout thrashing in Recharts.
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A0C10] border border-[#1E293B] p-3 rounded-sm shadow-md font-mono text-[10px] space-y-1.5">
        <div className="text-slate-500 font-bold border-b border-[#1E293B] pb-1 flex items-center gap-1">
          <Clock className="w-3 h-3 text-indigo-400" />
          TIME: {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-4 justify-between">
            <span className="font-semibold uppercase" style={{ color: entry.stroke }}>
              {entry.name}:
            </span>
            <span className="text-white font-bold">{entry.value}%</span>
          </div>
        ))}
        <div className="flex items-center gap-4 justify-between mt-0.5 pt-1 border-t border-[#1E293B]/60 text-slate-400">
          <span>ACTIVE TASKS:</span>
          <span className="text-[#E2E8F0] font-bold">{payload[0]?.payload?.activeTasks || 0}</span>
        </div>
      </div>
    );
  }
  return null;
};

const generateInitialSeconds = (count: number) => {
  const list: ResourceMetric[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 1000);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    const s = d.getSeconds().toString().padStart(2, '0');
    list.push({
      timestamp: `${h}:${m}:${s}`,
      cpu: Math.max(10, Math.floor(18 + Math.sin(i * 0.4) * 6 + Math.random() * 8)),
      memory: Math.max(10, Math.floor(41 + Math.cos(i * 0.2) * 2 + Math.random() * 4)),
      activeTasks: 0
    });
  }
  return list;
};

const generateInitialMinutes = (count: number) => {
  const list: ResourceMetric[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 1000);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    list.push({
      timestamp: `${h}:${m}`,
      cpu: Math.max(10, Math.floor(22 + Math.sin(i * 0.5) * 8 + Math.random() * 10)),
      memory: Math.max(10, Math.floor(39 + Math.cos(i * 0.3) * 3 + Math.random() * 5)),
      activeTasks: 0
    });
  }
  return list;
};

export default function SystemResourcesView({
  metrics,
  onSimulateSpike,
  onRefreshMetrics,
}: SystemResourcesViewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSpiking, setIsSpiking] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([
    "[KERNEL] Telemetry stream connected successfully.",
    "[DAEMON] Polling internal system interfaces on port 3000..."
  ]);

  // High-fidelity live graph states
  const [timeDimension, setTimeDimension] = useState<'second' | 'minute'>('second');
  const [windowLimit, setWindowLimit] = useState<number>(30);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [interpolation, setInterpolation] = useState<'monotone' | 'step' | 'linear'>('monotone');
  const [localMetrics, setLocalMetrics] = useState<ResourceMetric[]>(generateInitialSeconds(30));

  // Initialize/re-fill local metrics when timeDimension or windowLimit changes
  useEffect(() => {
    setLocalMetrics(timeDimension === 'second' 
      ? generateInitialSeconds(windowLimit) 
      : generateInitialMinutes(windowLimit)
    );
  }, [timeDimension, windowLimit]);

  // Live auto-updater heartbeat loop
  useEffect(() => {
    if (isPaused) return;

    // Second-by-second updates every 1s, minute-by-minute simulated updates every 5s for active user preview
    const intervalTime = timeDimension === 'second' ? 1000 : 5000;
    let simulatedMinutesCounter = 0;

    const tick = () => {
      setLocalMetrics(prev => {
        const nextTime = new Date();
        let timeStr = "";

        if (timeDimension === 'second') {
          const h = nextTime.getHours().toString().padStart(2, '0');
          const m = nextTime.getMinutes().toString().padStart(2, '0');
          const s = nextTime.getSeconds().toString().padStart(2, '0');
          timeStr = `${h}:${m}:${s}`;
        } else {
          // Progress time by 1 simulated minute per tick to showcase streaming flows immediately
          simulatedMinutesCounter++;
          const adjustedTime = new Date(nextTime.getTime() + simulatedMinutesCounter * 60 * 1000);
          const h = adjustedTime.getHours().toString().padStart(2, '0');
          const m = adjustedTime.getMinutes().toString().padStart(2, '0');
          timeStr = `${h}:${m}`;
        }

        const lastPoints = prev.slice(-3);
        const hasRecentSpike = lastPoints.some(pt => pt.cpu > 65);

        let baseCpu = 20;
        let baseMem = 42;

        if (isSpiking || isRefreshing) {
          baseCpu = 78;
          baseMem = 62;
        } else if (hasRecentSpike) {
          // Decaying glide feedback logic
          baseCpu = Math.max(18, lastPoints[lastPoints.length - 1].cpu - 12);
          baseMem = Math.max(41, lastPoints[lastPoints.length - 1].memory - 3);
        }

        const nextCpu = Math.min(99, Math.max(8, Math.floor(baseCpu + (Math.random() - 0.5) * 12 + (isSpiking ? 15 : 0))));
        const nextMem = Math.min(95, Math.max(12, Math.floor(baseMem + (Math.random() - 0.5) * 5)));

        const nextPoint: ResourceMetric = {
          timestamp: timeStr,
          cpu: nextCpu,
          memory: nextMem,
          activeTasks: isSpiking ? 1 : 0
        };

        const list = [...prev];
        list.push(nextPoint);
        if (list.length > windowLimit) {
          list.shift();
        }
        return list;
      });
    };

    const timer = setInterval(tick, intervalTime);
    return () => clearInterval(timer);
  }, [timeDimension, isPaused, isSpiking, isRefreshing, windowLimit]);

  const activeMetrics = localMetrics;
  const latest = activeMetrics[activeMetrics.length - 1] || { cpu: 0, memory: 0, activeTasks: 0, timestamp: '--:--' };
  
  // Calculate historical averages using a single pass wrapped in useMemo
  // to avoid mapping and reducing arrays three times on every render.
  const { avgCpu, avgMem, maxCpu } = useMemo(() => {
    const len = activeMetrics.length;
    if (len === 0) return { avgCpu: 0, avgMem: 0, maxCpu: 0 };
    let sumCpu = 0;
    let sumMem = 0;
    let max = 0;
    for (let i = 0; i < len; i++) {
      const metric = activeMetrics[i];
      sumCpu += metric.cpu;
      sumMem += metric.memory;
      if (metric.cpu > max) max = metric.cpu;
    }
    return {
      avgCpu: Math.round(sumCpu / len),
      avgMem: Math.round(sumMem / len),
      maxCpu: max
    };
  }, [activeMetrics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshMetrics();
      setLogMessages((prev) => [
        `[KERNEL] Telemetry buffer synchronized cleanly at ${new Date().toLocaleTimeString()}`,
        ...prev
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSimulate = async () => {
    setIsSpiking(true);
    
    // Inject dynamic high-frequency spikes instantly into local metrics
    setLocalMetrics(prev => {
      return prev.map((pt, idx) => {
        if (idx >= prev.length - 5) {
          return {
            ...pt,
            cpu: Math.min(98, Math.floor(84 + Math.random() * 12)),
            memory: Math.min(92, Math.floor(66 + Math.random() * 6))
          };
        }
        return pt;
      });
    });

    try {
      await onSimulateSpike();
      setLogMessages((prev) => [
        `[AUDIT COGNITION] Registered external simulation task request. Spiking compiler threads...`,
        ...prev
      ]);
      // Run spike simulation for 4 seconds before smoothing out
      setTimeout(() => {
        setIsSpiking(false);
      }, 4000);
    } catch (err) {
      console.error(err);
      setIsSpiking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Bento Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: CPU Util */}
        <div className="bg-[#0D1117] border border-[#1E293B] rounded-sm p-4.5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#94A3B8] uppercase block">
                CURRENT CPU LOAD
              </span>
              <span className="text-2xl font-bold font-mono text-[#E2E8F0] mt-1.5 block">
                {latest.cpu}%
              </span>
            </div>
            <div className="w-9 h-9 rounded-sm bg-indigo-950/40 border border-indigo-900/60 flex items-center justify-center">
              <Cpu className={`w-4 h-4 text-indigo-400 ${latest.cpu > 70 ? 'animate-bounce' : ''}`} />
            </div>
          </div>
          <div className="mt-3.5 space-y-1">
            <div className="w-full bg-[#0A0C10] h-1.5 rounded-none overflow-hidden border border-[#1E293B]/60">
              <div 
                className={`h-full transition-all duration-500 ${
                  latest.cpu > 75 ? 'bg-rose-500' : latest.cpu > 50 ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${latest.cpu}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] font-mono text-slate-500 font-semibold">
              <span>BASE RECOVERY</span>
              <span>75% THR</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Memory Util */}
        <div className="bg-[#0D1117] border border-[#1E293B] rounded-sm p-4.5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#94A3B8] uppercase block">
                MEMORY FOOTPRINT
              </span>
              <span className="text-2xl font-bold font-mono text-[#E2E8F0] mt-1.5 block">
                {latest.memory}%
              </span>
            </div>
            <div className="w-9 h-9 rounded-sm bg-cyan-950/40 border border-cyan-900/60 flex items-center justify-center">
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="mt-3.5 space-y-1">
            <div className="w-full bg-[#0A0C10] h-1.5 rounded-none overflow-hidden border border-[#1E293B]/60">
              <div 
                className="h-full bg-cyan-500 transition-all duration-500"
                style={{ width: `${latest.memory}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] font-mono text-slate-500 font-semibold">
              <span>HELO STACK</span>
              <span>SWAP ENABLED</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Cluster averages */}
        <div className="bg-[#0D1117] border border-[#1E293B] rounded-sm p-4.5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#94A3B8] uppercase block">
                AVERAGE LOAD COEFFICIENT
              </span>
              <span className="text-2xl font-bold font-mono text-[#E2E8F0] mt-1.5 block">
                {avgCpu}% <span className="text-xs font-mono text-slate-500 font-semibold">/ {avgMem}%</span>
              </span>
            </div>
            <div className="w-9 h-9 rounded-sm bg-emerald-950/40 border border-emerald-900/60 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[9px] font-mono text-[#E2E8F0] font-semibold">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-none animate-pulse" />
            <span>SWOT PARITY: MAX PEAK {maxCpu}%</span>
          </div>
        </div>

        {/* Metric 4: Diagnostic Control Board */}
        <div className="bg-[#0D1117] border border-[#1E293B] rounded-sm p-4.5 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-mono font-bold tracking-widest text-[#94A3B8] uppercase block">
              DIAGNOSTIC TELEMETRY
            </span>
            <span className="text-[8px] px-1.5 py-0.5 rounded-none font-mono font-bold bg-[#1E293B]/60 text-slate-300 border border-[#1E293B]">
              NODE OK
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2 font-mono">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-[#0A0C10] hover:bg-[#1E293B]/20 border border-[#1E293B] text-[9px] font-bold text-[#E2E8F0] py-1.5 px-2 rounded-sm transition flex items-center justify-center gap-1 uppercase"
              id="btn-sync-resources-refresh"
            >
              <RefreshCw className={`w-3 h-3 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              Poll
            </button>
            <button
              onClick={handleSimulate}
              disabled={isSpiking}
              className="bg-indigo-650 hover:bg-indigo-600 border border-[#1E293B] text-[9px] font-bold text-white py-1.5 px-2 rounded-sm transition flex items-center justify-center gap-1 uppercase shadow-sm"
              id="btn-sync-resources-spike"
            >
              <Zap className={`w-3 h-3 text-amber-300 ${isSpiking ? 'animate-bounce' : ''}`} />
              Spike
            </button>
          </div>
        </div>
      </div>

      {/* Main Historical trends Line Chart */}
      <div className="bg-[#0D1117] border border-[#1E293B] rounded-sm p-4.5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#1E293B] pb-3 mb-4.5 gap-3">
          <div>
            <h3 className="text-xs font-bold tracking-widest text-[#E2E8F0] uppercase flex items-center gap-2 font-mono">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Agent Cluster Resource Utilization History
            </h3>
            <span className="text-[9px] font-mono text-slate-500 mt-1 block">
              Continuous monitoring of memory and processing cores across authorized mesh ports
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:gap-4.5 text-[9px] font-mono font-bold text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-indigo-500 inline-block" />
              <span>CPU UTILIZATION</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" />
              <span>MEMORY UTILIZATION</span>
            </div>
          </div>
        </div>

        {/* Real-time Tracking Configuration Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A0C10] border border-[#1E293B]/70 p-3 rounded-sm mb-4.5 font-mono text-[9px]">
          <div className="flex flex-wrap items-center gap-4">
            {/* Dimension Selection */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold uppercase">TRAIL FOCUS:</span>
              <div className="flex items-center bg-[#0D1117] border border-[#1E293B] p-0.5 rounded-sm">
                <button
                  type="button"
                  onClick={() => setTimeDimension('second')}
                  className={`px-2 py-0.5 rounded-sm font-bold transition-all ${
                    timeDimension === 'second'
                      ? 'bg-[#1E293B] text-indigo-400 border border-indigo-950/40 font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⚡ SECOND-BY-SECOND
                </button>
                <button
                  type="button"
                  onClick={() => setTimeDimension('minute')}
                  className={`px-2 py-0.5 rounded-sm font-bold transition-all ${
                    timeDimension === 'minute'
                      ? 'bg-[#1E293B] text-cyan-400 border border-cyan-950/40 font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⏳ MINUTE-BY-MINUTE
                </button>
              </div>
            </div>

            {/* Depth selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold uppercase">DEPTH:</span>
              <select
                value={windowLimit}
                onChange={(e) => setWindowLimit(Number(e.target.value))}
                className="bg-[#0D1117] border border-[#1E293B] text-[#E2E8F0] font-bold py-0.5 px-2 rounded-sm focus:outline-none cursor-pointer"
              >
                <option value={15}>15 Slices</option>
                <option value={30}>30 Slices</option>
                <option value={45}>45 Slices</option>
                <option value={60}>60 Slices</option>
              </select>
            </div>

            {/* Interpolation Style */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold uppercase">TRAIL STYLE:</span>
              <div className="flex items-center bg-[#0D1117] border border-[#1E293B] p-0.5 rounded-sm">
                {(['monotone', 'step', 'linear'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setInterpolation(style)}
                    className={`px-2 py-0.5 rounded-sm font-bold capitalize transition-all ${
                      interpolation === style
                        ? 'bg-[#1E293B] text-[#E2E8F0]'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    type="button"
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stream Player Controls */}
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 border ${
              isPaused 
                ? 'bg-rose-950/60 text-[#F87171] border-rose-900/60 animate-none' 
                : 'bg-emerald-950/60 text-[#4ADE80] border-emerald-900/60'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-rose-500' : 'bg-emerald-500 animate-ping'}`} />
              {isPaused ? 'TRACK_STANDBY' : 'TRACK_ACTIVE_LIVE'}
            </span>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="bg-[#0D1117] hover:bg-[#1E293B]/60 border border-[#1E293B] hover:border-slate-700 text-[#E2E8F0] p-1 rounded-sm shadow-sm transition active:scale-95"
              title={isPaused ? "Resume Live Tracking Feed" : "Pause Tracking Stream"}
              type="button"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-rose-500" />}
            </button>
          </div>
        </div>

        {/* Recharts chart canvas */}
        <div className="w-full h-[280px]" id="system-recharts-chart-container">
          {activeMetrics.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-slate-500 italic text-[11px] font-mono border border-dashed border-[#1E293B]/70 bg-[#0A0C10]">
              Generating secure telemetry curves... click 'Poll' to synchronize immediately.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={activeMetrics} 
                margin={{ top: 10, right: 10, left: -22, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#475569" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={{ stroke: '#1E293B' }}
                  fontFamily="monospace"
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={{ stroke: '#1E293B' }}
                  fontFamily="monospace"
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  name="CPU utilization"
                  type={interpolation} 
                  dataKey="cpu" 
                  stroke="#6366F1" 
                  strokeWidth={2}
                  dot={{ r: 2, stroke: '#6366F1', strokeWidth: 1, fill: '#0D1117' }} 
                  activeDot={{ r: 5, stroke: '#6366F1', strokeWidth: 2, fill: '#fff' }}
                  isAnimationActive={!isPaused}
                />
                <Line 
                  name="Memory footprint"
                  type={interpolation} 
                  dataKey="memory" 
                  stroke="#06B6D4" 
                  strokeWidth={2}
                  dot={{ r: 2, stroke: '#06B6D4', strokeWidth: 1, fill: '#0D1117' }} 
                  activeDot={{ r: 5, stroke: '#06B6D4', strokeWidth: 2, fill: '#fff' }}
                  isAnimationActive={!isPaused}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* System operation logs & Telemetry stats sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core kernel activity trace stream */}
        <div className="bg-[#0D1117] border border-[#1E293B] rounded-sm p-4.5 shadow-lg space-y-3">
          <span className="text-[8px] font-bold font-mono text-slate-500 uppercase tracking-widest block">
            Node Telemetry Activity Log Trace
          </span>
          <div className="bg-[#0A0C10] border border-[#1E293B] p-4 rounded-sm font-mono text-[10px] space-y-2 h-[178px] overflow-y-auto custom-scrollbar">
            {logMessages.map((msg, i) => {
              let logTypeColor = 'text-slate-400';
              if (msg.includes('[KERNEL]')) logTypeColor = 'text-emerald-400';
              if (msg.includes('[DAEMON]')) logTypeColor = 'text-slate-300';
              if (msg.includes('[AUDIT')) logTypeColor = 'text-cyan-400';

              return (
                <div key={i} className={`leading-relaxed ${logTypeColor}`}>
                  {msg}
                </div>
              );
            })}
          </div>
        </div>

        {/* Metric averages ledger */}
        <div className="bg-[#0D1117] border border-[#1E293B] rounded-sm p-4.5 shadow-lg space-y-3">
          <span className="text-[8px] font-bold font-mono text-slate-500 uppercase tracking-widest block">
            Symmetric Performance Ledger
          </span>
          <div className="space-y-2 font-mono text-[10px] leading-relaxed">
            <div className="bg-[#0A0C10] p-3 rounded-sm border border-[#1E293B]/80 hover:border-[#1E293B] transition flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-none" />
                <span className="text-slate-400">Average Core Load Spike:</span>
              </div>
              <span className="text-white font-bold">{avgCpu}%</span>
            </div>

            <div className="bg-[#0A0C10] p-3 rounded-sm border border-[#1E293B]/80 hover:border-[#1E293B] transition flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-none" />
                <span className="text-slate-400">Unification Memory Sweep:</span>
              </div>
              <span className="text-white font-bold">{avgMem}%</span>
            </div>

            <div className="bg-[#0A0C10] p-3 rounded-sm border border-[#1E293B]/80 hover:border-[#1E293B] transition flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-none" />
                <span className="text-slate-400">Total Telemetry Captures:</span>
              </div>
              <span className="text-white font-bold">{metrics.length} slices</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
