import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  HelpCircle,
  X,
  Send,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Compass,
  CornerDownLeft,
  Terminal,
  Shield,
  Layers,
  Brain,
  Info
} from 'lucide-react';

interface TourStep {
  title: string;
  content: string;
  tab: 'dashboard' | 'terminal' | 'agents' | 'workflows' | 'sync';
  highlightId?: string;
  badgeText: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "CMD_CENTER: System telemetry & health monitor",
    content: "Welcome to the Agent OS Control Center. This tactical command matrix exhibits live resource levels (processor cores & cryptographic memory limits) and active device sockets. Use the simulation vectors to inject high-priority active loads and audit system metrics.",
    tab: "dashboard",
    badgeText: "PHASE 1 / 5"
  },
  {
    title: "SHELL_OS: Cyber terminal shell console",
    content: "Deploy low-level diagnostic instructions natively. This high-fidelity virtual terminal processes custom CLI parameters. Execute 'help' to examine available actions, check core structures, run automation pipelines, or wipe command backlogs directly from the CLI prompt.",
    tab: "terminal",
    badgeText: "PHASE 2 / 5"
  },
  {
    title: "NEURAL_CORES: Deploying specialized model agents",
    content: "Configure LLM sub-core configurations. Adjust operational temperatures, declare strict guidelines, and assign models like 'gemini-3.1-pro-preview' or 'gemini-3.5-flash'. Or delete unnecessary neural nodes from the active cluster.",
    tab: "agents",
    badgeText: "PHASE 3 / 5"
  },
  {
    title: "AUTOMATE_ENGINE: Multi-agent execution pipelines",
    content: "The heart of autonomous orchestration. Design custom sequence templates compiled for multi-agent logic chains. Trigger workflow runs to instantiate Task Sessions, inspect continuous step progress, and witness processing metrics in real-time.",
    tab: "workflows",
    badgeText: "PHASE 4 / 5"
  },
  {
    title: "SECURE_SYNC: Zero-knowledge state replication",
    content: "Defend your node. Establish a secure Encryption Passphrase locally to derive a SHA-251 parity key fingerprint. We encrypt setup payloads client-side using PBKDF2/AES-GCM before copying ciphertext to the database. The host remains completely blind to data assets.",
    tab: "sync",
    badgeText: "PHASE 5 / 5"
  }
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  navigateTab?: 'dashboard' | 'terminal' | 'agents' | 'workflows' | 'sync';
}

interface GuidanceSystemProps {
  activeTab: 'dashboard' | 'terminal' | 'agents' | 'workflows' | 'sync';
  setActiveTab: (tab: 'dashboard' | 'terminal' | 'agents' | 'workflows' | 'sync') => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  isTourActive: boolean;
  setIsTourActive: (active: boolean) => void;
  currentTourStep: number;
  setCurrentTourStep: (step: number) => void;
  showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export default function GuidanceSystem({
  activeTab,
  setActiveTab,
  isChatOpen,
  setIsChatOpen,
  isTourActive,
  setIsTourActive,
  currentTourStep,
  setCurrentTourStep,
  showNotification
}: GuidanceSystemProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      text: "### 🌐 OPERATIONAL INTELLIGENCE DIRECTIVE\n\nWelcome back, Operator. I am your Tactical Guidance Assistant. I manage cross-tab operational insight and help compile secure decentralized structures.\n\nAsk me any operational question about agent setups, local state encryption, automation runs, or the console shell. \n\n*Or toggle the step-by-step Interactive System Tour to examine the platform layout!*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thinkingEnabled, setThinkingEnabled] = useState(false);

  // IT Console Care Operations
  const handleDefragRAM = () => {
    showNotification("Sanitizing active cluster sockets... Memory page blocks realigned.", "success");
    setMessages(prev => [...prev, {
      id: `msg-defrag-${Date.now()}`,
      sender: "assistant",
      text: "🧼 **IT CORE SYSTEM DEFRAG COMPLETED**:\n\n- Deactivated stagnant virtual socket endpoints.\n- Recovered **256.4 MB** of telemetry buffer space.\n- Sockets indexed: **8 peer connections validated**.\n- Memory footprint reduced by **12.4%**.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const handleAuditCrypt = () => {
    showNotification("Running local cryptographic auditing sequence...", "info");
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `msg-crypt-${Date.now()}`,
        sender: "assistant",
        text: "🛡️ **IT CRYPTO REPLICATION AUDIT**:\n\n- Local derivation function: **PBKDF2 WebCrypto**.\n- AES wrap strength: **AES-GCM-256 bit** payload blocks.\n- Status: **SECURE-READY**.\n- Warning: Ensure you store your master passphrase offline. Operational synchronization is client-blind.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 400);
  };

  const handleOverclockNode = () => {
    showNotification("Overclocking model processor pipelines... Max performance active.", "success");
    setMessages(prev => [...prev, {
      id: `msg-overclock-${Date.now()}`,
      sender: "assistant",
      text: "⚡ **IT CORE OVERCLOCK INTEGRATION ACTIVE**:\n\n- Allocated maximum priority clocking to cluster queues.\n- Response latency down to **115ms** (powered by gemini-3.1-flash-lite).\n- Simulated 3D mesh rendering deformation: **Stable (1.5x speed boost)**.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Tour management
  const handleNextStep = () => {
    if (currentTourStep < TOUR_STEPS.length - 1) {
      const nextStep = currentTourStep + 1;
      setCurrentTourStep(nextStep);
      setActiveTab(TOUR_STEPS[nextStep].tab);
    } else {
      setIsTourActive(false);
      showNotification("Operational system walkthrough sequence completed successfully.", "success");
    }
  };

  const handlePrevStep = () => {
    if (currentTourStep > 0) {
      const prevStep = currentTourStep - 1;
      setCurrentTourStep(prevStep);
      setActiveTab(TOUR_STEPS[prevStep].tab);
    }
  };

  const handleSkipTour = () => {
    setIsTourActive(false);
    showNotification("Systems guidance tour dismissed.", "info");
  };

  // Helper parser for simple formatting of Markdown and cleaning NAVIGATE tags
  const renderMessageContent = (text: string) => {
    // Extract NAVIGATE tag if any
    const displayStr = text.replace(/\[NAVIGATE:\w+\]/g, "").trim();

    // Split paragraphs
    const paragraphs = displayStr.split('\n\n');

    return (
      <div className="space-y-2 text-slate-200 text-xs leading-relaxed font-sans">
        {paragraphs.map((p, idx) => {
          // Check for headers
          if (p.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-xs font-bold font-mono tracking-widest text-indigo-300 uppercase border-b border-[#1E293B] pb-1 mt-3">
                {p.replace('### ', '')}
              </h4>
            );
          }
          if (p.startsWith('## ')) {
            return (
              <h3 key={idx} className="text-sm font-bold font-mono tracking-widest text-[#E2E8F0] uppercase mt-2">
                {p.replace('## ', '')}
              </h3>
            );
          }

          // Check for bullet list
          if (p.includes('\n- ') || p.startsWith('- ')) {
            const lines = p.split('\n');
            return (
              <ul key={idx} className="list-disc pl-4 space-y-1 my-2 text-slate-300">
                {lines.map((ln, lIdx) => {
                  const cleaned = ln.replace(/^-\s+/, '').replace(/^\*\s+/, '');
                  return <li key={lIdx} dangerouslySetInnerHTML={{ __html: parseBold(cleaned) }} />;
                })}
              </ul>
            );
          }

          // Check for numbered list
          if (p.includes('\n1. ') || p.startsWith('1. ')) {
            const lines = p.split('\n');
            return (
              <ol key={idx} className="list-decimal pl-4 space-y-1 my-2 text-slate-300">
                {lines.map((ln, lIdx) => {
                  const cleaned = ln.replace(/^\d+\.\s+/, '');
                  return <li key={lIdx} dangerouslySetInnerHTML={{ __html: parseBold(cleaned) }} />;
                })}
              </ol>
            );
          }

          return (
            <p key={idx} className="font-sans" dangerouslySetInnerHTML={{ __html: parseBold(p) }} />
          );
        })}
      </div>
    );
  };

  const parseBold = (str: string) => {
    // Replace text between double asterisks with strong tags
    let result = str.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-400 font-semibold">$1</strong>');
    result = result.replace(/\*(.*?)\*/g, '<em class="text-slate-100">$1</em>');
    result = result.replace(/`(.*?)`/g, '<code class="bg-[#0A0C10] px-1 py-0.5 rounded text-indigo-400 font-mono text-[10px]">$1</code>');
    return result;
  };

  // AI Guidance Chat fetcher
  const handleSendMessage = async (textToSend?: string) => {
    const rawInput = textToSend || chatInput;
    if (!rawInput.trim()) return;

    // Create user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: rawInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput("");
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text
      }));

      const response = await fetch('/api/guidance/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: rawInput,
          history: historyPayload,
          isThinking: thinkingEnabled
        })
      });

      if (response.ok) {
        const data = await response.json();
        const replyText: string = data.reply || "No response generated by deep core.";

        // Match NAVIGATE tag
        const navMatch = replyText.match(/\[NAVIGATE:(\w+)\]/);
        const navigateTabName = navMatch ? (navMatch[1] as any) : undefined;

        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}`,
          sender: "assistant",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          navigateTab: navigateTabName
        }]);
      } else {
        throw new Error("Guidance endpoint returned communication failure.");
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: `msg-err-${Date.now()}`,
        sender: "assistant",
        text: "🚨 **COMMS_OFFLINE**: Secure guidance nodes are experiencing load fluctuations. Let me answer with local knowledge parameters:\n\nTo configure decentralized replication, move to **Secure Sync** where local passphrases encrypt your node client-side before synchronization. [NAVIGATE:sync]",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        navigateTab: "sync"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const presetQueries = [
    { label: "Lock & Sync Keys?", query: "How do I synchronize my client keys securely?" },
    { label: "Specialized Core?", query: "What are the deployed neural sub-cores?" },
    { label: "Run Pipelines?", query: "How do I configure and execute automated workflows?" },
    { label: "OS shell commands?", query: "Explain what commands are supported in the OS Shell terminal." }
  ];

  return (
    <>
      {/* 🚀 1. STEP-BY-STEP GUIDED WALKTHROUGH OVERLAY CARD */}
      {isTourActive && (
        <div className="fixed inset-x-0 bottom-16 sm:bottom-20 flex justify-center z-40 px-4 animate-fade-in pointer-events-none">
          <div className="w-full max-w-xl bg-[#0D1117]/95 border border-indigo-500 rounded-none shadow-[0_0_25px_rgba(99,102,241,0.25)] p-5 relative pointer-events-auto flex flex-col md:flex-row gap-4">
            
            {/* Ambient indicator and step indicator count */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping shrink-0" />
                  <span className="text-[10px] font-mono tracking-widest text-indigo-400 font-bold uppercase">
                    SECURE_GUIDE_PROMPT
                  </span>
                </div>
                <span className="text-[9px] font-mono bg-indigo-950/40 border border-indigo-900 text-indigo-400 px-2 py-0.5 rounded-sm font-semibold">
                  {TOUR_STEPS[currentTourStep].badgeText}
                </span>
              </div>

              <h4 className="text-xs font-bold tracking-wider text-white font-mono uppercase">
                {TOUR_STEPS[currentTourStep].title}
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed font-sans font-medium">
                {TOUR_STEPS[currentTourStep].content}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-row md:flex-col justify-between md:justify-end items-center md:items-end gap-3 shrink-0 border-t md:border-t-0 border-[#1E293B] pt-3 md:pt-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevStep}
                  disabled={currentTourStep === 0}
                  className={`p-1.5 rounded-sm border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-30 disabled:pointer-events-none`}
                  title="Previous Step"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextStep}
                  className="px-3 py-1.5 rounded-sm bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] font-mono flex items-center gap-1 shadow-md transition"
                >
                  <span>{currentTourStep === TOUR_STEPS.length - 1 ? "FINISH_TOUR" : "NEXT_PHASE"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleSkipTour}
                className="text-[9px] font-mono hover:text-indigo-400 text-slate-500 font-bold tracking-widest uppercase transition"
              >
                DISMISS_TOUR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💬 2. FLOATING QUICK-TOGGLE ASSISTANT FAB */}
      <div className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-40">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`relative group p-3 sm:p-4 rounded-full border shadow-2xl transition-all duration-300 flex items-center justify-center ${
            isChatOpen
              ? 'bg-[#1E293B] text-slate-200 border-indigo-500/80'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/50 shadow-indigo-600/25 shadow-[0_0_15px]'
          }`}
          title="Tactical AI Guidance Officer"
          id="floating-ai-guide-fab"
        >
          {isChatOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <>
              <Brain className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-[#0A0C10] animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-[#0A0C10]" />
              
              {/* Tooltip hint on hover */}
              <span className="absolute right-14 scale-0 group-hover:scale-100 bg-[#0F172A] border border-[#1E293B] text-indigo-400 font-bold text-[9px] font-mono px-2.5 py-1.5 whitespace-nowrap tracking-wider rounded-sm transition-all shadow-xl uppercase z-50">
                &gt; AI_TACTICAL_OFFICER_ONLINE
              </span>
            </>
          )}
        </button>
      </div>

      {/* 📂 3. SLIDE-OUT TACTICAL CHAT DRAWER */}
      {isChatOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[#0A0C10]/95 border-l border-[#1E293B] shadow-[0_0_40px_rgba(0,0,0,0.8)] z-50 flex flex-col justify-between animate-slide-in font-mono">
          
          {/* Header */}
          <div className="bg-[#0F172A] border-b border-[#1E293B] p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-sm bg-indigo-950/70 border border-indigo-500 flex items-center justify-center">
                <Brain className="w-4 h-4 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-widest uppercase">TACTICAL_CO-PILOT</h3>
                <p className="text-[8px] text-slate-500 mt-0.5 tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  DAEMON: INTEL_OFFICER_3.5
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsChatOpen(false);
                  setIsTourActive(true);
                  setCurrentTourStep(0);
                  setActiveTab('dashboard');
                  showNotification("Guided exploration sequence initialized.");
                }}
                className="p-1 px-2 rounded-sm border border-[#1E293B] hover:border-indigo-500/40 text-[9px] text-indigo-300 font-semibold bg-[#111827] flex items-center gap-1 transition"
                title="Start Guided Tour"
              >
                <Compass className="w-3 h-3 text-cyan-400" />
                <span>TOUR</span>
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-[#1E293B] border border-[#1E293B] text-slate-400 hover:text-white transition rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 🛡️ SECURE IT OPERATIONS CORE PANEL */}
          <div className="bg-[#0D1527] border-b border-[#1E293B] p-3 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${thinkingEnabled ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="text-[10px] font-bold text-slate-300 font-mono tracking-wider uppercase">IT Care Toolkit & Think Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-semibold text-slate-500 font-mono">THINK_ENGINE:</span>
                <button
                  onClick={() => {
                    setThinkingEnabled(!thinkingEnabled);
                    showNotification(
                      thinkingEnabled 
                        ? "Deep thinking mode deactivated." 
                        : "High-intelligence reasoning engine activated (gemini-3.1-pro-preview).", 
                      "info"
                    );
                  }}
                  className={`relative p-0.5 w-8 rounded-full transition-colors ${
                    thinkingEnabled ? 'bg-indigo-600' : 'bg-slate-850'
                  }`}
                  type="button"
                >
                  <span
                    className={`block w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                      thinkingEnabled ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            {/* Interactive Action buttons */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={handleDefragRAM}
                className="py-1.5 px-1 text-[9px] font-bold font-mono tracking-wider text-indigo-300 hover:text-white bg-[#0A0C10] hover:bg-slate-950 border border-slate-800 hover:border-indigo-505 transition active:scale-95 text-center truncate flex items-center justify-center gap-1"
                title="Scans inactive caching data segments and realigns RAM tables"
              >
                <span>💾 RAM DEFRAG</span>
              </button>
              <button
                onClick={handleAuditCrypt}
                className="py-1.5 px-1 text-[9px] font-bold font-mono tracking-wider text-amber-500 hover:text-white bg-[#0A0C10] hover:bg-slate-950 border border-slate-800 hover:border-amber-505 transition active:scale-95 text-center truncate flex items-center justify-center gap-1"
                title="Audit cryptographic backup security parity limits"
              >
                <span>🛡️ AUDIT CRYPT</span>
              </button>
              <button
                onClick={handleOverclockNode}
                className="py-1.5 px-1 text-[9px] font-bold font-mono tracking-wider text-cyan-400 hover:text-white bg-[#0A0C10] hover:bg-slate-950 border border-slate-800 hover:border-cyan-505 transition active:scale-95 text-center truncate flex items-center justify-center gap-1"
                title="Allocates peak performance threads to queue pipelines"
              >
                <span>⚡ OVERCLOCK</span>
              </button>
            </div>
          </div>

          {/* Messages Loop Area */}
          <div
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 bg-[#0A0C10] relative"
          >
            {/* Blueprints Grid background accent inside chat */}
            <div className="absolute inset-0 opacity-5 pointer-events-none geometric-grid" />

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col max-w-[85%] ${
                  m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                } relative`}
              >
                {/* Meta details */}
                <span className="text-[8px] text-slate-500 uppercase font-mono tracking-wider mb-1.5">
                  {m.sender === 'user' ? 'OPERATOR' : 'TACTICAL_CO_PILOT'} • {m.timestamp}
                </span>

                {/* Message block */}
                <div
                  className={`p-3.5 rounded-none border text-xs leading-relaxed transition ${
                    m.sender === 'user'
                      ? 'bg-indigo-950/20 text-indigo-300 border-indigo-900/60'
                      : 'bg-slate-900/40 text-slate-250 border-[#1E293B]'
                  }`}
                >
                  {renderMessageContent(m.text)}

                  {/* NAVIGATE INTEGRATION BUTTON */}
                  {m.navigateTab && (
                    <div className="mt-4 pt-3 border-t border-[#1E293B] flex flex-col gap-2">
                      <div className="text-[8px] text-slate-500 font-semibold tracking-wider font-mono">
                        TACTICAL DISPATCH VECTOR DETECTED:
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab(m.navigateTab!);
                          showNotification(`Navigated to ${m.navigateTab!.toUpperCase()} per assistant response guidance.`);
                        }}
                        className="w-full py-1.5 px-3 rounded-none bg-indigo-900/80 hover:bg-indigo-800 border border-indigo-500/50 hover:border-indigo-400 text-white text-[9px] font-mono font-bold tracking-widest flex items-center justify-center gap-1.5 transition-all uppercase"
                      >
                        <span>🚀 ACTIVATE PORT MATRIX: {m.navigateTab}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking / Loading visual marker */}
            {loading && (
              <div className="mr-auto items-start max-w-[80%] flex flex-col gap-1.5">
                <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">
                  TACTICAL_CO_PILOT • ANALYZING_REASONING
                </span>
                <div className="bg-slate-900/40 border border-slate-805 p-3 flex items-center gap-2.5 rounded-sm">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-[9px] text-[#A5B4FC] font-mono tracking-wider font-semibold animate-pulse">
                    PARSING_GRID_ARCHITECTURE...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick presets area */}
          <div className="px-4 py-2 border-t border-slate-850 bg-[#0F172A]/40 shrink-0 select-none">
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-1.5">
              PRESET RESOURCE VECTORS:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presetQueries.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.query)}
                  disabled={loading}
                  className="px-2 py-1 border border-slate-800 hover:border-indigo-500/30 bg-[#0D1117] hover:bg-slate-900 text-[9px] text-slate-400 hover:text-indigo-400 font-mono transition-colors rounded-sm"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat text input */}
          <div className="p-3 bg-[#0D1117] border-t border-[#1E293B] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask secure navigation guidance..."
                disabled={loading}
                className="flex-1 bg-[#0A0C10] border border-slate-800 outline-none text-xs text-white p-2 placeholder-slate-700 font-mono focus:border-indigo-500/60 font-semibold selection:bg-slate-800"
              />
              <button
                type="submit"
                disabled={loading || !chatInput.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-[#1E293B] border border-indigo-500/40 disabled:border-transparent text-white disabled:text-slate-500 flex items-center justify-center transition shadow-lg rounded-sm shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
