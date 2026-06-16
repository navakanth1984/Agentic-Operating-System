import React, { useState } from 'react';
import { Cpu, RefreshCw, Zap, TrendingUp, ShieldAlert, Server, BarChart3, Clock, Database } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ResourceMetric } from '../types';

interface SystemResourcesViewProps {
  metrics: ResourceMetric[];
  onSimulateSpike: () => Promise<void>;
  onRefreshMetrics: () => Promise<void>;
}

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

  const latest = metrics[metrics.length - 1] || { cpu: 0, memory: 0, activeTasks: 0, timestamp: '--:--' };
  
  // Calculate historical averages
  const avgCpu = metrics.length ? Math.round(metrics.reduce((acc, m) => acc + m.cpu, 0) / metrics.length) : 0;
  const avgMem = metrics.length ? Math.round(metrics.reduce((acc, m) => acc + m.memory, 0) / metrics.length) : 0;
  const maxCpu = metrics.length ? Math.max(...metrics.map(m => m.cpu)) : 0;

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
    try {
      await onSimulateSpike();
      setLogMessages((prev) => [
        `[AUDIT COGNITION] Registered external simulation task request. Spiking compiler threads...`,
        ...prev
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSpiking(false);
    }
  };

  // Custom tooltips to match our sleek cyber-ops theme
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
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 mb-4.5">
          <div>
            <h3 className="text-xs font-bold tracking-widest text-[#E2E8F0] uppercase flex items-center gap-2 font-mono">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Agent Cluster Resource Utilization History
            </h3>
            <span className="text-[9px] font-mono text-slate-500 mt-1 block">
              Continuous monitoring of memory and processing cores across authorized mesh ports
            </span>
          </div>
          <div className="flex items-center gap-4.5 text-[9px] font-mono font-bold text-slate-400">
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

        {/* Recharts chart canvas */}
        <div className="w-full h-[280px]" id="system-recharts-chart-container">
          {metrics.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-slate-500 italic text-[11px] font-mono border border-dashed border-[#1E293B]/70 bg-[#0A0C10]">
              Generating secure telemetry curves... click 'Poll' to synchronize immediately.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={metrics} 
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
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="#6366F1" 
                  strokeWidth={2}
                  dot={{ r: 3, stroke: '#6366F1', strokeWidth: 1, fill: '#0D1117' }} 
                  activeDot={{ r: 5, stroke: '#6366F1', strokeWidth: 2, fill: '#fff' }}
                />
                <Line 
                  name="Memory footprint"
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#06B6D4" 
                  strokeWidth={2}
                  dot={{ r: 3, stroke: '#06B6D4', strokeWidth: 1, fill: '#0D1117' }} 
                  activeDot={{ r: 5, stroke: '#06B6D4', strokeWidth: 2, fill: '#fff' }}
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
