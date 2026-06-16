export interface Agent {
  id: string;
  name: string;
  role: string;
  systemInstruction: string;
  temperature: number;
  model: 'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite';
  status: 'idle' | 'orchestrating' | 'analyzing' | 'executing';
  iconColor: string; // Tailwind bg color class
}

export interface WorkflowStep {
  id: string;
  agentId: string; // The agent who executes this step
  description: string;
  promptTemplate: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  createdAt: string;
}

export interface ExecutionLog {
  timestamp: string;
  type: 'info' | 'agent_start' | 'agent_response' | 'agent_error' | 'sync' | 'encrypt' | 'decrypt';
  agentName?: string;
  message: string;
  detail?: string;
}

export interface TaskExecution {
  id: string;
  title: string;
  workflowId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStepIndex: number;
  steps: WorkflowStep[];
  logs: ExecutionLog[];
  createdAt: string;
  completedAt?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  order?: number;
}

export interface SyncedDevice {
  id: string;
  name: string;
  deviceType: 'local' | 'laptop' | 'mobile';
  encryptionKeyFingerprint: string;
  synchronizedAt: string;
  active: boolean;
  ipAddress: string;
}

export interface SyncBackup {
  id: string;
  encryptedWorkflows: string;
  encryptedAgents: string;
  encryptedTasks: string;
  lastUpdated: string;
  salt: string;
  iv?: string;
}

export interface ResourceMetric {
  timestamp: string;
  cpu: number;
  memory: number;
  activeTasks: number;
}

