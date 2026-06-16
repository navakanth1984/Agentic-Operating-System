import React, { useState } from 'react';
import { Play, ClipboardList, Settings, CheckCircle2, XCircle, AlertTriangle, Cpu, ArrowRight, Layers, FileText, Check, Plus } from 'lucide-react';
import { Agent, Workflow, TaskExecution, WorkflowStep } from '../types';

interface WorkflowViewProps {
  workflows: Workflow[];
  agents: Agent[];
  tasks: TaskExecution[];
  onAddWorkflow: (wf: Workflow) => void;
  onExecuteWorkflowStep: (taskId: string, stepId: string) => Promise<void>;
  onCreateTaskFromWorkflow: (wfId: string) => Promise<string>;
}

export default function WorkflowView({
  workflows,
  agents,
  tasks,
  onAddWorkflow,
  onExecuteWorkflowStep,
  onCreateTaskFromWorkflow,
}: WorkflowViewProps) {
  const [selectedWf, setSelectedWf] = useState<Workflow | null>(workflows[0] || null);
  const [selectedTask, setSelectedTask] = useState<TaskExecution | null>(tasks[0] || null);

  // Workflow builder state
  const [isCreating, setIsCreating] = useState(false);
  const [newWfName, setNewWfName] = useState('');
  const [newWfDesc, setNewWfDesc] = useState('');
  const [newWfSteps, setNewWfSteps] = useState<Omit<WorkflowStep, 'id' | 'status'>[]>([
    { agentId: agents[0]?.id || 'agent-1', description: 'Analyze baseline structure', promptTemplate: 'Assess code safety parameters.' },
  ]);

  const [executingStepId, setExecutingStepId] = useState<string | null>(null);

  const handleStepChange = (index: number, field: string, value: any) => {
    const updated = [...newWfSteps];
    updated[index] = { ...updated[index], [field]: value };
    setNewWfSteps(updated);
  };

  const handleAddStepToBuild = () => {
    setNewWfSteps([
      ...newWfSteps,
      { agentId: agents[0]?.id || 'agent-1', description: 'Next Workflow Step', promptTemplate: 'Synthesize details...' },
    ]);
  };

  const handleRemoveStepFromBuild = (index: number) => {
    if (newWfSteps.length === 1) return;
    setNewWfSteps(newWfSteps.filter((_, i) => i !== index));
  };

  const handleCreateWorkflowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName.trim() || !newWfDesc.trim()) return;

    const formattedSteps: WorkflowStep[] = newWfSteps.map((step, idx) => ({
      ...step,
      id: `step-${Date.now()}-${idx}`,
      status: 'pending',
    }));

    onAddWorkflow({
      id: `wf-${Date.now()}`,
      name: newWfName,
      description: newWfDesc,
      steps: formattedSteps,
      createdAt: new Date().toISOString(),
    });

    setNewWfName('');
    setNewWfDesc('');
    setNewWfSteps([{ agentId: agents[0]?.id || 'agent-1', description: 'Analyze baseline structure', promptTemplate: 'Assess code safety.' }]);
    setIsCreating(false);
  };

  const triggerInstantiateTask = async (wf: Workflow) => {
    const newTaskId = await onCreateTaskFromWorkflow(wf.id);
    const newTask = tasks.find((t) => t.id === newTaskId);
    if (newTask) setSelectedTask(newTask);
  };

  const triggerExecuteStep = async (taskId: string, stepId: string) => {
    setExecutingStepId(stepId);
    try {
      await onExecuteWorkflowStep(taskId, stepId);
      // Retrieve updated task info
      const updatedTask = tasks.find((t) => t.id === taskId);
      if (updatedTask) setSelectedTask(updatedTask);
    } catch (err) {
      console.error(err);
    } finally {
      setExecutingStepId(null);
    }
  };

  const triggerExecuteEntireWorkflow = async (task: TaskExecution) => {
    for (const step of task.steps) {
      if (step.status !== 'completed') {
        await triggerExecuteStep(task.id, step.id);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start relative z-10">
      {/* LEFT COLUMN: List Workflows & Creator */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#0D1117] border border-[#1E293B] rounded-sm p-4.5 shadow-lg">
          <div className="flex items-center justify-between mb-4 border-b border-[#1E293B] pb-3">
            <h2 className="text-xs font-bold tracking-widest text-[#E2E8F0] uppercase flex items-center gap-2 font-mono">
              <Layers className="w-4 h-4 text-indigo-400" />
              Workflow Registry
            </h2>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="text-[10px] font-bold font-mono uppercase text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
              id="btn-create-workflow"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              Design New
            </button>
          </div>

          {!isCreating ? (
            <div className="space-y-3">
              {workflows.map((wf) => {
                const isSelected = selectedWf?.id === wf.id;
                return (
                  <div
                    key={wf.id}
                    onClick={() => setSelectedWf(wf)}
                    className={`p-3.5 rounded-sm border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-[#1E293B]/20 border-indigo-500/50 shadow-md'
                        : 'bg-[#0A0C10] border-[#1E293B] hover:bg-[#1E293B]/10 hover:border-[#1E293B]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors font-mono">
                        {wf.name}
                      </div>
                      <span className="text-[9px] font-mono bg-[#0A0C10] text-[#CBD5E1] px-2 py-0.5 rounded-sm border border-[#1E293B]">
                        {wf.steps.length} Steps
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 font-mono">{wf.description}</p>
                    <div className="mt-3 flex justify-between items-center text-[10px]">
                      <span className="text-[9px] font-mono text-slate-500 font-semibold">Node Cluster: Local + Crypt Mesh</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerInstantiateTask(wf);
                        }}
                        className="bg-[#1E293B] hover:bg-[#1E293B]/80 text-[#E2E8F0] font-bold px-2.5 py-1 rounded-sm transition text-[9px] font-mono uppercase flex items-center gap-1"
                        id={`btn-instantiate-wf-${wf.id}`}
                      >
                        <Play className="w-2.5 h-2.5 text-indigo-400" />
                        Instantiate Task
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCreateWorkflowSubmit} className="space-y-4" id="workflow-designer-form">
              <div>
                <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Workflow Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Competitive Vulnerability Research"
                  value={newWfName}
                  onChange={(e) => setNewWfName(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-[#1E293B] text-white rounded-sm py-1.5 px-3 text-xs focus:outline-none focus:border-indigo-400 font-mono"
                  id="new-wf-name-input"
                />
              </div>

              <div>
                <label className="block text-[8px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1 font-mono">Objective Summary</label>
                <input
                  type="text"
                  required
                  placeholder="Briefly state the goal of this pipeline"
                  value={newWfDesc}
                  onChange={(e) => setNewWfDesc(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-[#1E293B] text-white rounded-sm py-1.5 px-3 text-xs focus:outline-none focus:border-indigo-400 font-mono"
                  id="new-wf-desc-input"
                />
              </div>

              <div className="space-y-3 font-mono">
                <div className="flex justify-between items-center border border-[#1E293B]/60 p-1 px-2 rounded-sm bg-[#0A0C10]/40">
                  <span className="text-[8px] font-bold text-[#94A3B8] uppercase tracking-widest font-mono">Pipeline Steps</span>
                  <button
                    type="button"
                    onClick={handleAddStepToBuild}
                    className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold font-mono uppercase flex items-center gap-0.5"
                    id="btn-add-step-to-build"
                  >
                    + Add Step
                  </button>
                </div>

                {newWfSteps.map((step, idx) => (
                  <div key={idx} className="bg-[#0A0C10] border border-[#1E293B] p-3 rounded-sm space-y-2 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold font-mono text-indigo-400 uppercase">Step #{idx + 1}</span>
                      {newWfSteps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStepFromBuild(idx)}
                          className="text-[9px] font-bold font-mono uppercase text-rose-400 hover:text-rose-300"
                          id={`btn-remove-build-step-${idx}`}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="Step description (e.g. Gather strategic intelligence)"
                      value={step.description}
                      onChange={(e) => handleStepChange(idx, 'description', e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#1E293B] text-white rounded-sm py-1 px-2.5 text-[11px] focus:outline-none focus:border-indigo-450"
                      id={`build-step-desc-${idx}`}
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="block text-[8px] text-slate-500 uppercase font-bold mb-1">Agent</label>
                        <select
                          value={step.agentId}
                          onChange={(e) => handleStepChange(idx, 'agentId', e.target.value)}
                          className="w-full bg-[#0D1117] border border-[#1E293B] text-white rounded-sm p-1 text-[10px]"
                          id={`build-step-agent-${idx}`}
                        >
                          {agents.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[8px] text-slate-500 uppercase font-bold mb-1">Prompt Guidance</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Conduct SWOT danger index"
                          value={step.promptTemplate}
                          onChange={(e) => handleStepChange(idx, 'promptTemplate', e.target.value)}
                          className="w-full bg-[#0D1117] border border-[#1E293B] text-white rounded-sm py-1 px-2.5 text-[10px] focus:outline-none focus:border-indigo-400"
                          id={`build-step-prompt-${idx}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="bg-[#0A0C10] border border-[#1E293B] text-slate-300 text-[10px] font-bold font-mono uppercase px-3 py-1.5 rounded-sm"
                  id="btn-cancel-create-wf"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-650 hover:bg-indigo-600 border border-[#1E293B] text-white text-[10px] font-bold font-mono uppercase px-3 py-1.5 rounded-sm"
                  id="btn-submit-create-wf"
                >
                  Save Pipeline
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Dynamic Task Instance Selector */}
        <div className="bg-[#0D1117] border border-[#1E293B] rounded-sm p-4.5 shadow-lg">
          <h2 className="text-xs font-bold tracking-widest text-[#E2E8F0] uppercase flex items-center gap-2 mb-4 border-b border-[#1E293B] pb-3 font-mono">
            <ClipboardList className="w-4 h-4 text-indigo-400" />
            Task Instance Session Queue
          </h2>

          <div className="max-h-[170px] overflow-y-auto space-y-3.5 pr-1.5 custom-scrollbar font-mono">
            {tasks.map((task) => {
              const isSelected = selectedTask?.id === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-3 rounded-sm border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#1E293B]/20 border-indigo-500/50'
                      : 'bg-[#0A0C10] border-[#1E293B] hover:bg-[#1E293B]/10 hover:border-[#1E293B]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-[11px] font-bold text-slate-200 truncate">{task.title}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">
                      {new Date(task.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[8px] px-2 py-0.5 rounded-none font-mono font-bold border ${
                        task.status === 'completed'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900'
                          : task.status === 'running'
                          ? 'bg-amber-950/40 text-amber-400 border-amber-900'
                          : task.status === 'failed'
                          ? 'bg-rose-950/40 text-rose-400 border-rose-900'
                          : 'bg-slate-850 text-slate-400 border-slate-800'
                      }`}
                    >
                      {task.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Pipeline Execution Detail & Logs */}
      <div className="lg:col-span-7 space-y-6">
        {selectedTask ? (
          <div className="bg-[#0D1117] border border-[#1E293B] rounded-sm p-4.5 shadow-lg space-y-6">
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <div>
                <h2 className="text-xs font-bold text-[#E2E8F0] tracking-wider uppercase font-mono truncate max-w-[250px] lg:max-w-none">{selectedTask.title}</h2>
                <div className="text-[9px] text-[#94A3B8] mt-1 flex items-center gap-1.5 font-mono">
                  <span>ID: {selectedTask.id}</span>
                  <span>|</span>
                  <span>Steps: {selectedTask.steps.length}</span>
                </div>
              </div>
              <button
                onClick={() => triggerExecuteEntireWorkflow(selectedTask)}
                disabled={selectedTask.status === 'completed' || selectedTask.status === 'running'}
                className="bg-[#1E293B] hover:bg-[#1E293B]/80 text-[#E2E8F0] border border-[#1E293B] text-[10px] font-bold font-mono uppercase px-3 py-1.5 rounded-sm transition disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                id="btn-run-all-steps"
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-455 animate-spin-slow" />
                Run Secure Chain
              </button>
            </div>

            {/* Visual Pipeline nodes */}
            <div className="space-y-4">
              <span className="text-[8px] font-bold font-mono text-slate-400 uppercase tracking-widest">Active Pipeline Steps</span>
              <div className="space-y-3.5">
                {selectedTask.steps.map((step, idx) => {
                  const assignedAgent = agents.find((a) => a.id === step.agentId) || agents[0];
                  const isPending = step.status === 'pending';
                  const isRunning = step.status === 'running';
                  const isCompleted = step.status === 'completed';
                  const isFailed = step.status === 'failed';

                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-sm border transition relative overflow-hidden ${
                        isRunning
                          ? 'bg-[#1E293B]/25 border-amber-500/50 shadow-md animate-pulse'
                          : isCompleted
                          ? 'bg-[#0A0C10] border-[#1E293B]'
                          : 'bg-[#0A0C10]/40 border-[#1E293B]/50 opacity-80'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-7 h-7 rounded-sm font-bold font-mono flex items-center justify-center text-[10px] shrink-0 ${assignedAgent?.iconColor}`}>
                            {assignedAgent?.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-200 font-mono">
                              #{idx + 1}: {step.description}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1 font-mono">
                              Owner Core: <b className="text-slate-400 font-bold">{assignedAgent?.name}</b> ({assignedAgent?.role})
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto font-mono">
                          {isRunning && (
                            <span className="text-[8px] font-mono font-bold uppercase text-amber-500 bg-amber-955/40 border border-amber-900/60 px-2 py-0.5 rounded-none animate-pulse">
                              Gemini Reasoning...
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[8px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950/40 border border-emerald-950/60 px-2 py-0.5 rounded-none flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" /> Consensus Locked
                            </span>
                          )}

                          <button
                            onClick={() => triggerExecuteStep(selectedTask.id, step.id)}
                            disabled={executingStepId !== null || isCompleted}
                            className={`text-[9px] font-bold font-mono uppercase px-2.5 py-1 rounded-sm transition ${
                              isCompleted
                                ? 'bg-[#0A0C10] border border-[#1E293B] text-slate-500 cursor-not-allowed'
                                : 'bg-indigo-650 hover:bg-indigo-600 text-white cursor-pointer shadow-sm'
                            }`}
                            id={`btn-execute-step-${step.id}`}
                          >
                            {executingStepId === step.id ? 'Running' : isCompleted ? 'Success' : 'Run Stage'}
                          </button>
                        </div>
                      </div>

                      {/* Prompt and output snippet container */}
                      <div className="mt-3.5 space-y-2 text-[10px] pt-3 border-t border-[#1E293B] font-mono">
                        <div className="text-slate-500 flex items-center gap-1.5">
                          <span className="font-bold text-indigo-400 uppercase">INPUT PROMPT:</span>
                          <span className="truncate max-w-[280px] sm:max-w-none text-slate-300">{step.promptTemplate}</span>
                        </div>

                        {step.output && (
                          <div className="bg-[#0A0C10] rounded-sm p-3 border border-[#1E293B] max-h-[140px] overflow-y-auto text-slate-300 font-sans leading-relaxed text-[10px] space-y-2 mt-2 custom-scrollbar">
                            <span className="font-mono text-[8px] text-emerald-400 border-b border-[#1E293B] pb-1.5 flex items-center gap-1 mb-2.5 uppercase tracking-wider font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              Decentralized Execution Log Output
                            </span>
                            <div className="whitespace-pre-line text-slate-350 text-[11px] font-mono">{step.output}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Console Log output details */}
            <div className="space-y-3 pt-4 border-t border-[#1E293B] font-mono">
              <span className="text-[8px] font-bold font-mono text-slate-500 uppercase tracking-widest">Active Process Logs</span>
              <div className="bg-[#0A0C10] rounded-sm border border-[#1E293B] p-4 font-mono text-[10px] space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                {selectedTask.logs.map((log, i) => {
                  let logColor = 'text-slate-400';
                  if (log.type === 'agent_start') logColor = 'text-amber-400';
                  if (log.type === 'agent_response') logColor = 'text-emerald-400';
                  if (log.type === 'agent_error') logColor = 'text-rose-450';

                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-slate-650 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="text-slate-600 shrink-0">[{log.type.toUpperCase()}]</span>
                      {log.agentName && <span className="text-indigo-400 font-bold shrink-0">{log.agentName}:</span>}
                      <div className="min-w-0 pr-1.5 flex-1 select-all hover:bg-[#1E293B]/10 pl-2 border-l border-transparent hover:border-[#1E293B] transition-all">
                        <span className={`${logColor}`}>{log.message}</span>
                        {log.detail && <p className="text-[9px] text-[#94A3B8] mt-0.5 leading-relaxed">{log.detail}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#0D1117] rounded-sm border border-dashed border-[#1E293B] p-12 text-center text-[#94A3B8] text-xs font-mono">
            Select or instantiate a task from the left sidebar to inspect workflow details.
          </div>
        )}
      </div>
    </div>
  );
}
