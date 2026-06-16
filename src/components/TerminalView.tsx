import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Shield, Play, Key, Database, RefreshCw, Cpu, HelpCircle } from 'lucide-react';
import { Agent, Workflow, TaskExecution, SyncedDevice } from '../types';

interface TerminalViewProps {
  agents: Agent[];
  workflows: Workflow[];
  tasks: TaskExecution[];
  devices: SyncedDevice[];
  onRunWorkflow: (workflowId: string) => void;
  onTriggerSync: (passphrase: string) => Promise<void>;
  syncKeyFingerprint: string;
}

export default function TerminalView({
  agents,
  workflows,
  tasks,
  devices,
  onRunWorkflow,
  onTriggerSync,
  syncKeyFingerprint,
}: TerminalViewProps) {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<{ text: string; type: 'cmd' | 'system' | 'success' | 'error' | 'crypto' }[]>([
    { text: '=======================================================', type: 'system' },
    { text: '  AGENT OPERATING SYSTEM (v1.0.4) - AUTONOMOUS SHIELD CORE', type: 'crypto' },
    { text: '  Zero-Trust Encrypted Sync Link: ENABLED', type: 'crypto' },
    { text: '=======================================================', type: 'system' },
    { text: 'System ready. Type "help" to list available commands.', type: 'system' },
    { text: `Active Node Fingerprint: ${syncKeyFingerprint || 'AES-256-GCM READY'}`, type: 'crypto' },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const cmd = command.trim().toLowerCase();
    const args = cmd.split(' ');
    const primaryCmd = args[0];

    const newHistory = [...history, { text: `user@agent-os:~$ ${command}`, type: 'cmd' as const }];
    setCommand('');

    switch (primaryCmd) {
      case 'help':
        newHistory.push(
          { text: 'Available System Commands:', type: 'system' },
          { text: '  help                      Show this guide', type: 'system' },
          { text: '  agents                    Verify registered autonomous agents', type: 'system' },
          { text: '  workflows                 List designed automated processing sequences', type: 'system' },
          { text: '  run [workflow-id]         Instantiate and execute multi-agent workflow', type: 'system' },
          { text: '  sync [passphrase]         Trigger zero-knowledge sync serialization', type: 'system' },
          { text: '  devices                   Map authorized synchronized machine mesh', type: 'system' },
          { text: '  clear                     Reset terminal interface buffer', type: 'system' },
        );
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'agents':
        newHistory.push({ text: `Registering ${agents.length} active neural sub-cores:`, type: 'system' });
        agents.forEach((a) => {
          newHistory.push({
            text: `  [${a.name}] - Role: ${a.role} (${a.model}) - Status: ${a.status.toUpperCase()}`,
            type: 'success',
          });
        });
        break;

      case 'workflows':
        newHistory.push({ text: `Pre-compiled processing flows:`, type: 'system' });
        workflows.forEach((w) => {
          newHistory.push({
            text: `  ID: ${w.id} | Name: ${w.name} (${w.steps.length} autonomous stages)`,
            type: 'system',
          });
        });
        break;

      case 'devices':
        newHistory.push({ text: `Mapping synchronized cross-device replication grid:`, type: 'crypto' });
        devices.forEach((d) => {
          newHistory.push({
            text: `  Node ID: ${d.id} | Name: ${d.name} (${d.deviceType.toUpperCase()}) | Fingerprint: ${d.encryptionKeyFingerprint.substring(0, 15)}... | Status: ${d.active ? 'ACTIVE' : 'OFFLINE'}`,
            type: d.active ? 'success' : 'error',
          });
        });
        break;

      case 'run':
        const wfId = args[1];
        if (!wfId) {
          newHistory.push({ text: 'Error: Provide a workflow id to run. Usage: run [workflow-id] (e.g. run wf-1)', type: 'error' });
        } else {
          const wf = workflows.find((w) => w.id === wfId);
          if (!wf) {
            newHistory.push({ text: `Error: Workflow ID "${wfId}" not found in compilation records.`, type: 'error' });
          } else {
            newHistory.push({ text: `Orchestrating workflow "${wf.name}"... Initiating execution pipelines.`, type: 'success' });
            onRunWorkflow(wfId);
          }
        }
        break;

      case 'sync':
        const phrase = args.slice(1).join(' ');
        if (!phrase) {
          newHistory.push({ text: 'Error: Encryption key required. Usage: sync [master-passphrase]', type: 'error' });
        } else {
          newHistory.push({ text: '[ENCRYPTION ENGINE] Invoking crypto sub-keys...', type: 'crypto' });
          try {
            await onTriggerSync(phrase);
            newHistory.push({ text: '[SUCCESS] Backup encrypted and synchronized with cloud-native storage nodes.', type: 'success' });
          } catch (err: any) {
            newHistory.push({ text: `Encryption failure: ${err.message}`, type: 'error' });
          }
        }
        break;

      default:
        newHistory.push({ text: `Unknown operation: "${primaryCmd}". Invalidate core. Type "help" for core list.`, type: 'error' });
        break;
    }

    setHistory(newHistory);
  };

  const executeWfPreset = (id: string) => {
    setCommand(`run ${id}`);
    onRunWorkflow(id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full relative z-10">
      {/* Interactive Command Log */}
      <div className="lg:col-span-2 flex flex-col bg-[#0A0C10] rounded-sm border border-[#1E293B] shadow-2xl p-4 sm:p-5 font-mono text-xs overflow-hidden h-[380px] sm:h-[500px] lg:h-[600px]">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-none bg-rose-500 animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-none bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-none bg-emerald-500" />
            </div>
            <span className="text-slate-400 font-semibold px-2 font-mono">host_terminal_shell.sh</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-[9px] font-mono">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>SECURE CRYPTO MESH (TLS_1.3)</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
          {history.map((log, i) => (
            <div
              key={i}
              className={`leading-relaxed ${
                log.type === 'cmd'
                  ? 'text-white font-semibold'
                  : log.type === 'success'
                  ? 'text-emerald-400 font-medium'
                  : log.type === 'error'
                  ? 'text-rose-400'
                  : log.type === 'crypto'
                  ? 'text-indigo-400 font-medium'
                  : 'text-slate-400'
              }`}
            >
              {log.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleCommand} className="mt-4 pt-3 border-t border-[#1E293B] shrink-0 flex items-center gap-2 lg:gap-3">
          <span className="text-indigo-400 shrink-0 font-medium font-mono text-xs sm:text-sm">
            <span className="inline sm:hidden">$</span>
            <span className="hidden sm:inline">user@agent-os:~$</span>
          </span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Type a command..."
            className="flex-1 bg-transparent border-0 outline-none focus:ring-0 p-0 text-white font-mono placeholder-slate-800 font-semibold selection:bg-slate-800"
            autoFocus
            id="terminal-input"
          />
        </form>
      </div>

      {/* OS Hot-Deck / Quick Tasks Controls */}
      <div className="space-y-6">
        <div className="bg-[#0D1117] border border-[#1E293B] rounded-sm p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-300" />
          <h2 className="text-xs font-bold tracking-widest text-[#E2E8F0] uppercase mb-4 flex items-center gap-2 font-mono">
            <Cpu className="w-4 h-4 text-indigo-400" />
            Vanguard Task Launch Deck
          </h2>
          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-sans">
            Instantly dispatch preset multi-agent sequences on host-layer subprocesses.
          </p>

          <div className="space-y-3">
            {workflows.map((wf) => (
              <button
                key={wf.id}
                onClick={() => executeWfPreset(wf.id)}
                className="w-full text-left bg-[#0A0C10] hover:bg-[#1E293B]/40 border border-[#1E293B] hover:border-indigo-500/40 p-3 rounded-sm transition-all duration-200 flex items-center justify-between group"
                id={`btn-run-preset-${wf.id}`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors font-mono">
                    {wf.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 truncate max-w-[200px] font-mono">
                    {wf.description}
                  </div>
                </div>
                <Play className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 opacity-60 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Cryptographic Sub-Node Registry */}
        <div className="bg-[#0D1117] border border-[#1E293B] rounded-sm p-5 shadow-lg">
          <h2 className="text-xs font-bold tracking-widest text-slate-200 uppercase mb-4 flex items-center gap-2 font-mono">
            <Key className="w-4 h-4 text-cyan-400" />
            Device Key Vault
          </h2>
          <div className="space-y-3.5">
            <div className="bg-[#0A0C10] hover:bg-[#1E293B]/20 border border-[#1E293B] p-3 rounded-sm flex items-center gap-3">
              <Database className="w-5 h-5 text-indigo-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-300 font-mono">Local Encrypt Secret</div>
                <div className="text-[10px] font-mono text-indigo-400 truncate mt-0.5" title={syncKeyFingerprint}>
                  {syncKeyFingerprint || 'PBKDF2_AES_LOCAL_ENG'}
                </div>
              </div>
            </div>

            <div className="bg-[#0A0C10] hover:bg-[#1E293B]/20 border border-[#1E293B] p-3 rounded-sm flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-emerald-400 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-300 font-mono">Mesh Sync Channel</div>
                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-none animate-pulse" />
                  <span>2 external systems authorized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
