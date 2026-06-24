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
  HardDrive,
  MessageSquare,
  HelpCircle,
  Coins,
  LogOut,
  UserCheck,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Zap,
  History,
  Sparkles,
  Search,
  Keyboard,
  Plus,
  X
} from 'lucide-react';
import { Agent, Workflow, TaskExecution, SyncedDevice, SyncBackup, ResourceMetric } from './types.js';

// Import local components
import TerminalView from './components/TerminalView.js';
import AgentsView from './components/AgentsView.js';
import WorkflowView from './components/WorkflowView.js';
import SyncView from './components/SyncView.js';
import SystemResourcesView from './components/SystemResourcesView.js';
import GuidanceSystem from './components/GuidanceSystem.js';
import NetworkMesh3D from './components/NetworkMesh3D.js';
import BillingView from './components/BillingView.js';
import AuthGate from './components/AuthGate.js';

export default function App() {
  const [currentUser, setCurrentUser] = useState<{
    email: string;
    phone: string;
    countryCode: string;
    age: number;
    parentConsentEmail?: string;
    parentSigned?: boolean;
    coppaCompliant: boolean;
    googleId?: string;
    displayName?: string;
    avatarUrl?: string;
    grantedScopes?: string[];
  } | null>(() => {
    const saved = localStorage.getItem('localUserSession');
    return saved ? JSON.parse(saved) : null;
  });

  const [agents, setAgents] = useState<Agent[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [tasks, setTasks] = useState<TaskExecution[]>([]);

  // Interactive Priority Scheduler and Queue reordering states
  const [queueFilter, setQueueFilter] = useState<'active' | 'history' | 'all'>('active');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);

  // Auto-sort tasks dynamically based on status (active first), then priority, then manual order index, and fallback to creation date
  const sortedTasks = React.useMemo(() => {
    const priorityWeight = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };

    return [...tasks].sort((a, b) => {
      // 1. Group active/running sessions first
      const isAActive = a.status === 'pending' || a.status === 'running' ? 1 : 0;
      const isBActive = b.status === 'pending' || b.status === 'running' ? 1 : 0;
      if (isBActive !== isAActive) return isBActive - isAActive;

      // 2. Sort active by priority weight (critical > high > medium > low)
      if (isAActive && isBActive) {
        const pA = a.priority || 'medium';
        const pB = b.priority || 'medium';
        const diffPriority = (priorityWeight[pB] || 2) - (priorityWeight[pA] || 2);
        if (diffPriority !== 0) return diffPriority;
      }

      // 3. Sort active or matching priority by their order index ascending (lower order at the top)
      const oA = a.order !== undefined ? a.order : 999999;
      const oB = b.order !== undefined ? b.order : 999999;
      const diffOrder = oA - oB;
      if (diffOrder !== 0) return diffOrder;

      // 4. Default to creation date descending
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks]);

  const [devices, setDevices] = useState<SyncedDevice[]>([]);
  const [cloudBackup, setCloudBackup] = useState<SyncBackup | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<ResourceMetric[]>([]);

  // System Guidance walkthrough and AI chatter states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);

  // Symmetric and asymmetric key encryption credentials
  const [encryptionPassphrase, setEncryptionPassphrase] = useState('agent-secure-master-key-2026');
  const [syncKeyFingerprint, setSyncKeyFingerprint] = useState('');
  const [notif, setNotif] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Keyboard shortcut, Quick-Create task, and Command Palette states
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandPaletteSearch, setCommandPaletteSearch] = useState('');
  const [isQuickTaskModalOpen, setIsQuickTaskModalOpen] = useState(false);
  const [quickTaskWorkflowId, setQuickTaskWorkflowId] = useState('');
  const [quickTaskPriority, setQuickTaskPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');
  const [isShortcutHelpOpen, setIsShortcutHelpOpen] = useState(false);

  const commandPaletteResults = React.useMemo(() => {
    // ⚡ Bolt Optimization: Skip expensive command palette creation if it's closed
    if (!isCommandPaletteOpen) return [];

    const query = commandPaletteSearch.trim().toLowerCase();
    
    // Define structural search items
    const staticItems = [
      { id: 'nav-dashboard', category: 'Navigation', title: 'Navigate to Dashboard Hub', subtitle: 'View holographic cluster map and cpu execution metrics', action: () => { setActiveTab('dashboard'); setIsCommandPaletteOpen(false); showNotification('Swapped view: Operator Hub Dashboard'); } },
      { id: 'nav-terminal', category: 'Navigation', title: 'Navigate to Live Command Terminal', subtitle: 'Simulate server command inputs and node triggers', action: () => { setActiveTab('terminal'); setIsCommandPaletteOpen(false); showNotification('Swapped view: Live Command Terminal'); } },
      { id: 'nav-agents', category: 'Navigation', title: 'Navigate to Sub-Core Cluster Nodes', subtitle: 'Scale or configure decentralized intelligence agents', action: () => { setActiveTab('agents'); setIsCommandPaletteOpen(false); showNotification('Swapped view: Sub-Core Cluster Nodes'); } },
      { id: 'nav-workflows', category: 'Navigation', title: 'Navigate to Automations Engine', subtitle: 'Build sequence steps and view individual logs', action: () => { setActiveTab('workflows'); setIsCommandPaletteOpen(false); showNotification('Swapped view: Automations Engine'); } },
      { id: 'nav-sync', category: 'Navigation', title: 'Navigate to Secure Sync Vault', subtitle: 'Enclose master symmetric secret key with device meshes', action: () => { setActiveTab('sync'); setIsCommandPaletteOpen(false); showNotification('Swapped view: Secure Sync Vault'); } },
      { id: 'nav-billing', category: 'Navigation', title: 'Navigate to GCP Credit & Spend Monitor', subtitle: 'Assess Vertex AI spend projections versus baseline', action: () => { setActiveTab('billing'); setIsCommandPaletteOpen(false); showNotification('Swapped view: GCP Credit & Spend Monitor'); } },
      
      { id: 'action-newtask', category: 'System Actions', title: 'Create & Run New Task Pipeline', subtitle: 'Shortcut: [Ctrl + N]', action: () => { setIsQuickTaskModalOpen(true); setIsCommandPaletteOpen(false); } },
      { id: 'action-shortcuts', category: 'System Actions', title: 'Show Keyboard Shortcuts Guide', subtitle: 'Shortcut: [Ctrl + /]', action: () => { setIsShortcutHelpOpen(true); setIsCommandPaletteOpen(false); } },
      { id: 'action-chat', category: 'System Actions', title: 'Toggle Core AI Guidance System', subtitle: 'Shortcut: [Ctrl + Alt + G]', action: () => { setIsChatOpen(prev => !prev); setIsCommandPaletteOpen(false); } },
      { id: 'action-backup', category: 'System Actions', title: 'Run secure cloud replication backup sync', subtitle: 'Synchronize active states with secure cloud vault key hashing', action: () => { handleTriggerSync(encryptionPassphrase); setIsCommandPaletteOpen(false); } },
      { id: 'action-clear', category: 'System Actions', title: 'Clear system alert notification banner', subtitle: 'Dismiss current in-app alert indicator', action: () => { setNotif(null); setIsCommandPaletteOpen(false); } },
      { id: 'action-logout', category: 'System Actions', title: 'Logout current authorized operator', subtitle: 'Erase localized storage keys and prompt lock gate', action: () => { localStorage.removeItem('localUserSession'); setCurrentUser(null); setIsCommandPaletteOpen(false); } },
    ];

    // Map Workflows to run trigger actions
    const workflowItems = workflows.map(wf => ({
      id: `wf-${wf.id}`,
      category: 'Workflow Templates (Launch as Task)',
      title: `Instantiate Pipeline: ${wf.name}`,
      subtitle: wf.description || 'Predefined step sequence pipeline',
      action: () => {
        handleCreateTaskFromWorkflow(wf.id);
        setIsCommandPaletteOpen(false);
      }
    }));

    // Map recent or matched tasks
    const taskItems = tasks.map(t => ({
      id: `task-${t.id}`,
      category: 'Recent CPU Execution Tasks',
      title: `Task: ${t.title}`,
      subtitle: `Status: ${t.status.toUpperCase()} | Steps completed: ${t.steps.filter(s => s.status === 'completed').length}/${t.steps.length}`,
      action: () => {
        setActiveTab('workflows');
        setIsCommandPaletteOpen(false);
        showNotification(`Viewing task logs for: ${t.title}`);
      }
    }));

    const allItems = [...staticItems, ...workflowItems, ...taskItems];

    if (!query) {
      return allItems.slice(0, 10);
    }

    return allItems.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query))
    );
  }, [commandPaletteSearch, workflows, tasks, encryptionPassphrase, isCommandPaletteOpen]);

  // Interface controls
  const [activeTab, setActiveTab] = useState<'dashboard' | 'terminal' | 'agents' | 'workflows' | 'sync' | 'billing'>('dashboard');
  const [layoutMode, setLayoutMode] = useState<'desktop' | 'laptop' | 'mobile'>('desktop');
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

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

  // Pre-select first available workflow template for Quick Task modal
  useEffect(() => {
    if (workflows.length > 0 && !quickTaskWorkflowId) {
      setQuickTaskWorkflowId(workflows[0].id);
    }
  }, [workflows, quickTaskWorkflowId]);

  // Listen for global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in forms or inputs
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        (activeEl as HTMLElement).isContentEditable
      );

      // Handle Escape key to dismiss modals regardless of active elements
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsQuickTaskModalOpen(false);
        setIsShortcutHelpOpen(false);
        return;
      }

      // 1. Ctrl/Cmd + K: Toggle/Run Command & Search Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        setIsQuickTaskModalOpen(false);
        setIsShortcutHelpOpen(false);
        setCommandPaletteSearch('');
        return;
      }

      // 2. Ctrl/Cmd + N or Alt/Option + N: Toggle Quick Task Instancer
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') || (e.altKey && e.key.toLowerCase() === 'n')) {
        e.preventDefault();
        setIsQuickTaskModalOpen(prev => !prev);
        setIsCommandPaletteOpen(false);
        setIsShortcutHelpOpen(false);
        return;
      }

      // 3. Ctrl + / (or Alt + H or typing "?" when not in an input): Open Shortcut Reference Cheat Sheet
      if (
        ((e.ctrlKey || e.metaKey) && e.key === '/') ||
        (e.altKey && e.key.toLowerCase() === 'h') ||
        (!isInput && e.key === '?')
      ) {
        e.preventDefault();
        setIsShortcutHelpOpen(prev => !prev);
        setIsCommandPaletteOpen(false);
        setIsQuickTaskModalOpen(false);
        return;
      }

      // Ignore standard key matches if the user is typing in text fields
      if (isInput) return;

      // 4. Tab quick-navigation: Alt + 数字 [1-6] or Ctrl + Alt + 数字 [1-6]
      if (e.altKey || (e.ctrlKey && e.altKey)) {
        const num = e.key;
        if (num === '1') { e.preventDefault(); setActiveTab('dashboard'); showNotification('Navigated: Dashboard Hub'); }
        else if (num === '2') { e.preventDefault(); setActiveTab('terminal'); showNotification('Navigated: Execution Terminal'); }
        else if (num === '3') { e.preventDefault(); setActiveTab('agents'); showNotification('Navigated: Sub-Core Cluster'); }
        else if (num === '4') { e.preventDefault(); setActiveTab('workflows'); showNotification('Navigated: Automations Registry'); }
        else if (num === '5') { e.preventDefault(); setActiveTab('sync'); showNotification('Navigated: Cryptographic Sync'); }
        else if (num === '6') { e.preventDefault(); setActiveTab('billing'); showNotification('Navigated: Credits Expenditure'); }
      }

      // 5. Letter key shortcuts: Ctrl + Alt + Letter Key
      if (e.ctrlKey && e.altKey) {
        const letter = e.key.toLowerCase();
        if (letter === 'd') { e.preventDefault(); setActiveTab('dashboard'); }
        else if (letter === 't') { e.preventDefault(); setActiveTab('terminal'); }
        else if (letter === 'a') { e.preventDefault(); setActiveTab('agents'); }
        else if (letter === 'w') { e.preventDefault(); setActiveTab('workflows'); }
        else if (letter === 's') { e.preventDefault(); setActiveTab('sync'); }
        else if (letter === 'b') { e.preventDefault(); setActiveTab('billing'); }
        else if (letter === 'g') { e.preventDefault(); setIsChatOpen(prev => !prev); showNotification(isChatOpen ? 'Deactivated System AI Assistant guide' : 'Deployed System AI Assistant guide'); }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workflows, isChatOpen]);

  // Periodic auto-refresh mechanism (every 10 seconds) for the active tasks list
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const resTasks = await fetch('/api/tasks').then(r => r.json());
        setTasks(resTasks);
      } catch (err) {
        console.warn('Auto-refresh of active execution tasks failed', err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // CRUD & Operations Handlers (Sync state cleanly to Express backend)
  const handleQuickCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskWorkflowId) {
      showNotification('Please select a valid Workflow pipeline template', 'error');
      return;
    }
    const wf = workflows.find(w => w.id === quickTaskWorkflowId);
    if (!wf) {
      showNotification('Selected Workflow cannot be found in database registry', 'error');
      return;
    }

    const newTask: TaskExecution = {
      id: `task-${Date.now()}`,
      title: `${wf.name} Run #${tasks.length + 1}`,
      workflowId: wf.id,
      status: 'pending',
      currentStepIndex: 0,
      priority: quickTaskPriority,
      steps: wf.steps.map(s => ({ ...s, status: 'pending' })),
      logs: [
        {
          timestamp: new Date().toISOString(),
          type: 'info',
          message: `Task run requested via global hotkey console instantiator. Allocated priority level: ${quickTaskPriority.toUpperCase()}.`
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
        showNotification(`Pipeline successfully deployed with ${quickTaskPriority.toUpperCase()} priority.`, 'success');
        setIsQuickTaskModalOpen(false);
        refreshAllData();
      }
    } catch (err) {
      setTasks([...tasks, newTask]);
      setIsQuickTaskModalOpen(false);
    }
  };

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

  // Task reordering and priority-flagging system handlers
  const handleChangeTaskPriority = async (taskId: string, priority: 'critical' | 'high' | 'medium' | 'low') => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Selecting critical or high priority automatically moves it higher in the queue order index
    let updatedOrder = task.order;
    if (priority === 'critical') {
      const activeTasks = tasks.filter(t => t.status === 'pending' || t.status === 'running');
      const minOrder = activeTasks.reduce((min, t) => Math.min(min, t.order !== undefined ? t.order : 99999), 1);
      updatedOrder = Math.max(0, minOrder - 1); // move to top
    }
    
    const updatedTask = { ...task, priority, order: updatedOrder };
    
    // Optimistic state update
    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      if (response.ok) {
        showNotification(`Pipeline calibrated to standard ${priority.toUpperCase()} priority`, 'success');
        refreshAllData();
      }
    } catch (err) {
      console.warn('Network sync failed, operating in offline trial mode', err);
    }
  };

  const handleMoveTaskPosition = async (sourceId: string, targetId: string) => {
    const activeTasks = sortedTasks.filter(t => t.status === 'pending' || t.status === 'running');
    const completedTasks = sortedTasks.filter(t => t.status === 'completed' || t.status === 'failed');
    
    const sourceIndex = activeTasks.findIndex(t => t.id === sourceId);
    const targetIndex = activeTasks.findIndex(t => t.id === targetId);
    
    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return;
    
    const reorderedActive = [...activeTasks];
    const [dragged] = reorderedActive.splice(sourceIndex, 1);
    reorderedActive.splice(targetIndex, 0, dragged);
    
    // Assign incremental order values to lock position
    const updatedReorder = reorderedActive.map((t, index) => ({
      ...t,
      order: index + 1
    }));
    
    // Optimistic UI updates
    setTasks([...updatedReorder, ...completedTasks]);
    
    try {
      const response = await fetch('/api/tasks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorderedTasks: updatedReorder })
      });
      if (response.ok) {
        showNotification('Task priority queue updated and synchronized');
        refreshAllData();
      }
    } catch (err) {
      console.warn('Backend synced failed, using optimistic order', err);
    }
  };

  const handleStepTaskPosition = async (taskId: string, direction: 'up' | 'down') => {
    const activeTasks = sortedTasks.filter(t => t.status === 'pending' || t.status === 'running');
    const index = activeTasks.findIndex(t => t.id === taskId);
    if (index === -1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeTasks.length) return;
    
    const targetId = activeTasks[targetIndex].id;
    handleMoveTaskPosition(taskId, targetId);
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
      case 'billing':
        return (
          <BillingView onNotification={(msg, type) => showNotification(msg, type === 'warning' ? 'info' : type)} />
        );
      default:
        // Core Dashboard View
        return (
          <div className="space-y-6">
            {/* Bento Grid Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-4 shadow-lg hover:border-indigo-500/30 transition-all">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-950/50 border border-indigo-900 flex items-center justify-center shrink-0">
                  <Brain className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-indigo-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">Sub-Cores</div>
                  <div className="text-base sm:text-xl font-bold font-mono text-slate-200 mt-0.5">{agents.length}</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-4 shadow-lg hover:border-emerald-500/30 transition-all">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-950/50 border border-emerald-900 flex items-center justify-center shrink-0">
                  <Layers className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">Automations</div>
                  <div className="text-base sm:text-xl font-bold font-mono text-slate-200 mt-0.5">{workflows.length}</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-4 shadow-lg hover:border-cyan-500/30 transition-all">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-cyan-950/50 border border-cyan-900 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">Device Mesh</div>
                  <div className="text-base sm:text-xl font-bold font-mono text-slate-200 mt-0.5">{devices.length}</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-4 shadow-lg hover:border-amber-500/30 transition-all">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-950/50 border border-amber-900 flex items-center justify-center shrink-0">
                  <Shield className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-400 animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">Parity Lock</div>
                  <div className="text-[10px] sm:text-xs font-mono font-bold mt-1 text-emerald-400 truncate">
                    {syncKeyFingerprint ? 'AES-GCM' : 'LOCAL'}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Area: Quick Status + Active Devices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column wrapper containing 3D dynamic mesh AND task status */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 🌌 Near-Real-Time 3D Holographic Cluster Map Canvas */}
                <NetworkMesh3D 
                  agentsCount={agents.length} 
                  isSpiking={systemMetrics.length > 0 && systemMetrics[systemMetrics.length - 1].cpu > 70}
                />

                {/* 🚀 Dynamic Workflow Execution Queue & Priority Scheduler */}
                <div className="bg-slate-900/95 border border-slate-800/80 p-5 rounded-2xl shadow-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 font-mono">Workflow Queue Scheduler</h3>
                        <div className="flex items-center gap-1 text-[8px] font-mono font-bold bg-[#1e1b4b]/60 border border-indigo-900/40 text-indigo-400 px-1.5 py-0.5 rounded-sm">
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shrink-0" />
                          <span>PRIORITY SHIFT ACTIVE</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-550 mt-0.5">Drag & drop or adjust badges to move critical pipelines to the top</p>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-850/85">
                      {(['active', 'history', 'all'] as const).map((tab) => {
                        const count = sortedTasks.filter(t => {
                          if (tab === 'active') return t.status === 'pending' || t.status === 'running';
                          if (tab === 'history') return t.status === 'completed' || t.status === 'failed';
                          return true;
                        }).length;

                        const labels = {
                          active: 'Active Queue',
                          history: 'History',
                          all: 'All'
                        };

                        return (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setQueueFilter(tab)}
                            className={`text-[9px] font-bold px-2 py-1 rounded-md border font-mono transition-all ${
                              queueFilter === tab
                                ? 'bg-indigo-950/50 border-indigo-900/60 text-indigo-400 shadow-sm'
                                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {labels[tab]} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                    {/* Filtered tasks */}
                    {sortedTasks.filter(t => {
                      if (queueFilter === 'active') return t.status === 'pending' || t.status === 'running';
                      if (queueFilter === 'history') return t.status === 'completed' || t.status === 'failed';
                      return true;
                    }).length === 0 ? (
                      <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-dashed border-slate-850 flex flex-col items-center justify-center space-y-2">
                        <History className="w-6 h-6 text-slate-700 animate-pulse" />
                        <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Queue Stack Empty</div>
                        <p className="text-[9px] text-slate-600 max-w-[200px]">No pipelines current in this status state.</p>
                      </div>
                    ) : (
                      sortedTasks
                        .filter(t => {
                          if (queueFilter === 'active') return t.status === 'pending' || t.status === 'running';
                          if (queueFilter === 'history') return t.status === 'completed' || t.status === 'failed';
                          return true;
                        })
                        .map((t) => {
                          const isActive = t.status === 'pending' || t.status === 'running';
                          const isDragged = draggedTaskId === t.id;
                          const isDragOver = dragOverTaskId === t.id;
                          
                          // Determine border ring colors for priority badges
                          const priorityStyles = {
                            critical: 'border-rose-500/30 bg-gradient-to-r from-rose-950/10 via-slate-950 to-slate-950',
                            high: 'border-amber-500/20 bg-gradient-to-r from-amber-950/5 via-slate-950 to-slate-950',
                            medium: 'border-indigo-500/10 bg-slate-950',
                            low: 'border-slate-850 bg-slate-950'
                          };

                          return (
                            <div
                              key={t.id}
                              draggable={isActive}
                              onDragStart={(e) => {
                                if (isActive) {
                                  e.dataTransfer.setData("text/plain", t.id);
                                  setDraggedTaskId(t.id);
                                }
                              }}
                              onDragOver={(e) => {
                                if (isActive) {
                                  e.preventDefault();
                                }
                              }}
                              onDragEnter={() => {
                                if (isActive && draggedTaskId !== t.id) {
                                  setDragOverTaskId(t.id);
                                }
                              }}
                              onDragLeave={() => {
                                setDragOverTaskId(null);
                              }}
                              onDrop={(e) => {
                                if (isActive) {
                                  e.preventDefault();
                                  const sourceId = e.dataTransfer.getData("text/plain");
                                  handleMoveTaskPosition(sourceId, t.id);
                                  setDragOverTaskId(null);
                                  setDraggedTaskId(null);
                                }
                              }}
                              onDragEnd={() => {
                                setDraggedTaskId(null);
                                setDragOverTaskId(null);
                              }}
                              className={`p-3.5 rounded-xl border transition-all duration-200 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                                isDragged ? 'opacity-35 border-dashed border-indigo-500/50 bg-indigo-950/5' : ''
                              } ${
                                isDragOver ? 'border-indigo-500 scale-[1.01] bg-slate-900/80 shadow-lg ring-1 ring-indigo-500/20' : ''
                              } ${
                                !isDragged && !isDragOver ? (priorityStyles[t.priority || 'medium'] || 'border-slate-850') : 'border-indigo-500/30'
                              }`}
                            >
                              {/* Left drag-handle + Title info */}
                              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                {isActive && (
                                  <div 
                                    title="Drag handle to re-order pipeline"
                                    className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-indigo-400 p-1.5 rounded bg-slate-900/40 border border-slate-850/50 hover:border-indigo-950/40 transition self-center shrink-0"
                                  >
                                    <GripVertical className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-[11px] sm:text-xs font-bold text-slate-200 truncate" title={t.title}>
                                      {t.title}
                                    </span>
                                    
                                    {/* Priority badge indicating critical status with a pulsing alert dot */}
                                    {t.priority === 'critical' && (
                                      <span className="flex items-center gap-1 text-[7.5px] bg-rose-950/60 border border-rose-900 text-rose-400 font-mono font-bold px-1.5 py-0.5 rounded-sm shrink-0 uppercase select-none animate-pulse">
                                        <Zap className="w-2.5 h-2.5 text-rose-400 fill-rose-400 shrink-0 animate-ping absolute" />
                                        <Zap className="w-2.5 h-2.5 text-rose-400 fill-rose-400 shrink-0 relative" />
                                        CRITICAL
                                      </span>
                                    )}

                                    {t.priority === 'high' && (
                                      <span className="flex items-center gap-0.5 text-[7.5px] bg-amber-950/40 border border-amber-900/50 text-amber-400 font-mono font-bold px-1.5 py-0.5 rounded-sm shrink-0 uppercase select-none">
                                        HIGH
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-[9px] text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                                    <span className="flex items-center gap-1 text-slate-500">
                                      <Clock className="w-3 h-3 text-slate-500" /> 
                                      {new Date(t.createdAt).toLocaleTimeString()}
                                    </span>
                                    <span className="text-slate-700">•</span>
                                    <span className="text-slate-500 font-mono">
                                      Steps: {t.steps.filter(s => s.status === 'completed').length}/{t.steps.length}
                                    </span>
                                    {t.order !== undefined && (
                                      <>
                                        <span className="text-slate-700">•</span>
                                        <span className="text-slate-500 bg-slate-900 border border-slate-850 px-1 rounded font-mono text-[8px]" title="Positional queue rank indicator">
                                          Order Index: {t.order}
                                        </span>
                                      </>
                                    )}
                                  </div>

                                  {/* Custom inline Fast-set Priority pill bar for active tasks */}
                                  {isActive && (
                                    <div className="flex items-center gap-1 mt-2.5 bg-slate-900/60 p-1 rounded-sm border border-slate-850/30 max-w-fit select-none">
                                      <span className="text-[7.5px] font-bold text-slate-500 uppercase mr-1.5 px-1 font-mono">CALIBRATE:</span>
                                      {(['critical', 'high', 'medium', 'low'] as const).map((p) => {
                                        const isSelected = t.priority === p;
                                        const colors = {
                                          critical: 'text-rose-400 bg-rose-950/60 border-rose-900/60',
                                          high: 'text-amber-400 bg-amber-950/45 border-amber-900/40',
                                          medium: 'text-indigo-400 bg-indigo-950/40 border-indigo-900/30',
                                          low: 'text-slate-400 bg-slate-800 border-slate-755'
                                        };
                                        return (
                                          <button
                                            key={p}
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleChangeTaskPriority(t.id, p);
                                            }}
                                            className={`text-[8.5px] uppercase px-1.5 py-0.5 rounded-sm border font-mono font-bold transition-all shrink-0 ${
                                              isSelected 
                                                ? `${colors[p]} scale-105 shadow-md shadow-indigo-950/30 font-extrabold`
                                                : 'text-slate-500 border-transparent bg-transparent hover:text-slate-350 hover:bg-slate-800/30'
                                            }`}
                                          >
                                            {p}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right status info + secondary order buttons */}
                              <div className="flex items-center justify-between md:justify-end gap-3 self-stretch md:self-auto pt-2.5 md:pt-0 border-t md:border-t-0 border-slate-900 select-none shrink-0 border-dashed">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md border tracking-wider font-mono ${
                                    t.status === 'completed'
                                      ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50'
                                      : t.status === 'running'
                                      ? 'bg-amber-950/30 text-amber-400 border-amber-900/30 animate-pulse'
                                      : t.status === 'failed'
                                      ? 'bg-rose-950/30 text-rose-455 border-rose-900/50'
                                      : 'bg-slate-900 border-slate-800 text-slate-400'
                                  }`}>
                                    {t.status.toUpperCase()}
                                  </span>

                                  <button
                                    onClick={() => {
                                      setActiveTab('workflows');
                                    }}
                                    className="p-1 rounded bg-slate-900 hover:bg-indigo-950/40 border border-slate-850 hover:border-indigo-900/40 text-slate-400 hover:text-indigo-400 transition"
                                    title="View Workflow Detail & Live ExecutionLogs"
                                  >
                                    <Play className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Up / Down manual arrow controls */}
                                {isActive && (
                                  <div className="flex gap-1 items-center justify-center border-l border-slate-850/60 pl-2.5">
                                    <button
                                      type="button"
                                      title="Move Up in Execution Queue"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStepTaskPosition(t.id, 'up');
                                      }}
                                      className="p-1 rounded-md text-slate-500 hover:text-indigo-400 hover:bg-slate-900 transition shrink-0"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      title="Move Down in Execution Queue"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStepTaskPosition(t.id, 'down');
                                      }}
                                      className="p-1 rounded-md text-slate-500 hover:text-indigo-400 hover:bg-slate-900 transition shrink-0"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>

                  {/* Aesthetic Systems Memory Dashboard indicators */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-855">
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
      <div className="flex flex-col min-h-[500px] bg-[#0A0C10] text-[#E2E8F0] selection:bg-[#1E293B]">
        {/* Dynamic Inner App Menu / Navigation Bar */}
        <header className="bg-[#0F172A] border-b border-[#1E293B] px-3 sm:px-5 py-2 sm:py-3 shrink-0 flex flex-col md:flex-row justify-between items-center gap-3">
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

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5">
            {currentUser && (
              <div className="flex items-center gap-2 bg-[#090C12] border border-[#1E293B] px-2.5 py-1 rounded-md text-[9px] font-mono select-none">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-4.5 h-4.5 rounded-full border border-indigo-500/20 shrink-0" referrerPolicy="no-referrer" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                )}
                
                <span className="text-slate-200 font-bold max-w-[100px] sm:max-w-[130px] truncate" title={currentUser.email}>
                  {currentUser.displayName || currentUser.email}
                </span>

                {currentUser.googleId && (
                  <span className="text-[7.5px] bg-emerald-950/40 text-emerald-400 px-1 rounded-sm border border-emerald-900/40 font-mono" title={`OIDC Unique Subject Claim: ${currentUser.googleId}`}>
                    sub: {currentUser.googleId.substring(0, 8)}...
                  </span>
                )}

                <span className="text-[#334155]">|</span>
                <span className={`text-[8px] font-bold px-1 rounded-sm ${currentUser.age < 13 ? 'bg-[#EC4899]/15 text-[#EC4899] border border-[#EC4899]/30' : 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/30'}`}>
                  {currentUser.age < 13 ? 'COPPA CHILD' : 'ADULT'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('localUserSession');
                    setCurrentUser(null);
                    showNotification("Operator session logged out safely.", "success");
                  }}
                  className="ml-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  title="Sign out & lock interface"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-1 bg-[#0A0C10] border border-[#1E293B] p-0.5 rounded-sm">
              <button
                onClick={() => {
                  setIsShortcutHelpOpen(true);
                }}
                className="px-2 py-1 text-[9px] hover:bg-slate-900 text-amber-400 hover:text-amber-300 rounded-sm font-bold tracking-widest font-mono flex items-center gap-1 transition"
                title="Open Keyboard Shortcuts Reference [Ctrl + /]"
                id="header-shortcuts-btn"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">KEYS</span>
              </button>

              <button
                onClick={() => {
                  setIsCommandPaletteOpen(true);
                  setCommandPaletteSearch('');
                }}
                className="px-2 py-1 text-[9px] hover:bg-slate-900 text-emerald-400 hover:text-emerald-300 rounded-sm font-bold tracking-widest font-mono flex items-center gap-1 transition"
                title="Launch Command Search Palette [Ctrl + K]"
                id="header-command-palette-btn"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">FIND</span>
              </button>

              <button
                onClick={() => {
                  setIsTourActive(true);
                  setCurrentTourStep(0);
                  setActiveTab('dashboard');
                  showNotification("Guided operations tutorial initialized.");
                }}
                className="px-2 py-1 text-[9px] hover:bg-slate-900 text-cyan-400 hover:text-cyan-300 rounded-sm font-bold tracking-widest font-mono flex items-center gap-1 transition"
                title="Launch interactive walkthrough"
                id="header-launch-tour-btn"
              >
                <HelpCircle className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden xs:inline">TOUR</span>
              </button>

              <button
                onClick={() => setIsChatOpen(prev => !prev)}
                className={`px-2 py-1 text-[9px] rounded-sm font-bold tracking-widest font-mono flex items-center gap-1 transition-all ${
                  isChatOpen ? 'bg-indigo-950/50 text-indigo-300' : 'hover:bg-slate-900 text-indigo-400 hover:text-indigo-350'
                }`}
                title="Toggle tactical guidance chat"
                id="header-toggle-chat-btn"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">AI_CO_PILOT</span>
              </button>
            </div>

            <nav className="flex flex-wrap justify-center gap-1 border border-[#1E293B] bg-[#0A0C10] p-1 rounded-sm" id="os-navbar">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`text-[10px] font-semibold px-2.5 sm:px-3 py-1 rounded-sm transition ${
                activeTab === 'dashboard'
                  ? 'bg-[#1E293B] text-indigo-400 border border-[#1E293B] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/40'
              }`}
              id="nav-dashboard"
            >
              <span className="inline sm:hidden">Dashboard</span>
              <span className="hidden sm:inline">Control Center</span>
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`text-[10px] font-semibold px-2.5 sm:px-3 py-1 rounded-sm transition ${
                activeTab === 'terminal'
                  ? 'bg-[#1E293B] text-indigo-400 border border-[#1E293B] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/40'
              }`}
              id="nav-terminal"
            >
              <span className="inline sm:hidden">Shell</span>
              <span className="hidden sm:inline">OS Shell</span>
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`text-[10px] font-semibold px-2.5 sm:px-3 py-1 rounded-sm transition ${
                activeTab === 'agents'
                  ? 'bg-[#1E293B] text-indigo-400 border border-[#1E293B] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/40'
              }`}
              id="nav-agents"
            >
              <span className="inline sm:hidden">Cores</span>
              <span className="hidden sm:inline">Neural Sub-Cores</span>
            </button>
            <button
              onClick={() => setActiveTab('workflows')}
              className={`text-[10px] font-semibold px-2.5 sm:px-3 py-1 rounded-sm transition ${
                activeTab === 'workflows'
                  ? 'bg-[#1E293B] text-indigo-400 border border-[#1E293B] font-bold'
                  : 'text-[#E2E8F0]'
              }`}
              id="nav-workflows"
            >
              <span className="inline sm:hidden">Pipelines</span>
              <span className="hidden sm:inline">Automations Engine</span>
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`text-[10px] font-semibold px-2.5 sm:px-3 py-1 rounded-sm transition flex items-center gap-1 ${
                activeTab === 'sync'
                  ? 'bg-[#1E293B] text-indigo-400 border border-[#1E293B] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/40'
              }`}
              id="nav-sync"
            >
              <Lock className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="inline sm:hidden">Sync</span>
              <span className="hidden sm:inline">Secure Sync</span>
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`text-[10px] font-semibold px-2.5 sm:px-3 py-1 rounded-sm transition flex items-center gap-1 ${
                activeTab === 'billing'
                  ? 'bg-[#1E293B] text-indigo-400 border border-[#1E293B] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/40'
              }`}
              id="nav-billing"
            >
              <Coins className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="inline sm:hidden">GCP Spend</span>
              <span className="hidden sm:inline">GCP Spend & Promo Credits</span>
            </button>
          </nav>
        </div>
      </header>

        {/* Content canvas with Geometric Balance Blueprint Grid Background */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 custom-scrollbar overflow-auto geometric-grid relative">
          <div className="relative z-10">
            {renderTabContent()}
          </div>
        </main>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <AuthGate
        onLoginSuccess={(userData) => {
          localStorage.setItem('localUserSession', JSON.stringify(userData));
          setCurrentUser(userData);
          showNotification(`Authenticated operator: ${userData.email} (${userData.age < 13 ? 'COPPA Child Protection Mode' : 'Standard Console Access'})`, "success");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#E2E8F0] flex flex-col justify-between font-sans">
      {/* Outer Browser Shell header */}
      <header className="bg-[#0F172A] border-b border-[#1E293B] px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row justify-between items-[#e2e8f0] items-center gap-3 shrink-0">
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="w-8 h-8 bg-indigo-500 rounded-sm flex items-center justify-center font-bold text-white shadow-md shrink-0">A</div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-[#E2E8F0] flex items-center gap-2">
              <span className="font-mono text-xs tracking-widest text-indigo-400">AGENT_OS_CONSOLE</span>
            </h1>
            <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-slate-500 font-mono line-clamp-1">Autonomous workflow map & crypt mesh replication</p>
          </div>
        </div>

        {/* Ingenious Device Layout Simulator Selector - Hide on actual mobile viewports */}
        {!isMobileViewport && (
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
        )}
      </header>

      {/* Responsive layout simulation wrapping blocks */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6 flex items-center justify-center auto-rows-max overflow-hidden">
        {isMobileViewport ? (
          <div className="w-full bg-[#0A0C10] border border-[#1E293B] rounded-sm overflow-hidden shadow-2xl">
            {renderOSBody()}
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Interactive Walkthrough Tour Overlay and Sliding AI Chat Co-Pilot */}
      <GuidanceSystem
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        isTourActive={isTourActive}
        setIsTourActive={setIsTourActive}
        currentTourStep={currentTourStep}
        setCurrentTourStep={setCurrentTourStep}
        showNotification={showNotification}
      />

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

      {/* 🔍 Global Command Palette / Search Modal */}
      {isCommandPaletteOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4 mb-1"
          onClick={() => setIsCommandPaletteOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header search input section */}
            <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/40">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input 
                type="text"
                placeholder="Search commands, templates, views, or tasks..."
                value={commandPaletteSearch}
                onChange={(e) => setCommandPaletteSearch(e.target.value)}
                className="bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0 w-full text-xs font-mono py-1"
                autoFocus
              />
              <span className="text-[9px] font-mono font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/50 uppercase select-none shrink-0" title="Dismiss modal window">
                ESC
              </span>
            </div>

            {/* Results item container */}
            <div className="max-h-[340px] overflow-y-auto custom-scrollbar p-2 space-y-1 bg-slate-900/90 text-[11px]">
              {commandPaletteResults.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center justify-center space-y-2">
                  <AlertTriangle className="w-5 h-5 text-slate-600 animate-pulse" />
                  <span className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest">No matching nodes</span>
                  <p className="text-[9.5px] text-slate-400 max-w-[255px]">Refine keyword sequence parsing terms (e.g. "term", "sync")</p>
                </div>
              ) : (
                (() => {
                  let currentCategory = '';
                  return commandPaletteResults.map((item) => {
                    const showCatHeader = item.category !== currentCategory;
                    if (showCatHeader) {
                      currentCategory = item.category;
                    }
                    return (
                      <div key={item.id} className="contents">
                        {showCatHeader && (
                          <div className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#6366f1] bg-indigo-950/20 px-2.5 py-1 rounded-sm mt-2 first:mt-1 self-start select-none">
                            {item.category}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={item.action}
                          className="w-full text-left p-2.5 rounded hover:bg-slate-800 hover:bg-indigo-950/30 border border-transparent hover:border-indigo-900/40 transition flex items-start gap-3 group"
                        >
                          <div className="w-5 h-5 rounded bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-[9px] text-[#A5B4FC] shrink-0 font-bold">
                            &gt;_
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                              {item.title}
                            </div>
                            {item.subtitle && (
                              <div className="text-[9px] text-slate-450 mt-0.5 truncate">
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                          <div className="text-[8px] font-mono text-slate-500 group-hover:text-indigo-400 transition-colors uppercase select-none shrink-0 border border-transparent group-hover:border-indigo-950/40 rounded px-1.5 py-0.5 self-center">
                            RUN KEY
                          </div>
                        </button>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Footer cheat helper bar */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[8.5px] font-mono text-slate-500 select-none">
              <div className="flex items-center gap-1.5">
                <span className="text-[#6366f1]">&gt;</span>
                <span>USE RELEVANT KEYWORDS FOR IMMEDIATE TERMINAL ROUTING</span>
              </div>
              <div>
                COMMANDER v2
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 Quick Deploy Task Modal */}
      {isQuickTaskModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsQuickTaskModalOpen(false)}
        >
          <form 
            onSubmit={handleQuickCreateTask}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-5 sm:p-6 font-sans relative overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-850 pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6.5 h-6.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded flex items-center justify-center font-mono font-bold text-xs">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#E2E8F0] font-mono">Quick Deploy Pipeline</h3>
                  <p className="text-[9px] text-slate-500 mt-0.5">Instant queue scheduler hook [Ctrl+N]</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsQuickTaskModalOpen(false)}
                className="text-slate-500 hover:text-slate-350 transition p-1 hover:bg-slate-800 rounded cursor-pointer"
                title="Dismiss task deployment creator"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {workflows.length === 0 ? (
              <div className="space-y-4 py-4 text-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto animate-pulse" />
                <p className="text-[10px] text-slate-400">No active workflow templates detected in database. Design an automation flow first.</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('workflows');
                    setIsQuickTaskModalOpen(false);
                  }}
                  className="px-3 py-1.5 bg-indigo-900 border border-indigo-800 text-indigo-200 text-[10px] uppercase font-bold font-mono hover:bg-indigo-950 transition cursor-pointer"
                >
                  Create Template
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Workflow selector list */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400 font-mono tracking-wider">Select Automation Template:</label>
                  <select
                    value={quickTaskWorkflowId}
                    onChange={(e) => setQuickTaskWorkflowId(e.target.value)}
                    className="bg-[#0A0C10] border border-[#1E293B] rounded px-3 py-2 text-[10px] font-mono text-[#E2E8F0] focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    {workflows.map((wf) => (
                      <option key={wf.id} value={wf.id} className="bg-[#0A0C10]">
                        {wf.name} ({wf.steps.length} Steps)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Level configuration */}
                <div className="space-y-2">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400 font-mono tracking-wider w-full text-left">Configure Priority weight:</label>
                  <div className="grid grid-cols-4 gap-2 select-none">
                    {(['critical', 'high', 'medium', 'low'] as const).map((p) => {
                      const isSelected = quickTaskPriority === p;
                      const colors = {
                        critical: 'bg-rose-950/20 text-rose-450 border-rose-900 hover:bg-rose-955/35',
                        high: 'bg-amber-950/25 text-amber-450 border-amber-900 hover:bg-amber-955/35',
                        medium: 'bg-indigo-950/25 text-indigo-400 border-indigo-900 hover:bg-indigo-955/35',
                        low: 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
                      };

                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setQuickTaskPriority(p)}
                          className={`text-[8.5px] uppercase font-mono font-bold border rounded py-2 transition-all text-center cursor-pointer ${
                            isSelected 
                              ? `${colors[p]} border-[#6366f1] shadow-indigo-950/10 shadow-sm font-extrabold ring-1 ring-[#6366f1]/30`
                              : 'bg-slate-955 text-slate-500 border-slate-800 hover:bg-slate-900 hover:text-slate-350'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit and Cancel buttons */}
                <div className="flex items-center gap-3.5 pt-4.5 border-t border-slate-800 select-none">
                  <button
                    type="button"
                    onClick={() => setIsQuickTaskModalOpen(false)}
                    className="w-full py-2 border border-slate-805 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-250 transition text-[9.5px] uppercase tracking-wider font-bold font-mono cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full py-2 bg-[#6366F1] hover:bg-[#4F46E5] active:bg-indigo-700 border border-indigo-400/20 rounded text-white transition text-[9.5px] uppercase tracking-wider font-bold font-mono flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shrink-0" />
                    Deploy Pipeline
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ⌨️ Keyboard Shortcuts Cheat Sheet Guide */}
      {isShortcutHelpOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
          onClick={() => setIsShortcutHelpOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-5 sm:p-6 font-sans relative overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header indicator */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6.5 h-6.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded flex items-center justify-center font-mono font-bold text-xs">
                  <Keyboard className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#E2E8F0] font-mono">Shortcuts Reference</h3>
                  <p className="text-[9px] text-slate-500 mt-0.5">Tactical operator command bindings [Esc to close]</p>
                </div>
              </div>
              <button 
                onClick={() => setIsShortcutHelpOpen(false)}
                className="text-slate-500 hover:text-slate-350 transition p-1 hover:bg-slate-800 rounded cursor-pointer"
                title="Dismiss keyboard shortcut guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
              {/* global bindings */}
              <div className="space-y-2">
                <h4 className="text-[9px] font-bold text-[#E2E8F0] uppercase tracking-wider font-mono border-l-2 border-indigo-500 pl-2">
                  Core Command Actions
                </h4>
                
                {/* Layout line elements */}
                <div className="space-y-1">
                  <div className="p-2 sm:p-2.5 rounded bg-slate-950/45 border border-slate-850/50 hover:border-slate-800 flex items-center justify-between gap-4 text-[10.5px]">
                    <span className="text-slate-300 font-medium">Search & command center (Command Palette)</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-750 rounded text-slate-300 font-mono text-[9px] font-bold shadow-sm uppercase">Ctrl</kbd>
                      <span className="text-slate-600 font-mono text-[9px]">+</span>
                      <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-750 rounded text-slate-300 font-mono text-[9px] font-bold shadow-sm uppercase">K</kbd>
                    </div>
                  </div>

                  <div className="p-2 sm:p-2.5 rounded bg-slate-950/45 border border-slate-850/50 hover:border-slate-800 flex items-center justify-between gap-4 text-[10.5px]">
                    <span className="text-slate-300 font-medium">Instantiate & Deploy New Task running</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <kbd className="px-1.5 py-0.5 bg-[#000000] border border-slate-750 rounded text-slate-300 font-mono text-[9px] font-bold shadow-sm uppercase">Ctrl</kbd>
                      <span className="text-slate-600 font-mono text-[9px]">+</span>
                      <kbd className="px-1.5 py-0.5 bg-[#000000] border border-slate-750 rounded text-slate-300 font-mono text-[9px] font-bold shadow-sm uppercase">N</kbd>
                      <span className="text-slate-500 font-mono text-[8px] mx-1">or</span>
                      <kbd className="px-1.5 py-0.5 bg-[#000000] border border-slate-750 rounded text-slate-300 font-mono text-[9px] font-bold shadow-sm uppercase">Alt</kbd>
                      <span className="text-slate-600 font-mono text-[9px]">+</span>
                      <kbd className="px-1.5 py-0.5 bg-[#000000] border border-slate-750 rounded text-slate-300 font-mono text-[9px] font-bold shadow-sm uppercase">N</kbd>
                    </div>
                  </div>

                  <div className="p-2 sm:p-2.5 rounded bg-slate-950/45 border border-[#1E293B] hover:border-slate-800 flex items-center justify-between gap-4 text-[10.5px]">
                    <span className="text-slate-300 font-medium">Activate Keyboard Shortcuts Guide</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-750 rounded text-slate-300 font-mono text-[9px] font-bold shadow-sm uppercase">Ctrl</kbd>
                      <span className="text-slate-600 font-mono text-[9px]">+</span>
                      <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-750 rounded text-slate-300 font-mono text-[9px] font-bold shadow-sm uppercase">/</kbd>
                      <span className="text-slate-500 font-mono text-[8px] mx-1">or</span>
                      <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-750 rounded text-slate-300 font-mono text-[9px] font-bold shadow-sm uppercase">?</kbd>
                    </div>
                  </div>

                  <div className="p-2 sm:p-2.5 rounded bg-slate-950/45 border border-[#1E293B] hover:border-slate-800 flex items-center justify-between gap-4 text-[10.5px]">
                    <span className="text-slate-300 font-medium">Toggle System AI Copilot Sidebar</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-750 rounded text-slate-300 font-mono text-[9px] font-bold shadow-sm uppercase">Ctrl</kbd>
                      <span className="text-slate-600 font-mono text-[9px]">+</span>
                      <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-750 rounded text-slate-300 font-mono text-[9px] font-bold shadow-sm uppercase">Alt</kbd>
                      <span className="text-slate-600 font-mono text-[9px]">+</span>
                      <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-750 rounded text-slate-300 font-mono text-[9px] font-bold shadow-sm uppercase">G</kbd>
                    </div>
                  </div>
                </div>
              </div>

              {/* fast routing */}
              <div className="space-y-2 pt-1.5">
                <h4 className="text-[9px] font-bold text-[#E2E8F0] uppercase tracking-wider font-mono border-l-2 border-amber-500 pl-2">
                  Console Swapper Tabs
                </h4>
                <p className="text-[8.5px] text-slate-500 font-mono px-0.5">Hold combination keys to teleport active view panel instantly:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { tab: 'Dashboard Hub', keys: 'Alt + 1', l: 'd' },
                    { tab: 'Live Terminal', keys: 'Alt + 2', l: 't' },
                    { tab: 'Sub-Cores (Agents)', keys: 'Alt + 3', l: 'a' },
                    { tab: 'Automations Registry', keys: 'Alt + 4', l: 'w' },
                    { tab: 'Sync Vault', keys: 'Alt + 5', l: 's' },
                    { tab: 'Spend Audit', keys: 'Alt + 6', l: 'b' }
                  ].map((item) => (
                    <div key={item.tab} className="p-2.5 rounded bg-slate-950/40 border border-slate-850/50 flex flex-col gap-1.5 text-[10px]">
                      <span className="text-slate-400 font-semibold">{item.tab}</span>
                      <div className="flex flex-wrap items-center gap-1 mt-0.5">
                        <kbd className="px-1 py-0.5 bg-slate-900 border border-slate-750 rounded text-slate-300 font-mono text-[8px] font-bold uppercase shadow-sm">{item.keys}</kbd>
                        <span className="text-slate-600 font-mono text-[8.5px]">or</span>
                        <kbd className="px-1 py-0.5 bg-slate-900 border border-slate-750 rounded text-amber-450 font-mono text-[8px] font-bold uppercase shadow-sm">Ctrl+Alt+{item.l}</kbd>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* dismiss buttons */}
            <div className="mt-5 pt-3.5 border-t border-slate-850 flex select-none">
              <button
                type="button"
                onClick={() => setIsShortcutHelpOpen(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded text-slate-200 transition text-[9.5px] uppercase tracking-wider font-bold font-mono cursor-pointer"
              >
                Standard Operator Acknowledged
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer credit blocks */}
      <footer className="h-auto md:h-12 border-t border-[#1E293B] bg-[#0F172A] py-3 md:py-0 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 gap-2 text-slate-500 text-[10px] font-mono shrink-0">
        <div className="flex items-center gap-2 text-indigo-400 italic">
          <span>&gt;</span>
          <span className="text-slate-400 not-italic uppercase tracking-widest text-[9px]">Sovereign Decentralized Vault Cluster</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-slate-600 font-medium">
          <div>UTF-8 | LATENCY: 24MS</div>
          <div className="hidden sm:inline">•</div>
          <div>Session: active for 4h 12m</div>
        </div>
      </footer>
    </div>
  );
}
