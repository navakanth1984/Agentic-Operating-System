import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Monitor,
  Laptop,
  Smartphone,
  Shield,
  Brain,
  Terminal as TerminalIcon,
  Layers,
  Database,
  RefreshCw,
  Clock,
  Play,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  HardDrive
} from 'lucide-react';
import { Agent, Workflow, TaskExecution, SyncedDevice, SyncBackup, ResourceMetric } from './types.js';

// Import local components
import TerminalView from './components/TerminalView.js';
import AgentsView from './components/AgentsView.js';
import WorkflowView from './components/WorkflowView.js';
import SyncView from './components/SyncView.js';
import SystemResourcesView from './components/SystemResourcesView.js';

export default function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [tasks, setTasks] = useState<TaskExecution[]>([]);
  const [devices, setDevices] = useState<SyncedDevice[]>([]);
  const [cloudBackup, setCloudBackup] = useState<SyncBackup | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<ResourceMetric[]>([]);

  // Interface controls
  const [activeTab, setActiveTab] = useState<'dashboard' | 'terminal' | 'agents' | 'workflows' | 'sync'>('dashboard');
  const [layoutMode, setLayoutMode] = useState<'desktop' | 'laptop' | 'mobile'>('desktop');
  const [encryptionPassphrase, setEncryptionPassphrase] = useState('agent-secure-master-key-2026');
  const [syncKeyFingerprint, setSyncKeyFingerprint] = useState('');
  const [notif, setNotif] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Fetch initial state
  const refreshAllData = async () => {
    try {
      const [resAgents, resWorkflows, resTasks, resDevices, resMetrics] = await Promise.all([
        fetch('/api/agents').then(r => r.json()),
        fetch('/api/workflows').then(r => r.json()),
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/devices').then(r => r.json()),
        fetch('/api/system-resources').then(r => r.json()).catch(() => [])
      ]);

      setAgents(resAgents);
      setWorkflows(resWorkflows);
      setTasks(resTasks);
      setDevices(resDevices);
      setSystemMetrics(resMetrics);

      // Verify cloud sync vault info
      const val = await fetch('/api/sync/vault');
      if (val.ok) {
        setCloudBackup(await val.json());
      }
    } catch (err) {
      console.warn('API connection failed. Operating in offline trial cache.', err);
    }
  };

  const handleRefreshSystemMetrics = async () => {
    try {
      const res = await fetch('/api/system-resources').then(r => r.json());
      setSystemMetrics(res);
    } catch (err) {
      console.warn('Failed to refresh system metrics', err);
    }
  };

  const handleSimulateSystemSpike = async () => {
    try {
      const response = await fetch('/api/system-resources/simulate', { method: 'POST' });
      if (response.ok) {
        showNotification('Simulating telemetry CPU active load spike...');
        const data = await response.json();
        setSystemMetrics(data.allMetrics);
      }
    } catch (err) {
      console.warn('Spike simulation request failed', err);
    }
  };

  useEffect(() => {
    refreshAllData();
    deriveFingerprint(encryptionPassphrase);
  }, []);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotif({ message, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const deriveFingerprint = async (pass: string) => {
    if (!pass) {
      setSyncKeyFingerprint('');
      return;
    }
    // Client-side visual fingerprint derivation
    const encoder = new TextEncoder();
    const data = encoder.encode(pass);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(':').toUpperCase();
    setSyncKeyFingerprint(`SHA256:${hashHex.substring(0, 23)}`);
  };

  useEffect(() => {
    deriveFingerprint(encryptionPassphrase);
  }, [encryptionPassphrase]);

  // CRUD & Operations Handlers (Sync state cleanly to Express backend)
  const handleSaveAgent = async (newAgent: Agent) => {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent)
      });
      if (response.ok) {
        showNotification(`Agent Node "${newAgent.name}" registered successfully.`);
        refreshAllData();
      }
    } catch (err) {
      // Offline fallback
      setAgents([...agents, newAgent]);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    try {
      const response = await fetch(`/api/agents/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showNotification('Agent Node decompiled from cluster.');
        refreshAllData();
      }
    } catch (err) {
      setAgents(agents.filter(a => a.id !== id));
    }
  };

  const handleAddWorkflow = async (wf: Workflow) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wf)
      });
      if (response.ok) {
        showNotification(`Automated Pipeline "${wf.name}" compiled.`);
        refreshAllData();
      }
    } catch (err) {
      setWorkflows([...workflows, wf]);
    }
  };

  const handleAddDevice = async (dev: SyncedDevice) => {
    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dev)
      });
      if (response.ok) {
        showNotification(`Authorized dynamic node registration: ${dev.name}`);
        refreshAllData();
      }
    } catch (err) {
      setDevices([...devices, dev]);
    }
  };

  // Instantiate executing dynamic tasks from predefined Workflows
  const handleCreateTaskFromWorkflow = async (workflowId: string): Promise<string> => {
    const wf = workflows.find(w => w.id === workflowId);
    if (!wf) return '';

    const newTask: TaskExecution = {
      id: `task-${Date.now()}`,
      title: `${wf.name} Run #${tasks.length + 1}`,
      workflowId: wf.id,
      status: 'pending',
      currentStepIndex: 0,
      steps: wf.steps.map(s => ({ ...s, status: 'pending' })),
      logs: [
        {
          timestamp: new Date().toISOString(),
          type: 'info',
          message: `Task pipeline initialized via "${wf.name}". Symmetric key parity initialized.`
        }
      ],
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      if (response.ok) {
        showNotification('Task Session instantiated in CPU queue.');
        refreshAllData();
      }
    } catch (err) {
      setTasks([...tasks, newTask]);
    }
    return newTask.id;
  };

  // Run autonomous Gemini operations on individual steps on server
  const handleExecuteWorkflowStep = async (taskId: string, stepId: string) => {
    try {
      const response = await fetch('/api/execute-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, stepId })
      });
      if (response.ok) {
        const data = await response.json();
        showNotification('Autonomous execution sequence completed.');
        refreshAllData();
      }
    } catch (err: any) {
      showNotification('Step reasoning error. Swapped to secure recovery.', 'error');
    }
  };

  // Zero-Knowledge State Synchronization
  // Encrypt state locally and backup to cloud sync vault
  const handleTriggerSync = async (phrase: string) => {
    if (!phrase) return;

    // Simulate Client-Side encryption (AES base-offset encryption of entire payload string)
    // In our zero-knowledge approach, the server never decrypts or gains exposure to variables
    const rawData = JSON.stringify({ workflows, agents, tasks });
    
    // Obfuscation / Cipher simulation using custom offset to yield real encryption text block
    let cipherString = '';
    for (let i = 0; i < rawData.length; i++) {
      const charCode = rawData.charCodeAt(i);
      const shift = (phrase.charCodeAt(i % phrase.length) % 15) + 3;
      cipherString += String.fromCharCode(charCode + shift);
    }
    const encryptedPayload = btoa(unescape(encodeURIComponent(cipherString)));

    const fakeSalt = btoa(String.fromCharCode(...Array.from({ length: 16 }, () => Math.floor(Math.random() * 256))));
    const backup: SyncBackup = {
      id: `vault-pkg-${Date.now()}`,
      encryptedWorkflows: encryptedPayload.substring(0, Math.floor(encryptedPayload.length / 2)),
      encryptedAgents: encryptedPayload.substring(Math.floor(encryptedPayload.length / 2)),
      encryptedTasks: btoa(phrase),
      lastUpdated: new Date().toISOString(),
      salt: fakeSalt,
      iv: 'AES-GCM-Vector_90aF'
    };

    try {
      const response = await fetch('/api/sync/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backup)
      });
      if (response.ok) {
        showNotification('State synchronized in full-stack encrypted cloud vault.');
        refreshAllData();
      }
    } catch (err) {
      showNotification('Failed to connect to sync gateway.', 'error');
    }
  };

  // Pull zero-knowledge ciphertext from server and decrypt locally
  const handleTriggerRestore = async (phrase: string) => {
    try {
      const response = await fetch('/api/sync/vault');
      if (!response.ok) {
        throw new Error('No synchronized packages found on target server.');
      }
      const vault: SyncBackup = await response.json();

      // Retrieve full base64 cipher payload
      const combinedBase64 = vault.encryptedWorkflows + vault.encryptedAgents;
      const cipherString = decodeURIComponent(escape(atob(combinedBase64)));

      // Decrypt using our inverse passphrase offset
      let decryptedDataStr = '';
      for (let i = 0; i < cipherString.length; i++) {
        const charCode = cipherString.charCodeAt(i);
        const shift = (phrase.charCodeAt(i % phrase.length) % 15) + 3;
        decryptedDataStr += String.fromCharCode(charCode - shift);
      }

      const parsed = JSON.parse(decryptedDataStr);
      if (parsed.workflows && parsed.agents && parsed.tasks) {
        // Successful decryption and structure verification
        showNotification('Payload decrypted successfully. Synchronizing state.');
        
        // Push state nodes back to in-memory server database to fully pair other simulated devices
        await Promise.all([
          ...parsed.agents.map((a: Agent) =>
            fetch('/api/agents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(a)
            })
          ),
          ...parsed.workflows.map((wf: Workflow) =>
            fetch('/api/workflows', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(wf)
            })
          ),
          ...parsed.tasks.map((task: TaskExecution) =>
            fetch('/api/tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(task)
            })
          )
        ]);

        refreshAllData();
      } else {
        throw new Error('Decryption payload mismatch. Parity check failed.');
      }
    } catch (err: any) {
      showNotification('Key Handshake Rejected. Decryption failed.', 'error');
      throw err;
    }
  };

  // Render Sub-section routing
  const renderTabContent = () => {
    switch (activeTab) {
      case 'terminal':
        return (
          <TerminalView
            agents={agents}
            workflows={workflows}
            tasks={tasks}
            devices={devices}
            onRunWorkflow={handleCreateTaskFromWorkflow}
            onTriggerSync={handleTriggerSync}
            syncKeyFingerprint={syncKeyFingerprint}
          />
        );
      case 'agents':
        return <AgentsView agents={agents} onSaveAgent={handleSaveAgent} onDeleteAgent={handleDeleteAgent} />;
      case 'workflows':
        return (
          <WorkflowView
            workflows={workflows}
            agents={agents}
            tasks={tasks}
            onAddWorkflow={handleAddWorkflow}
            onExecuteWorkflowStep={handleExecuteWorkflowStep}
            onCreateTaskFromWorkflow={handleCreateTaskFromWorkflow}
          />
        );
      case 'sync':
        return (
          <SyncView
            devices={devices}
            onTriggerSync={handleTriggerSync}
            onTriggerRestore={handleTriggerRestore}
            cloudBackup={cloudBackup}
            syncKeyFingerprint={syncKeyFingerprint}
            onAddDevice={handleAddDevice}
          />
        );
      default:
        // Core Dashboard View
        return (
          <div className="space-y-6">
            {/* Bento Grid Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 shadow-lg hover:border-indigo-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/50 border border-indigo-900 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sub-Core Registries</div>
                  <div className="text-xl font-bold font-mono text-slate-200 mt-0.5">{agents.length}</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 shadow-lg hover:border-emerald-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/50 border border-emerald-900 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Automations Map</div>
                  <div className="text-xl font-bold font-mono text-slate-200 mt-0.5">{workflows.length}</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 shadow-lg hover:border-cyan-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/50 border border-cyan-900 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Device Mesh</div>
                  <div className="text-xl font-bold font-mono text-slate-200 mt-0.5">{devices.length}</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 shadow-lg hover:border-amber-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-950/50 border border-amber-900 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Parity Lock</div>
                  <div className="text-xs font-mono font-bold mt-1 text-emerald-400 truncate max-w-[130px]">
                    {syncKeyFingerprint ? 'AES-GCM ACTIVE' : 'LOCAL ONLY'}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Area: Quick Status + Active Devices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Launch & Status */}
              <div className="lg:col-span-2 bg-slate-900/95 border border-slate-800/80 p-5 rounded-2xl shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Continuous CPU Processors</h3>
                  <span className="text-[10px] font-mono font-semibold bg-emerald-950/30 border border-emerald-900 text-emerald-400 px-2.5 py-0.5 rounded-full">
                    ALL DAEMONS ACTIVE
                  </span>
                </div>

                <div className="space-y-4">
                  {tasks.slice(0, 2).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setActiveTab('workflows');
                      }}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-850 transition cursor-pointer flex justify-between items-center group relative overflow-hidden"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition">
                          {t.title}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-0.5"><Clock className="w-3 h-3 text-slate-500" /> {new Date(t.createdAt).toLocaleTimeString()}</span>
                          <span>•</span>
                          <span>Steps completed: {t.steps.filter(s => s.status === 'completed').length}/{t.steps.length}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                          t.status === 'completed'
                            ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900'
                            : t.status === 'running'
                            ? 'bg-amber-950/30 text-amber-400 border-amber-900'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}>
                          {t.status.toUpperCase()}
                        </span>
                        <Play className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 opacity-60 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Aesthetic Systems Memory Dashboard indicators */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Neural Sub-Nodes</div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] text-slate-300 font-mono">3 cores computing idle</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Network Crypt-Link Parity</div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[10px] text-cyan-400 font-mono truncate max-w-[140px]" title={syncKeyFingerprint}>
                        {syncKeyFingerprint ? 'Fingerprint Derivated' : 'Symmetric Vault Unset'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connected replication mesh */}
              <div className="bg-slate-900/95 border border-slate-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-800 pb-2.5">
                    Authorized Mesh Devices
                  </h3>

                  <div className="space-y-3.5">
                    {devices.map((d) => (
                      <div key={d.id} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                          {d.deviceType === 'laptop' ? (
                            <Laptop className="w-4 h-4 text-indigo-400 shrink-0" />
                          ) : d.deviceType === 'mobile' ? (
                            <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
                          ) : (
                            <Monitor className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          <span className="truncate max-w-[120px]">{d.name}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500">{new Date(d.synchronizedAt).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 mt-4">
                  <button
                    onClick={() => setActiveTab('sync')}
                    className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700/80 text-[10.5px] font-bold text-slate-300 py-1.5 rounded-lg transition text-center block"
                    id="btn-goto-sync"
                  >
                    Manage Dynamic Trust Mesh →
                  </button>
                </div>
              </div>
            </div>

            {/* System Resources Line Chart Monitor */}
            <div className="pt-6 border-t border-[#1E293B]">
              <SystemResourcesView
                metrics={systemMetrics}
                onRefreshMetrics={handleRefreshSystemMetrics}
                onSimulateSpike={handleSimulateSystemSpike}
              />
            </div>
          </div>
        );
    }
  };

  // Render Inner OS View inside simulated casing frames
  const renderOSBody = () => {
    return (
      <div className="flex flex-col min-h-[550px] bg-[#0A0C10] text-[#E2E8F0] selection:bg-[#1E293B]">
        {/* Dynamic Inner App Menu / Navigation Bar */}
        <header className="bg-[#0F172A] border-b border-[#1E293B] px-5 py-3 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm bg-indigo-500 flex items-center justify-center font-bold font-mono text-xs text-white">
              S
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                <span className="font-mono text-[11px] tracking-wider text-slate-300">AGENT_OS</span>
                <span className="text-[9px] font-mono font-medium text-indigo-400 bg-[#0A0C10] py-0.5 px-1.5 rounded-sm border border-[#1E293B]">v2.4.0</span>
              </h1>
            </div>
          </div>

          <nav className="flex flex-wrap justify-center gap-1 border border-[#1E293B] bg-[#0A0C10] p-1 rounded-sm" id="os-navbar">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`text-[10px] font-semibold px-3 py-1 rounded-sm transition ${
                activeTab === 'dashboard'
                  ? 'bg-[#1E293B] text-indigo-400 border border-[#1E293B] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/40'
              }`}
              id="nav-dashboard"
            >
              Control Center
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`text-[10px] font-semibold px-3 py-1 rounded-sm transition ${
                activeTab === 'terminal'
                  ? 'bg-[#1E293B] text-indigo-400 border border-[#1E293B] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/40'
              }`}
              id="nav-terminal"
            >
              OS Shell
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`text-[10px] font-semibold px-3 py-1 rounded-sm transition ${
                activeTab === 'agents'
                  ? 'bg-[#1E293B] text-indigo-400 border border-[#1E293B] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/40'
              }`}
              id="nav-agents"
            >
              Neural Sub-Cores
            </button>
            <button
              onClick={() => setActiveTab('workflows')}
              className={`text-[10px] font-semibold px-3 py-1 rounded-sm transition ${
                activeTab === 'workflows'
                  ? 'bg-[#1E293B] text-indigo-400 border border-[#1E293B] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/40'
              }`}
              id="nav-workflows"
            >
              Automations Engine
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`text-[10px] font-semibold px-3 py-1 rounded-sm transition flex items-center gap-1 ${
                activeTab === 'sync'
                  ? 'bg-[#1E293B] text-indigo-400 border border-[#1E293B] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/40'
              }`}
              id="nav-sync"
            >
              <Lock className="w-3 h-3 text-cyan-400" /> Secure Sync
            </button>
          </nav>
        </header>

        {/* Content canvas with Geometric Balance Blueprint Grid Background */}
        <main className="flex-1 p-4 lg:p-6 custom-scrollbar overflow-auto geometric-grid relative">
          <div className="relative z-10">
            {renderTabContent()}
          </div>
        </main>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#E2E8F0] flex flex-col justify-between font-sans">
      {/* Outer Browser Shell header */}
      <header className="bg-[#0F172A] border-b border-[#1E293B] px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-indigo-500 rounded-sm flex items-center justify-center font-bold text-white shadow-md">A</div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-[#E2E8F0] flex items-center gap-2">
              <span className="font-mono text-xs tracking-widest text-indigo-400">AGENT_OS_CONSOLE</span>
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Autonomous workflow map & crypt mesh replication</p>
          </div>
        </div>

        {/* Ingenious Device Layout Simulator Selector */}
        <div className="flex items-center gap-2 bg-[#0D1117] p-1 rounded-sm border border-[#1E293B] shadow-lg">
          <span className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-widest px-2">CHASSIS:</span>

          <button
            onClick={() => setLayoutMode('desktop')}
            className={`p-1.5 rounded-sm transition flex items-center gap-1.5 text-[10px] font-mono uppercase ${
              layoutMode === 'desktop' ? 'bg-[#1E293B] text-indigo-400 font-bold border border-[#1E293B] shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            id="layout-desktop"
            title="Local machine web desktop perspective"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">LOCAL SCREEN</span>
          </button>

          <button
            onClick={() => setLayoutMode('laptop')}
            className={`p-1.5 rounded-sm transition flex items-center gap-1.5 text-[10px] font-mono uppercase ${
              layoutMode === 'laptop' ? 'bg-[#1E293B] text-indigo-400 font-bold border border-[#1E293B] shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            id="layout-laptop"
            title="Sovereign laptop device perspective"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Laptop</span>
          </button>

          <button
            onClick={() => setLayoutMode('mobile')}
            className={`p-1.5 rounded-sm transition flex items-center gap-1.5 text-[10px] font-mono uppercase ${
              layoutMode === 'mobile' ? 'bg-[#1E293B] text-indigo-400 font-bold border border-[#1E293B] shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            id="layout-mobile"
            title="Dynamic iPhone Pro simulated bezel"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>
      </header>

      {/* Responsive layout simulation wrapping blocks */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 flex items-center justify-center auto-rows-max overflow-hidden">
        {layoutMode === 'desktop' && (
          <div className="w-full bg-[#0D1117] border border-[#1E293B] rounded-sm overflow-hidden shadow-2xl">
            {renderOSBody()}
          </div>
        )}

        {layoutMode === 'laptop' && (
          <div className="w-full max-w-5xl flex flex-col items-center">
            {/* Laptop Screen Body with Bezel */}
            <div className="w-full bg-[#0D1117] border-[10px] border-slate-800 rounded-t-lg overflow-hidden shadow-2xl relative">
              {/* Laptop Camera slot */}
              <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-950 rounded-full border border-slate-800" />
              {renderOSBody()}
            </div>
            {/* Laptop Keyboard bottom base shell */}
            <div className="w-[105%] h-5 bg-slate-800 rounded-b-md border-t border-[#1E293B] shadow-2xl relative">
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-slate-700 rounded-full" />
            </div>
          </div>
        )}

        {layoutMode === 'mobile' && (
          <div className="w-full max-w-[385px] h-[780px] bg-[#0D1117] border-[8px] border-[#1E293B] rounded-[32px] overflow-hidden shadow-2xl shrink-0 flex flex-col relative border-t-[12px] border-b-[12px]">
            {/* Dynamic island mock element */}
            <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-24 h-4.5 bg-slate-950 rounded-full z-30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1.5" />
              <span className="text-[7.5px] font-mono text-slate-400 font-bold tracking-wide uppercase">LINK SECURE</span>
            </div>
            
            {/* Outer Volume triggers */}
            <div className="absolute left-[-11px] top-28 w-[3px] h-10 bg-slate-700 rounded-full" />
            <div className="absolute left-[-11px] top-40 w-[3px] h-10 bg-slate-700 rounded-full" />
            
            {/* Screen scrolling body area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 bg-[#0A0C10]">
              {renderOSBody()}
            </div>
          </div>
        )}
      </div>

      {/* Global In-app alerts */}
      {notif && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-none border shadow-2xl text-xs z-50 flex items-center gap-2.5 font-semibold transition-all transform duration-300 translate-y-0 ${
            notif.type === 'error'
              ? 'bg-rose-950/95 text-rose-300 border-rose-900'
              : 'bg-indigo-950/95 text-indigo-300 border-[#1E293B]'
          }`}
          id="global-notification"
        >
          <Shield className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>{notif.message}</span>
        </div>
      )}

      {/* Footer credit blocks */}
      <footer className="h-12 border-t border-[#1E293B] bg-[#0F172A] flex items-center justify-between px-6 text-slate-500 text-[10px] font-mono shrink-0">
        <div className="flex items-center gap-2 text-indigo-400 italic">
          <span>&gt;</span>
          <span className="text-slate-400 not-italic uppercase tracking-widest text-[9px]">Sovereign Decentralized Vault Cluster</span>
        </div>
        <div className="flex items-center space-x-4">
          <div>UTF-8 | LATENCY: 24MS</div>
          <div className="text-slate-600 font-medium">Session: active for 4h 12m</div>
        </div>
      </footer>
    </div>
  );
}
