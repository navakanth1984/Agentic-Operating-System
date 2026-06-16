import React, { useState } from 'react';
import { Cpu, Plus, Trash2, Sliders, MessageSquare, Brain, HelpCircle } from 'lucide-react';
import { Agent } from '../types';

interface AgentsViewProps {
  agents: Agent[];
  onSaveAgent: (agent: Agent) => void;
  onDeleteAgent: (agentId: string) => void;
}

export default function AgentsView({ agents, onSaveAgent, onDeleteAgent }: AgentsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [model, setModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [iconColor, setIconColor] = useState('bg-indigo-600 text-white');

  // Multi-Agent Arena simulator state
  const [simPrompt, setSimPrompt] = useState('Draft an off-grid solar-powered home automation network.');
  const [simLogs, setSimLogs] = useState<{ speaker: string; text: string; color: string }[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [arenaAgentA, setArenaAgentA] = useState(agents[0]?.id || '');
  const [arenaAgentB, setArenaAgentB] = useState(agents[1]?.id || '');

  const colorOptions = [
    { class: 'bg-indigo-600 text-white', label: 'Indigo Core' },
    { class: 'bg-amber-500 text-slate-900', label: 'Intelligence Amber' },
    { class: 'bg-emerald-500 text-white', label: 'Operations Emerald' },
    { class: 'bg-rose-600 text-white', label: 'Vanguard Crimson' },
    { class: 'bg-cyan-500 text-slate-900', label: 'Quantum Cyan' },
    { class: 'bg-fuchsia-600 text-white', label: 'Processor Magenta' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !systemInstruction.trim()) return;

    onSaveAgent({
      id: `agent-${Date.now()}`,
      name,
      role,
      systemInstruction,
      temperature,
      model,
      status: 'idle',
      iconColor,
    });

    setName('');
    setRole('');
    setSystemInstruction('');
    setTemperature(0.7);
    setShowAddForm(false);
  };

  const startCooperativeSimulation = async () => {
    if (!arenaAgentA || !arenaAgentB) return;
    setIsSimulating(true);
    setSimLogs([]);

    const agentA = agents.find((a) => a.id === arenaAgentA);
    const agentB = agents.find((a) => a.id === arenaAgentB);

    if (!agentA || !agentB) return;

    // Simulation Sequence (Step 1: Agent A plans, Step 2: Agent B audits, Step 3: Synthesis)
    setSimLogs([
      {
        speaker: 'System Router',
        text: `⚡ Activating cooperative multi-agent channel between [${agentA.name}] and [${agentB.name}]...`,
        color: 'text-slate-400 font-bold',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 800));
    setSimLogs((prev) => [
      ...prev,
      {
        speaker: agentA.name,
        text: `🧠 Analyzing initial prompt: "${simPrompt}"... Utilizing system role: [${agentA.role}].`,
        color: agentA.iconColor,
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 1400));
    setSimLogs((prev) => [
      ...prev,
      {
        speaker: agentA.name,
        text: `📋 PROPOSAL OUTLINE:\n1. Core System: Distributed localized Raspberry Pi cluster running SQLite replicas.\n2. Security: Local dynamic tokens using PBKDF2 with strict authentication handshakes.\n3. Failover: Multi-master mesh protocol allowing offline operational cache sync.`,
        color: agentA.iconColor + ' font-medium',
      },
      {
        speaker: 'System Router',
        text: `🔄 Routing output of [${agentA.name}] to security auditor node [${agentB.name}]...`,
        color: 'text-slate-400',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSimLogs((prev) => [
      ...prev,
      {
        speaker: agentB.name,
        text: `🛡️ AUDIT REPORT by [${agentB.role}]:\n- Threat Vector identified: Raspberry nodes lack sufficient local hardware-bound enclaves.\n- Strategic Patch: Integrate client-side key-generation keys locally derived using secure passphrase. Exclude standard web cache storage entirely.\n- Architecture Approved.`,
        color: agentB.iconColor + ' font-medium',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 800));
    setSimLogs((prev) => [
      ...prev,
      {
        speaker: 'System Router',
        text: `✨ Multi-agent collaborative process completed. Real-time consensus locked.`,
        color: 'text-emerald-400 font-bold',
      },
    ]);
    setIsSimulating(false);
  };

  return (
    <div className="space-y-8 relative z-10">
      {/* Agents Registry Grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-sm font-bold tracking-widest text-[#E2E8F0] uppercase flex items-center gap-2 font-mono">
              <Brain className="w-5 h-5 text-indigo-400" />
              Specialized Neural Sub-Cores
            </h1>
            <p className="text-[11px] text-slate-400 mt-1">
              Instantiate, monitor, and remove highly tuned autonomous execution nodes.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#1E293B] hover:bg-[#1E293B]/80 text-[#E2E8F0] border border-[#1E293B] text-[10px] font-bold font-mono uppercase px-4 py-2 rounded-sm flex items-center gap-2 transition"
            id="btn-add-agent"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            Build Custom Agent
          </button>
        </div>

        {/* Add Agent Form */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-[#0D1117] border border-[#1E293B] rounded-sm p-5 mb-6 space-y-4 shadow-2xl"
            id="add-agent-form"
          >
            <h3 className="text-xs font-bold text-slate-300 border-b border-[#1E293B] pb-2 font-mono uppercase tracking-widest">Custom Agent Configurator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Agent Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Security Auditor, Market Tracker"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-[#1E293B] text-white rounded-sm py-2 px-3 text-xs focus:outline-none focus:border-indigo-400"
                  id="agent-name-input"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Agent Role Profile</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vulnerability Shield Architect"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-[#1E293B] text-white rounded-sm py-2 px-3 text-xs focus:outline-none focus:border-indigo-400"
                  id="agent-role-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Vanguard Model Core</label>
                <select
                  value={model}
                  onChange={(e: any) => setModel(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-[#1E293B] text-white rounded-sm py-2 px-3 text-xs focus:outline-none focus:border-indigo-400"
                  id="agent-model-select"
                >
                  <option value="gemini-3.5-flash">gemini-3.5-flash (Fast, web references)</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex intelligence)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Instant reply)</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Model Temperature ({temperature})</label>
                <div className="flex items-center gap-3 py-1 bg-[#0A0C10] px-3 rounded-sm border border-[#1E293B]">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="flex-1 accent-indigo-500 bg-slate-800 h-1.5 rounded-sm"
                    id="agent-temp-range"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Sub-Core Palette</label>
                <div className="flex gap-2">
                  {colorOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.class}
                      onClick={() => setIconColor(opt.class)}
                      className={`w-7 h-7 rounded-none transition-all ${opt.class} ${
                        iconColor === opt.class ? 'ring-2 ring-indigo-500 border border-white' : 'opacity-80 border border-[#1E293B]'
                      }`}
                      title={opt.label}
                      id={`btn-color-${opt.class.replace(' ', '-')}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">System Instructions (Prompt Anchor)</label>
              <textarea
                required
                rows={3}
                placeholder="Anchor system-level characteristics. How does this agent act? Is it strict, concise, code-heavy, or security-focused?"
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                className="w-full bg-[#0A0C10] border border-[#1E293B] text-white rounded-sm py-2 px-3 text-xs focus:outline-none focus:border-indigo-400 font-mono"
                id="agent-instructions-textarea"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-[#0A0C10] hover:bg-[#1E293B]/20 border border-[#1E293B] text-[#E2E8F0] text-[10px] font-bold font-mono uppercase px-4 py-2 rounded-sm transition"
                id="btn-cancel-agent"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-650 hover:bg-indigo-600 text-white text-[10px] font-bold font-mono uppercase px-4 py-2 rounded-sm transition"
                id="btn-save-agent"
              >
                Register Agent Sub-Core
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`bg-[#0D1117] border border-[#1E293B] rounded-sm p-4.5 shadow-lg relative flex flex-col justify-between group overflow-hidden`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8.5 h-8.5 rounded-sm font-bold flex items-center justify-center text-xs font-mono select-none px-2 shrink-0 ${agent.iconColor}`}>
                      {agent.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-100 truncate font-mono">{agent.name}</div>
                      <div className="text-[10px] font-mono text-indigo-400 truncate mt-0.5">{agent.role}</div>
                    </div>
                  </div>
                  {/* Delete button only if not a core agent */}
                  {!['agent-1', 'agent-2', 'agent-3'].includes(agent.id) && (
                    <button
                      onClick={() => onDeleteAgent(agent.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-sm hover:bg-[#0A0C10] border border-transparent hover:border-[#1E293B] transition opacity-0 group-hover:opacity-100"
                      id={`btn-delete-agent-${agent.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center bg-[#0A0C10] py-1.5 px-3 rounded-sm border border-[#1E293B]">
                    <span className="text-[10px] font-semibold text-slate-500 font-mono">Processing Core</span>
                    <span className="text-[9px] font-mono text-cyan-400">{agent.model}</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#0A0C10] py-1.5 px-3 rounded-sm border border-[#1E293B]">
                    <span className="text-[10px] font-semibold text-slate-500 font-mono">Entropy (Temp)</span>
                    <span className="text-[9px] font-mono text-slate-300">{agent.temperature}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-3 bg-[#0A0C10]/40 p-2.5 rounded-sm border border-[#1E293B]">
                    "{agent.systemInstruction}"
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-none ${agent.status === 'executing' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-[9px] font-bold font-mono text-slate-500 uppercase">
                  Node Status: {agent.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cooperation Arena */}
      <div className="bg-[#0D1117] border border-[#1E293B] rounded-sm p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xs font-bold tracking-widest text-[#E2E8F0] uppercase flex items-center gap-2 font-mono">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              Consensus Laboratory (Multi-Agent Cooperation)
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              Select two custom specialized sub-cores and run a real-time system design or code peer-review battle.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">First Core Agent</label>
            <select
              value={arenaAgentA}
              onChange={(e) => setArenaAgentA(e.target.value)}
              className="w-full bg-[#0A0C10] border border-[#1E293B] text-white rounded-sm py-2 px-3 text-xs focus:outline-none focus:border-cyan-500"
              id="arena-agent-a-select"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Second Core Agent (Auditor)</label>
            <select
              value={arenaAgentB}
              onChange={(e) => setArenaAgentB(e.target.value)}
              className="w-full bg-[#0A0C10] border border-[#1E293B] text-white rounded-sm py-2 px-3 text-xs focus:outline-none focus:border-cyan-500"
              id="arena-agent-b-select"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={startCooperativeSimulation}
              disabled={isSimulating}
              className="w-full bg-gradient-to-r from-[#1E293B] to-[#1E293B]/60 hover:to-[#1E293B] text-indigo-400 border border-[#1E293B] text-[10px] font-bold font-mono uppercase py-2 px-4 rounded-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
              id="btn-run-consensus"
            >
              <Cpu className="w-4 h-4 animate-spin-slow" />
              Initialize Joint Review
            </button>
          </div>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Arena Topic / Goal</label>
            <input
              type="text"
              value={simPrompt}
              onChange={(e) => setSimPrompt(e.target.value)}
              className="w-full bg-[#0A0C10] border border-[#1E293B] text-slate-200 rounded-sm py-2 px-3.5 text-xs focus:outline-none focus:border-cyan-500 font-mono"
              id="arena-prompt-input"
            />
          </div>

          {/* Scrolling Arena conversation window */}
          <div className="bg-[#0A0C10] rounded-sm border border-[#1E293B] p-4 h-[240px] overflow-y-auto space-y-3 font-mono text-[11px] custom-scrollbar">
            {simLogs.length === 0 ? (
              <div className="text-slate-600 italic h-full flex items-center justify-center font-mono">
                Click "Initialize Joint Review" to watch agents debate solutions.
              </div>
            ) : (
              simLogs.map((log, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-slate-500">&gt;</span>
                    <span className={`${log.color}`}>{log.speaker}</span>
                  </div>
                  <div className="text-slate-300 pl-4 whitespace-pre-wrap leading-relaxed">
                    {log.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
