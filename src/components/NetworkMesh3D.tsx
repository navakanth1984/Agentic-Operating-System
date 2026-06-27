import React, { useRef, useEffect, useState } from 'react';
import { Orbit, Compass, Zap, Activity } from 'lucide-react';

interface QuantumNodeState {
  name: string;
  role: string;
  baseRadius: number;
  speed: number;
  phase: number;
  color: string;
  size: number;
  cpu: number;
  spin: number;
}

interface QuantumFoamParticle {
  x: number;
  y: number;
  z: number;
  frequency: number;
  amplitude: number;
  life: number;
  color: string;
}

interface NetworkMesh3DProps {
  agentsCount?: number;
  isSpiking?: boolean;
}

// ⚡ Bolt Optimization: Wrap component in React.memo to prevent unnecessary canvas re-renders and logic recalcs
// when parent component (App.tsx) re-renders due to unrelated state changes (like drag events or global polling).
// Expected Impact: Significantly lowers main thread CPU usage, removes canvas jitter on App state changes.
export default React.memo(function NetworkMesh3D({ agentsCount = 3, isSpiking = false }: NetworkMesh3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Spacetime control states
  const [coherence, setCoherence] = useState<number>(0.85); // 0.0 to 1.0 (Quantum Coherence)
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.2); 
  const [selectedNode, setSelectedNode] = useState<string | null>("Architect Core");
  const [isWaveCollapsed, setIsWaveCollapsed] = useState<boolean>(false);

  // Rotation angles controlled by drag
  const rotationRef = useRef({ theta: 0.3, phi: 0.4 });
  const dragStart = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  // Quantum node structures
  const nodes = useRef<QuantumNodeState[]>([
    { name: "Architect Core", role: "Planning", baseRadius: 0, speed: 0, phase: 0, color: "#6366F1", size: 10, cpu: 28, spin: 0.01 },
    { name: "Intelligence Spec", role: "Intel Scan", baseRadius: 52, speed: 1.4, phase: 0, color: "#06B6D4", size: 7.5, cpu: 14, spin: 0.03 },
    { name: "SysExec Core", role: "Script Auditing", baseRadius: 85, speed: -1.0, phase: Math.PI * 0.4, color: "#10B981", size: 8, cpu: 22, spin: -0.02 },
    { name: "Crypt Parity Node", role: "Passphrase Sync", baseRadius: 115, speed: 0.75, phase: Math.PI * 1.1, color: "#F59E0B", size: 6.5, cpu: 9, spin: 0.05 },
    { name: "Telemetry Proxy", role: "Load Balancing", baseRadius: 145, speed: -0.55, phase: Math.PI * 1.6, color: "#EC4899", size: 6, cpu: 11, spin: -0.045 },
  ]);

  // Quantum Foam representation (Heisenberg virtual particles)
  const quantumFoam = useRef<QuantumFoamParticle[]>([]);

  // Drag interaction
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    
    rotationRef.current.theta += deltaX * 0.007;
    rotationRef.current.phi += deltaY * 0.007;

    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Trigger quantum wavefunction collapse event
  const triggerWaveCollapse = () => {
    setIsWaveCollapsed(true);
    setCoherence(1.0);
    setTimeout(() => {
      setIsWaveCollapsed(false);
      setCoherence(0.72 + Math.random() * 0.18);
    }, 2500);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resizeCanvas = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      canvas.width = (rect?.width || 380) * window.devicePixelRatio;
      canvas.height = 255 * window.devicePixelRatio;
      canvas.style.width = '100%';
      canvas.style.height = '255px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Simulated fluctuating CPU loads
    const loadInterval = setInterval(() => {
      nodes.current.forEach(n => {
        const d = (Math.random() - 0.5) * 6;
        n.cpu = Math.max(4, Math.min(99, Math.round(n.cpu + d)));
        if (isSpiking) {
          n.cpu = Math.max(82, Math.min(99, Math.round(n.cpu + Math.random() * 6)));
        }
      });
    }, 1800);

    // Initial quantum foam injection
    for (let i = 0; i < 35; i++) {
      quantumFoam.current.push({
        x: (Math.random() - 0.5) * 240,
        y: (Math.random() - 0.5) * 200,
        z: (Math.random() - 0.5) * 240,
        frequency: 0.02 + Math.random() * 0.05,
        amplitude: 2 + Math.random() * 6,
        life: Math.random(),
        color: ['#6366F1', '#06B6D4', '#38BDF8', '#818CF8'][Math.floor(Math.random() * 4)]
      });
    }

    // Core holographic quantum loop
    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const centerX = width / 2;
      const centerY = height / 2;

      // Dark Cosmic vacuum state clear
      ctx.clearRect(0, 0, width, height);

      // Programmatic rotation drift
      if (!isDragging.current) {
        const driftSpeed = isSpiking ? 0.009 : 0.0035;
        rotationRef.current.theta += driftSpeed * speedMultiplier;
        rotationRef.current.phi += (driftSpeed * 0.7) * speedMultiplier;
      }

      const theta = rotationRef.current.theta;
      const phi = rotationRef.current.phi;

      // trigonometric coefficients for 3D rotation projection
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);

      const timeDim = Date.now() * 0.001 * speedMultiplier;

      // 💫 1. Update Quantum Foam virtual particles (Heisenberg state collapses)
      quantumFoam.current.forEach(p => {
        p.life += 0.008;
        if (p.life >= 1.0) {
          p.life = 0;
          p.x = (Math.random() - 0.5) * 260;
          p.y = (Math.random() - 0.5) * 210;
          p.z = (Math.random() - 0.5) * 260;
        }

        // Add small high frequency quantum jitter
        const jitter = Math.sin(timeDim * 20 + p.x) * p.amplitude * (1 - coherence);
        const curX = p.x + jitter;
        const curY = p.y + Math.cos(timeDim * 15 + p.y) * p.amplitude * (1 - coherence);
        const curZ = p.z + jitter;

        // Apply 3D coordinate mapping
        const x1 = curX * cosT - curZ * sinT;
        const z1 = curX * sinT + curZ * cosT;
        const y2 = curY * cosP - z1 * sinP;
        const z2 = curY * sinP + z1 * cosP;

        const fov = 340;
        const scale = fov / (fov + z2);
        const projX = centerX + x1 * scale;
        const projY = centerY + y2 * scale;

        if (projX >= 0 && projX <= width && projY >= 0 && projY <= height) {
          const alpha = Math.sin(Math.PI * p.life) * 0.35 * scale;
          ctx.beginPath();
          ctx.arc(projX, projY, Math.max(0.5, 1.2 * scale), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1.0; // reset

      // Draw background spacetime coordinate frame reference grids (Einstein-Rosen tunnels)
      ctx.strokeStyle = 'rgba(79, 70, 229, 0.06)';
      ctx.lineWidth = 0.5;
      for (let i = -3; i <= 3; i++) {
        const gridY = i * 40;
        ctx.beginPath();
        // Ring around Y axis
        for (let angle = 0; angle <= Math.PI * 2; angle += 0.15) {
          const rad = 110;
          const rx = rad * Math.cos(angle);
          const rz = rad * Math.sin(angle);
          // rotate
          const x1 = rx * cosT - rz * sinT;
          const z1 = rx * sinT + rz * cosT;
          const y2 = gridY * cosP - z1 * sinP;
          const z2 = gridY * sinP + z1 * cosP;

          const fov = 340;
          const scale = fov / (fov + z2);
          const px = centerX + x1 * scale;
          const py = centerY + y2 * scale;

          if (angle === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // 🌀 2. Precalculate spiral trails for historical solar system trajectory (Moving along vertical axis Y)
      // We will trace the 3D helix ropes based on time progression t
      const spiralSegmentsCount = 45;
      
      const projectedNodes = nodes.current.map((n, nodeIndex) => {
        // Current state calculation for the node
        const nodeAngle = (timeDim * n.speed) + n.phase;
        
        // Helical Y progression: moves through orbit and time axes
        // To stay within screen bounds without snapping, we model a beautiful wave oscillation 
        // coupled with continuous spiral drift.
        const currentY = 110 * Math.sin(timeDim * 0.4 + nodeIndex * 1.5) - (nodeIndex * 8);
        const currentX = n.baseRadius * Math.cos(nodeAngle);
        const currentZ = n.baseRadius * Math.sin(nodeAngle);

        // Apply Heisenberg Uncertainty wiggles when coherence is low & node is NOT selected (observer is not watching)
        const isCurrentSelected = selectedNode === n.name;
        let finalX = currentX;
        let finalY = currentY;
        let finalZ = currentZ;

        // superposition wave function jitter
        if (!isCurrentSelected && !isWaveCollapsed) {
          const quantumDelta = (1.0 - coherence) * 22;
          finalX += Math.sin(timeDim * 18 + nodeIndex) * quantumDelta;
          finalY += Math.cos(timeDim * 22 + nodeIndex * 2) * (quantumDelta * 0.6);
          finalZ += Math.cos(timeDim * 15 - nodeIndex) * quantumDelta;
        }

        // Project node to 3D space
        const x1 = finalX * cosT - finalZ * sinT;
        const z1 = finalX * sinT + finalZ * cosT;
        const y2 = finalY * cosP - z1 * sinP;
        const z2 = finalY * sinP + z1 * cosP;

        const fov = 340;
        const scale = fov / (fov + z2);
        const projX = centerX + x1 * scale;
        const projY = centerY + y2 * scale;

        const pulse = 1 + Math.sin(Date.now() * 0.02 * (nodeIndex + 1)) * 0.16;
        const glowSize = n.size * scale * pulse;

        // Generate the spatial helix trail coordinates (showing orbital path history in space-time)
        const trailPoints: Array<{ px: number, py: number, scale: number, alpha: number }> = [];
        
        for (let s = 1; s <= spiralSegmentsCount; s++) {
          const sTime = timeDim - (s * 0.035);
          const sAngle = (sTime * n.speed) + n.phase;
          const sY = 110 * Math.sin(sTime * 0.4 + nodeIndex * 1.5) - (nodeIndex * 8);
          let sX = n.baseRadius * Math.cos(sAngle);
          let sZ = n.baseRadius * Math.sin(sAngle);

          if (!isCurrentSelected && !isWaveCollapsed) {
            const sJitter = (1.0 - coherence) * 16 * (1 - s / spiralSegmentsCount);
            sX += Math.sin(sTime * 18 + nodeIndex) * sJitter;
            sZ += Math.cos(sTime * 15 - nodeIndex) * sJitter;
          }

          const sx1 = sX * cosT - sZ * sinT;
          const sz1 = sX * sinT + sZ * cosT;
          const sy2 = sY * cosP - sz1 * sinP;
          const sz2 = sY * sinP + sz1 * cosP;

          const sScale = fov / (fov + sz2);
          const sProjX = centerX + sx1 * sScale;
          const sProjY = centerY + sy2 * sScale;

          // Fade out towards the tail bounds
          const normalAlpha = (1 - s / spiralSegmentsCount) * 0.42 * sScale;

          trailPoints.push({
            px: sProjX,
            py: sProjY,
            scale: sScale,
            alpha: normalAlpha
          });
        }

        return {
          node: n,
          projX,
          projY,
          scale,
          depth: z2,
          glowSize,
          isCurrentSelected,
          trailPoints
        };
      });

      // Sort projected nodes to draw background elements first
      const sortedProjectedNodes = [...projectedNodes].sort((a, b) => b.depth - a.depth);

      // 🪐 3. Draw Helix Spiral time rails for each Bohr gravity shell (Background)
      projectedNodes.forEach(({ trailPoints, node, scale }) => {
        if (trailPoints.length < 2) return;
        
        ctx.lineWidth = isSpiking ? 1.55 : 0.95;
        
        for (let i = 0; i < trailPoints.length - 1; i++) {
          const p1 = trailPoints[i];
          const p2 = trailPoints[i + 1];

          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          
          let colorString = node.color;
          if (node.baseRadius === 0) colorString = '#818CF8';

          // Set dynamic gradient or opacity
          ctx.strokeStyle = colorString;
          ctx.globalAlpha = p1.alpha * coherence;
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0; // Reset
      });

      // ⚡ 4. Draw Core Cryptographic quantum entanglement links (observer entanglement threads)
      const coreNodeProj = projectedNodes.find(pn => pn.node.baseRadius === 0);
      if (coreNodeProj) {
        projectedNodes.forEach(({ projX, projY, node, scale, isCurrentSelected }) => {
          if (node.baseRadius === 0) return; // skip center string to self

          ctx.beginPath();
          ctx.moveTo(coreNodeProj.projX, coreNodeProj.projY);
          ctx.lineTo(projX, projY);

          // Render superposed wave thread (looks like neon string)
          if (isCurrentSelected) {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.5 * scale;
            ctx.globalAlpha = 0.72;
          } else {
            // Unselected nodes have vibrating sine wave links
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 0.55 * scale;
            ctx.globalAlpha = 0.28 * coherence;
          }
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        });
      }

      // 🛸 5. Draw Mother primary Core (Sun equivalent traveling on Timeline axis)
      if (coreNodeProj) {
        const { projX, projY, glowSize } = coreNodeProj;
        const coreCentralGlow = 16 * (1.1 + (isSpiking ? 0.3 : 0));

        ctx.beginPath();
        const centerGrad = ctx.createRadialGradient(
          projX, projY, 1, 
          projX, projY, coreCentralGlow
        );
        centerGrad.addColorStop(0, '#FFFFFF');
        centerGrad.addColorStop(0.2, '#6366F1');
        centerGrad.addColorStop(0.65, 'rgba(99, 102, 241, 0.35)');
        centerGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        
        ctx.fillStyle = centerGrad;
        ctx.arc(projX, projY, coreCentralGlow * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Solid core quark
        ctx.beginPath();
        ctx.arc(projX, projY, 4.2 * coreNodeProj.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }

      // ⚛️ 6. Render Shell Node Spheres & Probability wave envelopes
      sortedProjectedNodes.forEach(({ node, projX, projY, scale, glowSize, isCurrentSelected }) => {
        if (node.baseRadius === 0) return; // Core handled above

        // Observer effect graphic decoration: Draw probability wave-envelope clouds
        if (!isCurrentSelected && !isWaveCollapsed) {
          // Draw fuzzy rings representing quantum wave expansion
          ctx.beginPath();
          ctx.arc(projX, projY, glowSize * 2.0, 0, Math.PI * 2);
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 0.4;
          ctx.globalAlpha = (1.0 - coherence) * 0.45 * scale;
          ctx.stroke();

          // Render fuzzy double state particles (superposition duality)
          const offsetDist = (1 - coherence) * 11;
          ctx.beginPath();
          ctx.arc(projX + offsetDist, projY - offsetDist, glowSize * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.globalAlpha = 0.15;
          ctx.fill();
        }

        ctx.globalAlpha = 1.0;

        // Solid aura glow
        ctx.beginPath();
        const nodeGrad = ctx.createRadialGradient(
          projX, projY, 1, 
          projX, projY, glowSize * 1.8
        );
        nodeGrad.addColorStop(0, node.color);
        nodeGrad.addColorStop(0.35, node.color);
        nodeGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = nodeGrad;
        ctx.arc(projX, projY, glowSize * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Draw solid kernel
        ctx.beginPath();
        ctx.arc(projX, projY, Math.max(2.2, node.size * scale * 0.42), 0, Math.PI * 2);
        ctx.fillStyle = isCurrentSelected ? '#FFFFFF' : node.color;
        ctx.fill();

        // Precision observer boundaries inside collapsed state
        if (isCurrentSelected || isWaveCollapsed) {
          ctx.beginPath();
          ctx.arc(projX, projY, glowSize * 1.25, 0, Math.PI * 2);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Spark trace pointer (indicates vector alignment)
          ctx.beginPath();
          const pAngle = timeDim * 4;
          ctx.moveTo(projX, projY);
          ctx.lineTo(projX + Math.cos(pAngle) * (glowSize * 1.25), projY + Math.sin(pAngle) * (glowSize * 1.25));
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Labels mapping inside the viewport bounds
        if (scale > 0.58) {
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = isCurrentSelected ? '#F8FAFC' : '#94A3B8';
          
          const labelText = node.name.replace(" Core", "").replace(" Node", "");
          ctx.fillText(labelText, projX + 11, projY + 2);

          // Quantum state frequency metric
          ctx.font = '8px monospace';
          const frequencyGiga = Math.abs(node.speed * speedMultiplier * 10).toFixed(1);
          ctx.fillStyle = isCurrentSelected ? '#818CF8' : '#64748B';
          ctx.fillText(`ψ_spin[${frequencyGiga} GHz]`, projX + 11, projY + 11);
        }
      });

      // Quick diagnostic HUD indicators
      ctx.fillStyle = 'rgba(100, 116, 139, 0.5)';
      ctx.font = '7.5px monospace';
      ctx.textAlign = 'center';
      
      const hudCoherence = (coherence * 100).toFixed(0);
      const hudVelocity = (speedMultiplier * 299792).toFixed(0);
      ctx.fillText(
        `[QUANTUM_COHERENCE: ${hudCoherence}%]  [TIME_DRIFT_AXIS: helically_aligned]  [GRAVITY_SPEED: ${hudVelocity} km/s]`, 
        centerX, 
        height - 8
      );
      ctx.textAlign = 'left';

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(loadInterval);
    };
  }, [selectedNode, isSpiking, coherence, speedMultiplier, isWaveCollapsed]);

  return (
    <div 
      ref={containerRef}
      className="bg-slate-950 border border-slate-900 rounded-2xl p-4 shadow-2.5xl relative overflow-hidden flex flex-col justify-between"
      style={{ minHeight: '365px' }}
    >
      {/* Visual background portals */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-12 left-6 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Spacetime and Quantum Telemetry Header */}
      <div className="flex items-start justify-between border-b border-slate-900 pb-3 z-10 gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-mono flex items-center gap-1.5">
            <Orbit className="w-3.5 h-3.5 text-indigo-400 animate-spin [animation-duration:12s]" />
            QUANTUM HELICAL TIME ENGINE
          </span>
          <h3 className="text-xs font-bold text-slate-100 uppercase mt-0.5 tracking-wider font-sans">
            Spacetime Solar-System Matrix
          </h3>
        </div>

        <div className="flex flex-col items-end gap-1 font-mono">
          <span className="text-[9px] font-bold text-slate-400">
            OBSERVER COHERENCE: <span className={coherence > 0.8 ? "text-emerald-400" : "text-amber-500"}>{(coherence * 100).toFixed(0)}%</span>
          </span>
          <div className="flex items-center gap-1 text-[8px] bg-slate-900 px-1.5 py-0.5 rounded-sm border border-slate-800 text-indigo-400 font-bold shrink-0">
            <span className="relative flex h-1.5 w-1.5 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
            </span>
            REALTIME_ψ_QUANTUM_AXIS
          </div>
        </div>
      </div>

      {/* Interactive 3D Canvas space */}
      <div className="relative w-full h-[230px] my-1 flex items-center justify-center cursor-grab active:cursor-grabbing">
        <canvas 
          ref={canvasRef} 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="block z-10" 
        />
        
        {/* Absolute floating telemetry HUD */}
        <div className="absolute left-2.5 top-2.5 bg-slate-950/70 border border-slate-900/85 backdrop-blur-md p-2 rounded text-[7.5px] font-mono leading-relaxed text-slate-400 z-10 select-none">
          <div className="text-indigo-400 font-bold flex items-center gap-1 border-b border-indigo-950 pb-1 mb-1">
            <Activity className="w-3 h-3 animate-pulse" />
            PARTICLE METRICS
          </div>
          <div>BOHR COHESION: <span className="text-slate-200">{(coherence - 0.05).toFixed(2)}</span></div>
          <div>PLANCK TIMESTEP: <span className="text-slate-200">~6.626e-34</span></div>
          <div>WEAK COUPLING: <span className="text-emerald-400">STABLE</span></div>
        </div>

        <div className="absolute right-2.5 top-2.5 bg-slate-950/70 border border-slate-900/85 backdrop-blur-md p-2 rounded text-[7.5px] font-mono leading-relaxed text-slate-400 z-10 select-none">
          <div className="text-cyan-400 font-semibold border-b border-cyan-950 pb-1 mb-1 flex items-center gap-1">
            <Compass className="w-3 h-3" />
            GRAVITATIONAL AXIS
          </div>
          <div>PSI_DRIFT_Y: <span className="text-slate-200">FLOWING</span></div>
          <div>SPIN_ANGLE_θ: <span className="text-slate-200">{(rotationRef.current.theta % (Math.PI * 2)).toFixed(2)} rad</span></div>
          <div>SUPERPOSITION: <span className={coherence === 1 ? "text-amber-400" : "text-indigo-400"}>{coherence === 1 ? "COLLAPSED" : "DYNAMIC"}</span></div>
        </div>
      </div>

      {/* Dynamic Toolkit Interaction Bar */}
      <div className="border-t border-slate-900/60 pt-3.5 space-y-3 z-10 card-actions">
        {/* Parameter Adjustments selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/30 p-2 rounded-lg border border-slate-900">
          {/* Wavefunction Coherence slider */}
          <div className="flex items-center gap-2">
            <span className="text-[8.5px] font-mono font-semibold text-slate-400 uppercase">Coherence level:</span>
            <input 
              type="range" 
              min="0.1" 
              max="1.0" 
              step="0.05"
              value={coherence} 
              onChange={(e) => setCoherence(parseFloat(e.target.value))}
              className="w-20 accent-indigo-500 h-1 rounded-sm cursor-pointer select-none"
            />
          </div>

          {/* Time axis drift speed */}
          <div className="flex items-center gap-2">
            <span className="text-[8.5px] font-mono font-semibold text-slate-400 uppercase">Spacetime drift:</span>
            <input 
              type="range" 
              min="0.2" 
              max="2.5" 
              step="0.1"
              value={speedMultiplier} 
              onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
              className="w-16 accent-cyan-500 h-1 rounded-sm cursor-pointer select-none"
            />
          </div>

          {/* Trigger wavefunction collapse */}
          <button 
            type="button"
            onClick={triggerWaveCollapse}
            disabled={isWaveCollapsed}
            className={`px-3 py-1 rounded text-[8px] font-mono font-bold uppercase transition active:scale-95 flex items-center gap-1.5 ${
              isWaveCollapsed 
                ? 'bg-amber-950/40 text-amber-500 border border-amber-900/50'
                : 'bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800'
            }`}
          >
            <Zap className={`w-3 h-3 ${isWaveCollapsed ? 'text-amber-500' : 'text-indigo-300'}`} />
            <span>{isWaveCollapsed ? 'ψ STATE COLLAPSED!' : 'COLLAPSE WAVEFUNCTION'}</span>
          </button>
        </div>

        {/* Node selector triggers */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {nodes.current.map((n) => (
            <button
              key={n.name}
              onClick={() => setSelectedNode(n.name)}
              className={`px-2.5 py-1 text-[8px] font-mono font-bold tracking-wider rounded border uppercase transition-all flex items-center gap-1.5 ${
                selectedNode === n.name
                  ? 'bg-indigo-950 text-[#F1F5F9] border-indigo-500 shadow-md'
                  : 'bg-slate-900/40 hover:bg-slate-900/80 text-slate-400 border-slate-900'
              }`}
            >
              <span className={`w-1 h-1 rounded-full shrink-0 ${selectedNode === n.name ? 'animate-ping' : ''}`} style={{ backgroundColor: n.color }} />
              <span>{n.name.replace(" Core", "").replace(" Node", "")}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
})
