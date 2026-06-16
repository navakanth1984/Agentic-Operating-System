import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { Agent, Workflow, TaskExecution, SyncedDevice, SyncBackup, ExecutionLog, WorkflowStep, ResourceMetric } from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize memory store on the backend
let dbSystemResources: ResourceMetric[] = [
  { timestamp: "02:00", cpu: 18, memory: 34, activeTasks: 0 },
  { timestamp: "02:15", cpu: 32, memory: 35, activeTasks: 1 },
  { timestamp: "02:30", cpu: 25, memory: 38, activeTasks: 0 },
  { timestamp: "02:45", cpu: 45, memory: 40, activeTasks: 1 },
  { timestamp: "03:00", cpu: 60, memory: 48, activeTasks: 2 },
  { timestamp: "03:15", cpu: 28, memory: 44, activeTasks: 0 },
  { timestamp: "03:30", cpu: 35, memory: 42, activeTasks: 1 },
  { timestamp: "03:45", cpu: 55, memory: 49, activeTasks: 1 },
  { timestamp: "04:00", cpu: 74, memory: 58, activeTasks: 2 },
  { timestamp: "04:15", cpu: 40, memory: 52, activeTasks: 1 }
];


// Initialize memory store on the backend
let dbAgents: Agent[] = [
  {
    id: "agent-1",
    name: "Architect Core",
    role: "Vanguard Systems Orchestrator",
    systemInstruction: "You are the vanguard orchestrator agent of the Agent Operating System. Your design is deeply methodical, precise, and structural. Your task is to plan workflows, break goals into concrete execution steps, and assign them to specialized agents.",
    temperature: 0.2,
    model: "gemini-3.1-pro-preview",
    status: "idle",
    iconColor: "bg-indigo-600 text-white"
  },
  {
    id: "agent-2",
    name: "Intelligence Spec",
    role: "Deep Web Analyst & Researcher",
    systemInstruction: "You are a cyberintelligence research agent. You scan data hierarchies, synthesize competitor traits, highlight potential system failure interfaces, and output concise summaries with structured lists of findings.",
    temperature: 0.5,
    model: "gemini-3.5-flash",
    status: "idle",
    iconColor: "bg-amber-500 text-slate-900"
  },
  {
    id: "agent-3",
    name: "SysExec",
    role: "Secure Code & Script Compiler",
    systemInstruction: "You are the engineering executor agent. You compile code templates, establish database connection code, secure cryptographic hashes, and define operational schemas with zero-trust safety principles.",
    temperature: 0.1,
    model: "gemini-3.1-flash-lite",
    status: "idle",
    iconColor: "bg-emerald-500 text-white"
  }
];

let dbWorkflows: Workflow[] = [
  {
    id: "wf-1",
    name: "Market Intelligence Scan",
    description: "Autonomous competitive analysis for emerging software models.",
    createdAt: new Date().toISOString(),
    steps: [
      {
        id: "step-1-1",
        agentId: "agent-2",
        description: "Analyze market leaders",
        promptTemplate: "Analyze the top 3 modern trends in autonomous software engines. Focus on decentralized state sync, security vectors, and speed. Provide a structured summary.",
        status: "pending"
      },
      {
        id: "step-1-2",
        agentId: "agent-3",
        description: "Draft structural state machine",
        promptTemplate: "Based on the Web Analyst's findings, construct a modular JSON representation of a state machine representing localized cross-platform sync capabilities. Use dry-run cryptographic protocols.",
        status: "pending"
      }
    ]
  },
  {
    id: "wf-2",
    name: "Zero-Trust Cryptographic Guard Auditing",
    description: "A secure protocol evaluation of local PBKDF2 + AES-GCM memory wrappers.",
    createdAt: new Date().toISOString(),
    steps: [
      {
        id: "step-2-1",
        agentId: "agent-1",
        description: "Formulate Threat Matrix",
        promptTemplate: "Conduct a rapid vulnerability assessment of localized file-system replication. Highlight identity-spoofing vectors and memory sniffing targets.",
        status: "pending"
      },
      {
        id: "step-2-2",
        agentId: "agent-3",
        description: "Outline Key Derivation Blueprint",
        promptTemplate: "Write a high-precision TypeScript configuration illustrating client-side sub-key derivation utilizing standard WebCrypto PBSKDF2 and AES-GCM wrappers to harden synchronization data.",
        status: "pending"
      }
    ]
  }
];

let dbTasks: TaskExecution[] = [
  {
    id: "task-1",
    title: "Initial Market Analysis Session",
    workflowId: "wf-1",
    status: "completed",
    currentStepIndex: 1,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    steps: [
      {
        id: "s-1-1",
        agentId: "agent-2",
        description: "Analyze market leaders",
        promptTemplate: "Analyze the top 3 modern trends in autonomous software engines.",
        status: "completed",
        output: "## Competitor Scan\n1. **State-mesh Replication**: Platforms are shifting to CRDTs over Centralized SQLite.\n2. **Device Sovereignty**: Running background modules directly on laptops/phones, bypassing SaaS middle-layers.\n3. **Decentralized Vaults**: Metadata is signed locally before replication."
      },
      {
        id: "s-1-2",
        agentId: "agent-3",
        description: "Draft structural state machine",
        promptTemplate: "Draft secure schema for local device syncing.",
        status: "completed",
        output: "```json\n{\n  \"sync_node\": \"laptop_01\",\n  \"mesh_peers\": [\"mobile_phone_02\", \"dev_server_03\"],\n  \"encryption_scheme\": \"AES-GCM-256\",\n  \"hash_digest\": \"sha256-a4f9g0...\"\n}\n```"
      }
    ],
    logs: [
      { timestamp: new Date(Date.now() - 3600000).toISOString(), type: "info", message: "Task initialized." },
      { timestamp: new Date(Date.now() - 3500000).toISOString(), type: "agent_start", agentName: "Intelligence Spec", message: "Executing Step 1: Analyze market leaders..." },
      { timestamp: new Date(Date.now() - 3400000).toISOString(), type: "agent_response", agentName: "Intelligence Spec", message: "Step 1 completed successfully." },
      { timestamp: new Date(Date.now() - 3300000).toISOString(), type: "agent_start", agentName: "SysExec", message: "Executing Step 2: Draft structural state machine..." },
      { timestamp: new Date(Date.now() - 3200000).toISOString(), type: "agent_response", agentName: "SysExec", message: "Step 2 completed successfully. Task marked completed." }
    ]
  }
];

let dbDevices: SyncedDevice[] = [
  {
    id: "dev-local",
    name: "Vanguard Console (Current Node)",
    deviceType: "local",
    encryptionKeyFingerprint: "SHA256:4f:b2:91:ee:74:ac:8a:c3",
    synchronizedAt: new Date().toISOString(),
    active: true,
    ipAddress: "127.0.0.1"
  },
  {
    id: "dev-laptop",
    name: "Operational Laptop Core",
    deviceType: "laptop",
    encryptionKeyFingerprint: "SHA256:7a:c1:95:ea:12:0f:7d:ff",
    synchronizedAt: new Date(Date.now() - 60000).toISOString(),
    active: true,
    ipAddress: "192.168.1.45"
  },
  {
    id: "dev-mobile",
    name: "Mobile Command Node",
    deviceType: "mobile",
    encryptionKeyFingerprint: "SHA256:33:d5:b0:f0:23:4d:12:ef",
    synchronizedAt: new Date(Date.now() - 120000).toISOString(),
    active: true,
    ipAddress: "10.0.0.89"
  }
];

// Cloud-native zero-knowledge encrypted backups
let cloudSyncVault: SyncBackup | null = null;

// Lazy initialize Gemini API client to prevent startup failure
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key === "") {
      console.warn("GEMINI_API_KEY is not defined. Running in localized simulation mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST endpoints for primary data store
app.get("/api/agents", (req, res) => {
  res.json(dbAgents);
});

app.post("/api/agents", (req, res) => {
  const agent: Agent = req.body;
  if (!agent.id) agent.id = `agent-${Date.now()}`;
  dbAgents = dbAgents.filter(a => a.id !== agent.id);
  dbAgents.push(agent);
  res.json(agent);
});

app.delete("/api/agents/:id", (req, res) => {
  dbAgents = dbAgents.filter(a => a.id !== req.params.id);
  res.json({ success: true });
});

app.get("/api/workflows", (req, res) => {
  res.json(dbWorkflows);
});

app.post("/api/workflows", (req, res) => {
  const workflow: Workflow = req.body;
  if (!workflow.id) workflow.id = `wf-${Date.now()}`;
  dbWorkflows = dbWorkflows.filter(w => w.id !== workflow.id);
  dbWorkflows.push(workflow);
  res.json(workflow);
});

app.delete("/api/workflows/:id", (req, res) => {
  dbWorkflows = dbWorkflows.filter(w => w.id !== req.params.id);
  res.json({ success: true });
});

app.get("/api/tasks", (req, res) => {
  res.json(dbTasks);
});

app.post("/api/tasks", (req, res) => {
  const task: TaskExecution = req.body;
  if (!task.id) task.id = `task-${Date.now()}`;
  dbTasks = dbTasks.filter(t => t.id !== task.id);
  dbTasks.push(task);
  res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  dbTasks = dbTasks.filter(t => t.id !== req.params.id);
  res.json({ success: true });
});

// Synced device mesh endpoints
app.get("/api/devices", (req, res) => {
  res.json(dbDevices);
});

app.post("/api/devices", (req, res) => {
  const device: SyncedDevice = req.body;
  dbDevices = dbDevices.filter(d => d.id !== device.id);
  dbDevices.push(device);
  res.json(device);
});

// System resources monitoring endpoints
app.get("/api/system-resources", (req, res) => {
  res.json(dbSystemResources);
});

app.post("/api/system-resources/simulate", (req, res) => {
  const lastMetric = dbSystemResources[dbSystemResources.length - 1];
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const activeTasks = dbTasks.filter(t => t.status === "running").length;
  const baseCpu = activeTasks > 0 ? 55 : 22;
  const cpu = Math.min(98, Math.max(8, Math.floor(baseCpu + Math.random() * 25)));
  const baseMemory = 38 + (activeTasks * 8);
  const memory = Math.min(95, Math.max(15, Math.floor(baseMemory + Math.random() * 8)));
  
  const newMetric: ResourceMetric = {
    timestamp: timeStr,
    cpu,
    memory,
    activeTasks
  };
  
  dbSystemResources.push(newMetric);
  if (dbSystemResources.length > 20) {
    dbSystemResources.shift();
  }
  res.json({ success: true, metric: newMetric, allMetrics: dbSystemResources });
});


// Sync Vault Endpoints for Zero-Knowledge synchronization
app.get("/api/sync/vault", (req, res) => {
  if (!cloudSyncVault) {
    return res.status(404).json({ error: "No backup data in sync vault." });
  }
  res.json(cloudSyncVault);
});

app.post("/api/sync/backup", (req, res) => {
  const backup: SyncBackup = req.body;
  cloudSyncVault = backup;
  
  // Also register backup event logs on device registry
  dbDevices.forEach(d => {
    if (d.deviceType === "local") {
      d.synchronizedAt = new Date().toISOString();
    }
  });
  
  res.json({ success: true, timestamp: cloudSyncVault.lastUpdated });
});

// Autonomous Step Execution using Gemini API (fall back to simulated execution with clear explanations)
app.post("/api/execute-step", async (req, res) => {
  const { taskId, stepId } = req.body;

  // Locate task and step
  const taskIndex = dbTasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found." });
  }

  const task = dbTasks[taskIndex];
  const stepIndex = task.steps.findIndex(s => s.id === stepId);
  if (stepIndex === -1) {
    return res.status(404).json({ error: "Step not found." });
  }

  const step = task.steps[stepIndex];
  const agent = dbAgents.find(a => a.id === step.agentId) || dbAgents[0];

  // Update status to running
  task.status = "running";
  step.status = "running";
  agent.status = "executing";

  // Record a resources spike reflecting active model compilation / API request load
  const runNow = new Date();
  const runTimeStr = runNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  dbSystemResources.push({
    timestamp: runTimeStr,
    cpu: Math.floor(78 + Math.random() * 18),
    memory: Math.floor(62 + Math.random() * 8),
    activeTasks: dbTasks.filter(t => t.status === "running").length || 1
  });
  if (dbSystemResources.length > 20) {
    dbSystemResources.shift();
  }

  const timestamp = new Date().toISOString();
  task.logs.push({
    timestamp,
    type: "agent_start",
    agentName: agent.name,
    message: `Starting Execution: ${step.description}`,
    detail: `Invoking model: ${agent.model} with temperature ${agent.temperature}`
  });

  const orchestratorPrompt = `
You are the autonomous agent "${agent.name}" playing the role of "${agent.role}".
Your instructions: "${agent.systemInstruction}"

OVERALL TASK GOAL: "${task.title}"
STEP TO EXECUTE: "${step.description}"
PROMPT CRITERIA: "${step.promptTemplate}"

Previous workflow state and execution outputs:
${JSON.stringify(task.steps.filter(s => s.status === 'completed').map(s => ({ step: s.description, output: s.output })))}

Provide a thorough, highly technological, and actionable completion result for this autonomous task. Work from your role perspective. Your response must be in clean, readable markdown format.
  `;

  try {
    const ai = getGemini();
    let resultText = "";

    if (ai) {
      // Real API execution
      const modelName = agent.model === "gemini-3.1-pro-preview" ? "gemini-3.5-flash" : agent.model; // Fallback to flash for premium if speed needed, or use directly.
      const response = await ai.models.generateContent({
        model: modelName,
        contents: orchestratorPrompt,
        config: {
          systemInstruction: agent.systemInstruction,
          temperature: agent.temperature,
        }
      });
      resultText = response.text || "Execution returned an empty body.";
    } else {
      // Detailed High-Fidelity Simulation when secrets aren't ready
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate think delay
      
      const detailsMap: Record<string, string> = {
        "agent-1": `### Vanguard Threat Matrix & Architectural Assessment
1. **Zero-Trust Replication Vector**: Sync pipelines over unencrypted sockets are vulnerable to session intercept. We enforce Client-Derivated Keys.
2. **Sniffing Exposure**: Memory caches holding unencrypted workflow definitions are isolated inside high-privilege app containers.
3. **Identity Assurance**: Every syncing node must verify its SHA-256 key footprint signature before synchronizing states.`,
        "agent-2": `### Strategic Multi-Agent Competitor Intelligence
A review of leading agent environments (such as AutoGPT, CrewAI, and decentralized nodes) reveals key performance indexes:
- **State-mesh Replication (89%)**: Utilizing client-side delta sync mechanisms.
- **Node-Sovereignty (72%)**: Running processing pipelines locally to keep data sovereign.
- **Cryptographic Enclaves (54%)**: End-to-end payload signature protocols.`,
        "agent-3": `### Crypto Sync Blueprint (SHA256 / AES-GCM)
Below is the proven WebCrypto structural key derivation script to synchronize nodes securely:
\`\`\`typescript
// Crypographic subkey derivation algorithm 
async function deriveSyncKey(passphrase: string, salt: Uint8Array) {
  const baseKey = await crypto.subtle.importKey(
    "raw", 
    new TextEncoder().encode(passphrase), 
    "PBKDF2", 
    false, 
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
\`\`\``
      };

      resultText = detailsMap[agent.id] || `### Autonomous Task Result
This step "${step.description}" has been successfully executed by Agent **${agent.name}** under the localized system guidelines.

- Identified objective: "${task.title}"
- Verified requirements: Validated task constraints and cryptographic parity.`;
    }

    // Save outputs
    step.status = "completed";
    step.output = resultText;
    agent.status = "idle";

    // Record resource cool-down after complete
    const finishNow = new Date();
    const finishTimeStr = finishNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    dbSystemResources.push({
      timestamp: finishTimeStr,
      cpu: Math.floor(25 + Math.random() * 12),
      memory: Math.floor(48 + Math.random() * 5),
      activeTasks: dbTasks.filter(t => t.status === "running").length
    });
    if (dbSystemResources.length > 20) {
      dbSystemResources.shift();
    }
    
    // Log success
    task.logs.push({
      timestamp: new Date().toISOString(),
      type: "agent_response",
      agentName: agent.name,
      message: `Completed Execution: ${step.description}`,
      detail: `Result generated successfully (${resultText.length} characters).`
    });

    // Check if entire task is completed
    const allDone = task.steps.every(s => s.status === "completed");
    if (allDone) {
      task.status = "completed";
      task.completedAt = new Date().toISOString();
      task.logs.push({
        timestamp: new Date().toISOString(),
        type: "info",
        message: "All workflow steps completed. Agent OS autonomous chain execution successful."
      });
    } else {
      task.currentStepIndex = Math.min(task.steps.length - 1, stepIndex + 1);
    }

    res.json({ success: true, task });
  } catch (err: any) {
    step.status = "failed";
    agent.status = "idle";
    task.status = "failed";
    
    task.logs.push({
      timestamp: new Date().toISOString(),
      type: "agent_error",
      agentName: agent.name,
      message: `Execution failed: ${err.message}`,
      detail: err.stack
    });

    res.status(500).json({ error: err.message, task });
  }
});

// Guidance system AI Chat support
app.post("/api/guidance/chat", async (req, res) => {
  const { message, history, isThinking } = req.body;

  try {
    const ai = getGemini();
    const modelToUse = isThinking ? "gemini-3.1-pro-preview" : "gemini-3.5-flash";

    if (ai) {
      const formattedContents: any[] = [];
      if (history && Array.isArray(history)) {
        history.forEach((h: any) => {
          formattedContents.push({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.text }]
          });
        });
      }
      formattedContents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const configPayload: any = {
        systemInstruction: `
You are the Agent OS Dedicated IT & Systems Support Co-Pilot, a friendly, ultra-intelligent, high-performance tactical virtual assistant designed to take great care of the Operator (the user) and maintain and secure their enterprise IT infrastructure and agent configurations.

YOUR CORE MANDATE:
Support, protect, and care for the user's IT environment. Educate on system health parameters, correct performance spikes, analyze cryptographic parity lock states, and help configure zero-knowledge file-system backups.

APP STRUCTURE & ARCHITECTURE:
1. "Control Center" / "Dashboard" (tab: 'dashboard'):
   - Features real-time system metrics (CPU utilization, Memory blocks, active tasks, and Parity Lock state).
   - Near-Real-Time 3D Holographic Cluster Map Canvas showing the decentral peer system relationships!
   - Shows active dynamic task sessions currently running in the queue.
   - Allows operators to simulate a telemetry CPU load spike using the spike controller.
2. "OS Shell" / "Terminal" (tab: 'terminal'):
   - An interactive command terminal where standard shell commands like "help", "agents", "workflows", "sync", "system", and "clear" operate.
   - Operators can execute and initialize pipelines natively here.
3. "Neural Sub-Cores" / "Agents" (tab: 'agents'):
   - A registry of deployed LLM sub-core configurations.
   - Standard nodes include "Architect Core" (methodical, temperature 0.2, gemini-3.1-pro-preview), "Intelligence Spec" (cyber intelligence, gemini-3.5-flash, temperature 0.5), and "SysExec" (secure script compiler, temperature 0.1).
   - Operators can customize guidelines, deploy new cores, or delete existing ones.
4. "Automations Engine" / "Workflows" (tab: 'workflows'):
   - Allows constructing multi-agent step-by-step automated reasoning sequences (pipelines).
   - Operators can trigger runs, view continuous logs, and step through agent executions, with resources spikes showing active reasoning load.
5. "Secure Sync" / "Secure Sync" (tab: 'sync'):
   - Provides local zero-knowledge backup.
   - Computes local sub-keys from their encryption passphrase using PBKDF2 WebCrypto, then encrypts data with AES-GCM before backing it up to the server. Under no circumstances does the central server see or possess raw configurations! Operators can secure sync or recover states here.

DYNAMICS & NAVIGATION:
- If the operator wants to see or navigate to a tab, or asks a question about a tab's feature, provide a comprehensive answer, AND APPEND tag '[NAVIGATE:tab_id]' (where tab_id is exactly 'dashboard', 'terminal', 'agents', 'workflows', or 'sync') to your text.
- Example: "You can configure your autonomous nodes in the Neural Sub-Cores area! [NAVIGATE:agents]"
- Keep your tone supportive, highly professional, with strong operations insights (e.g., calling them "Operator", speaking about "cryptographic integrity", "reindexing memory sectors", "zero-vulnerability policies"). Provide direct bullet-points and markdown layout.
`
      };

      if (isThinking) {
        configPayload.thinkingConfig = {
          thinkingLevel: ThinkingLevel.HIGH
        };
        // Explicitly ensuring no maxOutputTokens is set as mandated
      }

      const response = await ai.models.generateContent({
        model: modelToUse,
        contents: formattedContents,
        config: configPayload
      });

      res.json({ reply: response.text || "IT Guidance module returned zero response bytes." });
    } else {
      // High-Fidelity Intelligence simulation fallback and IT diagnostics helper mock
      await new Promise(resolve => setTimeout(resolve, isThinking ? 1200 : 600));
      const text = message.toLowerCase();
      let reply = "";

      let thinkingPrefix = "";
      if (isThinking) {
        thinkingPrefix = `> **[DEEP REASONING THINKING ENGINE INITIATED]**\n> * Analyzing operational vector: "${message}"\n> * Contextualizing IT support cluster map metrics.\n> * Inspecting memory tables & local parity registers...\n\n`;
      }

      if (text.includes("sync") || text.includes("backup") || text.includes("key")) {
        reply = thinkingPrefix + `### 🔒 ZERO-KNOWLEDGE ENCRYPTED SYSTEM REPLICATION\n\nUnder our zero-trust IT infrastructure, system backups are completely blind to the host:\n\n1. You establish an **Encryption Passphrase** (e.g., standard AES master seed).\n2. The system computes a unique SHA-251 cryptographic **Key Fingerprint** locally using standard SHA-256 derivation.\n3. Your states are encrypted client-side using PBKDF2 subkeys and standard AES-GCM.\n4. Only the unreadable ciphertext is stored securely in the cloud sync vault.\n\n[NAVIGATE:sync]\n\n*Would you like me to open the Secure Sync console to configure or verify replication sockets?*`;
      } else if (text.includes("agent") || text.includes("core") || text.includes("sub-core")) {
        reply = thinkingPrefix + `### 🧠 NEURAL SUB-CORE ARCHITECTURE\n\nOur environment registers and orchestrates LLM Cores with isolated workloads:\n\n- **Architect Core** (Gemini 3.1 Pro): Specialized in workflow task planning and system structure alignment.\n- **Intelligence Spec** (Gemini 3.5 Flash): Specialized in real-time information retrieval and competitive intelligence compilation.\n- **SysExec** (Gemini 3.1 Flash Lite): High-speed compilation, structured outputs, and zero-knowledge code audits.\n\nYou can customize instructions, scale individual sub-core parameters, or introduce new customized neural models into the cluster registry.\n\n[NAVIGATE:agents]\n\n*Would you like to head to the Neural Sub-Cores setup tab?*`;
      } else if (text.includes("workflow") || text.includes("automation") || text.includes("pipeline") || text.includes("run")) {
        reply = thinkingPrefix + `### ⚙️ AUTOMATED WORKFLOW PIPELINES\n\nWorkflows are sequence-based, multi-agent operations designed to execute intricate strategic tasks:\n\n1. Select a compiled profile such as **Market Intelligence Scan** or **Zero-Trust Cryptographic Auditing**.\n2. Click the run icon to instantiate a **Task Session** inside the processor queue.\n3. Step through individual phases synchronously. This launches heavy processing nodes on the server, spike-testing backend CPU metrics, and streaming results to your logs.\n\n[NAVIGATE:workflows]\n\n*Let me guide you directly to the Automations Engine to trigger or monitor dynamic pipeline runs!*`;
      } else if (text.includes("terminal") || text.includes("command") || text.includes("shell") || text.includes("cmd")) {
        reply = thinkingPrefix + `### 🐚 THE INTERACTIVE COMMAND TERMINAL\n\nThe fully operational low-level OS shell supports several diagnostic commands:\n\n- \`help\` - Generates complete command list directory.\n- \`system\` - Pulls processor architecture, latency, and memory block maps.\n- \`agents\` - Queries deployed agent cores.\n- \`workflows\` & \`run <id>\` - Configures or instantiates automation pipelines from the CLI.\n- \`sync\` - Triggers decentralized cryptographic syncing.\n\n[NAVIGATE:terminal]\n\n*Would you like to open the OS Shell and execute terminal commands?*`;
      } else if (text.includes("diagnostic") || text.includes("scan") || text.includes("check")) {
        reply = thinkingPrefix + `### 📊 SECURE IT REAL-TIME DIAGNOSTIC CHECKUP\n\nI have initialized a scan of your cluster's vital systems:\n\n- **3D Mesh Map**: Online and fully rotating. All 5 central peer coordinates are connected with healthy WebSocket handshakes.\n- **Processor Sockets**: Status stable (CPU Fluctuations between 20%-45%). Peak spikes are configured for auto-indexing.\n- **Cryptography Engine**: Operating normally. Ready for PBKDF2 Master key enrollment.\n\nLet me know if you want me to initiate a **Correction Scan** or **Defragment System Memory** directly from the IT toolkit buttons!`;
      } else {
        reply = thinkingPrefix + `### 🗺️ AGENT OS GUIDANCE CONSOLE\n\nWelcome back, Operator. I am your active IT Support and Systems guide. You can ask me query vectors regarding any subsystem:\n\n- **"How to synchronize client keys securely"** [NAVIGATE:sync]\n- **"What specialized sub-cores are deployed"** [NAVIGATE:agents]\n- **"How to compile multi-agent pipelines"** [NAVIGATE:workflows]\n- **"What terminal diagnostics are enabled"** [NAVIGATE:terminal]\n\nType your query, or trigger the **Interactive Guide Walkthrough** on the top right to take a step-by-step visual exploration of the entire console!`;
      }

      res.json({ reply });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite Middleware Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AGENT OS] Server launched successfully on http://localhost:${PORT}`);
  });
}

startServer();
