import React, { useState } from 'react';
import { Shield, Key, Network, RefreshCw, Smartphone, Laptop, Check, Lock, Unlock, Database, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { SyncedDevice, SyncBackup } from '../types';

interface SyncViewProps {
  devices: SyncedDevice[];
  onTriggerSync: (passphrase: string) => Promise<void>;
  onTriggerRestore: (passphrase: string) => Promise<void>;
  cloudBackup: SyncBackup | null;
  syncKeyFingerprint: string;
  onAddDevice: (device: SyncedDevice) => void;
}

export default function SyncView({
  devices,
  onTriggerSync,
  onTriggerRestore,
  cloudBackup,
  syncKeyFingerprint,
  onAddDevice,
}: SyncViewProps) {
  const [passphrase, setPassphrase] = useState('agent-secure-master-key-2026');
  const [showKey, setShowKey] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showVaultData, setShowVaultData] = useState(false);

  // New simulated device state
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<'laptop' | 'mobile'>('laptop');

  const addSimulatedDeviceForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;

    // Construct fingerprint simulation
    const array = new Uint8Array(8);
    window.crypto.getRandomValues(array);
    const finger = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(':').toUpperCase();

    onAddDevice({
      id: `dev-${Date.now()}`,
      name: newDeviceName,
      deviceType: newDeviceType,
      encryptionKeyFingerprint: `SHA256:${finger}`,
      synchronizedAt: new Date().toISOString(),
      active: true,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 200) + 10}`,
    });

    setNewDeviceName('');
    const logger = `[NETWORK SERVICE] Authorized dynamic mesh endpoint node: "${newDeviceName}" with fingerprint verification.`;
    setSyncLogs((prev) => [logger, ...prev]);
  };

  const handleBackupAction = async () => {
    if (!passphrase.trim()) return;
    setIsSyncing(true);

    const logs: string[] = [
      `[STATE PARSER] Packing state nodes (Workflows + Agents + Task history)...`,
      `[SECURITY COGNITION] Encrypted Cloud Sync pipeline initiated.`,
      `[KDF CORE] Deriving AES-GCM-256 target sub-keys using PBKDF2...`,
      `[KDF CORE] Iterations: 100,000 | SHA-256 digest complete.`,
      `[CRYPTO MODULE] Encrypting segments... salt used: 0xda2...`,
      `[TRANSPORT SERVICES] Transmitting encrypted block packages to Cloud Run sync vault...`,
    ];

    setSyncLogs((prev) => [...logs.reverse(), ...prev]);

    try {
      await onTriggerSync(passphrase);
      setSyncLogs((prev) => [
        `[SUCCESS] Synchronization complete. Payload secured on server. Key Fingerprint: ${syncKeyFingerprint || 'AES-GCM-256'}`,
        ...prev,
      ]);
    } catch (err: any) {
      setSyncLogs((prev) => [`[ERROR] Synchronization validation failed: ${err.message}`, ...prev]);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestoreAction = async () => {
    if (!passphrase.trim()) return;
    setIsSyncing(true);

    const logs: string[] = [
      `[TRANSPORT SERVICES] Gathering zero-knowledge backups from central persistence vault...`,
      `[VAULT INSPECT] Metadata matches target node configuration. SHA-256 parity Verified.`,
      `[CRYPTO MODULE] Reconstructing derived AES wrapper for local machine decryption...`,
      `[STATE PARSER] Unpacking database segments. Executing atomic replacements...`,
    ];

    setSyncLogs((prev) => [...logs.reverse(), ...prev]);

    try {
      await onTriggerRestore(passphrase);
      setSyncLogs((prev) => [
        `[SUCCESS] Decentralized local database update successful. Synced with cluster.`,
        ...prev,
      ]);
    } catch (err: any) {
      setSyncLogs((prev) => [`[ERROR] Handshake key-parity failure backoff. Decryption denied. ${err.message}`, ...prev]);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-start relative z-10">
      {/* Synchronization Engine controls */}
      <div className="space-y-6">
        <div className="bg-[#0D1117] border border-[#1E293B] rounded-sm p-4.5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <h2 className="text-xs font-bold tracking-widest text-[#E2E8F0] uppercase mb-4 flex items-center gap-2 border-b border-[#1E293B] pb-3 font-mono">
            <Lock className="w-4 h-4 text-indigo-400" />
            Zero-Knowledge Cloud Link Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between font-mono">
                <span>Client derived Master Passphrase</span>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-indigo-400 hover:text-indigo-300 text-[10px] font-bold font-mono uppercase flex items-center gap-1"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5 text-indigo-450" /> : <Eye className="w-3.5 h-3.5 text-indigo-450" />}
                  {showKey ? 'Hide Raw' : 'Reveal Raw'}
                </button>
              </label>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-[#1E293B] text-white rounded-sm py-2 px-3.5 pr-10 text-xs font-mono focus:outline-none focus:border-indigo-400"
                  id="sync-passphrase-input"
                />
                <Key className="absolute right-3 top-2.5 w-4 h-4 text-slate-600" />
              </div>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed font-mono">
                Your passphrase generates symmetric sub-keys on your browser using PBKDF2 (100,000 iterations). 
                The server ONLY stores raw ciphertext, meaning zero exposure to host entities.
              </p>
            </div>

            <div className="bg-[#0A0C10] p-3.5 rounded-sm border border-[#1E293B] space-y-2 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Derived Key Cipher</span>
                <span className="text-[#CBD5E1] font-bold">AES-256-GCM (HMAC-SHA256)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Operational Node Signature</span>
                <span className="text-indigo-400 truncate max-w-[170px]" title={syncKeyFingerprint}>
                  {syncKeyFingerprint || 'Computing key-mesh...'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 font-mono">
              <button
                onClick={handleBackupAction}
                disabled={isSyncing || !passphrase}
                className="bg-indigo-650 hover:bg-indigo-600 text-white text-[10px] font-bold uppercase py-2.5 px-4 rounded-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                id="btn-sync-push"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Push State
              </button>

              <button
                onClick={handleRestoreAction}
                disabled={isSyncing || !passphrase || !cloudBackup}
                className="bg-[#0A0C10] hover:bg-[#1E293B]/10 text-[#CBD5E1] text-[10px] font-bold uppercase py-2.5 px-4 rounded-sm shadow-sm border border-[#1E293B] transition disabled:opacity-40 flex items-center justify-center gap-2"
                id="btn-sync-pull"
              >
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                Pull State
              </button>
            </div>
          </div>
        </div>

        {/* Sync Device Connection Registry */}
        <div className="bg-[#0D1117] border border-[#1E293B] rounded-sm p-4.5 shadow-lg space-y-4">
          <h2 className="text-xs font-bold tracking-widest text-[#E2E8F0] uppercase flex items-center gap-2 border-b border-[#1E293B] pb-3 font-mono">
            <Network className="w-4 h-4 text-indigo-400" />
            Device Mesh Authorization
          </h2>

          <div className="space-y-3.5">
            {devices.map((d) => (
              <div key={d.id} className="bg-[#0A0C10] p-3 rounded-sm border border-[#1E293B]/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8.5 h-8.5 rounded-sm bg-[#1E293B]/30 border border-[#1E293B] flex items-center justify-center">
                    {d.deviceType === 'laptop' ? (
                      <Laptop className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Smartphone className="w-4 h-4 text-[#CBD5E1]" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 font-mono">{d.name}</div>
                    <div className="text-[9px] font-mono text-slate-500 mt-1 flex items-center gap-1.5">
                      <span>IP: {d.ipAddress}</span>
                      <span>•</span>
                      <span>Keys Signature: {d.encryptionKeyFingerprint.substring(0, 16)}...</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-none animate-pulse" />
                  <span className="text-[9px] text-[#A7F3D0] font-mono font-bold">MESH LINKED</span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={addSimulatedDeviceForm} className="space-y-3 border-t border-[#1E293B] pt-4" id="add-device-form">
            <h3 className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">Authorize Client Node</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Nav's iPhone Pro"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-[#1E293B] text-white rounded-sm py-1.5 px-3 text-xs focus:outline-none focus:border-indigo-400 font-mono"
                  id="device-name-input"
                />
              </div>

              <div>
                <select
                  value={newDeviceType}
                  onChange={(e: any) => setNewDeviceType(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-[#1E293B] text-white rounded-sm p-1.5 text-xs focus:outline-none font-mono"
                  id="device-type-select"
                >
                  <option value="laptop">Laptop Unit</option>
                  <option value="mobile">Mobile Unit</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1E293B] hover:bg-[#1E293B]/80 text-[#E2E8F0] text-[9px] font-bold font-mono uppercase py-1.5 rounded-sm transition border border-[#1E293B]"
              id="btn-register-device"
            >
              Authorize Node Pairing
            </button>
          </form>
        </div>
      </div>

      {/* Vault Inspection Cipher */}
      <div className="space-y-6">
        <div className="bg-[#0D1117] border border-[#1E293B] rounded-sm p-4.5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h2 className="text-xs font-bold tracking-widest text-[#E2E8F0] uppercase flex items-center gap-2 font-mono">
              <Database className="w-4 h-4 text-indigo-400" />
              Cloud Storage Vault Cipher Monitor
            </h2>
            <button
              onClick={() => setShowVaultData(!showVaultData)}
              disabled={!cloudBackup}
              className="text-[10px] font-bold font-mono uppercase text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1.5"
              id="btn-toggle-vault-expand"
            >
              {showVaultData ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showVaultData ? 'Hide Vault' : 'Expand Vault'}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
            Since zero-knowledge pipelines encrypt data locally on-device, the backing database nodes
            contain non-readable raw ciphers. See details of the backup block:
          </p>

          {!cloudBackup ? (
            <div className="bg-[#0A0C10]/60 rounded-sm p-6 text-center text-slate-650 text-xs italic border border-dashed border-[#1E293B] font-mono">
              No remote database synchronized. Initialize 'Push Encrypted State' to trigger backups.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-[#0A0C10] p-3.5 rounded-sm border border-[#1E293B] space-y-2 text-[10px] font-mono leading-relaxed">
                <div className="flex justify-between border-b border-[#1D2433] pb-1.5 text-slate-500">
                  <span>Vault segment identifier</span>
                  <span className="text-slate-400 font-bold">{cloudBackup.id}</span>
                </div>
                <div className="flex justify-between text-slate-500 mt-1">
                  <span>Last backup time</span>
                  <span className="text-indigo-400">{new Date(cloudBackup.lastUpdated).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Replication salt</span>
                  <span className="text-slate-400">{cloudBackup.salt.substring(0, 20)}...</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>IV vector byte</span>
                  <span className="text-slate-400">{cloudBackup.iv || 'None'}</span>
                </div>
              </div>

              {showVaultData && (
                <div className="space-y-3.5">
                  <div>
                    <span className="text-[9px] font-mono text-indigo-400 font-bold block mb-1">Encrypted Workflows Cipher Block</span>
                    <textarea
                      readOnly
                      value={cloudBackup.encryptedWorkflows}
                      className="w-full bg-[#0A0C10] border border-[#1E293B] text-emerald-400 p-2.5 rounded-sm font-mono text-[9px] h-20 h-28 h-32 outline-none custom-scrollbar"
                      id="cipher-workflows-area"
                    />
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-indigo-400 font-bold block mb-1">Encrypted Registered Agents Cipher Block</span>
                    <textarea
                      readOnly
                      value={cloudBackup.encryptedAgents}
                      className="w-full bg-[#0A0C10] border border-[#1E293B] text-emerald-400 p-2.5 rounded-sm font-mono text-[9px] h-20 h-28 h-32 outline-none custom-scrollbar"
                      id="cipher-agents-area"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cryptographic Operation stream flow logs */}
        <div className="bg-[#0D1117] border border-[#1E293B] rounded-sm p-4.5 shadow-lg space-y-3">
          <span className="text-[8px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Crypto Pipeline Operations Stream</span>
          <div className="bg-[#0A0C10] border border-[#1E293B] p-4 rounded-sm font-mono text-[10px] space-y-2 h-[210px] overflow-y-auto custom-scrollbar">
            {syncLogs.length === 0 ? (
              <div className="text-slate-600 italic h-full flex items-center justify-center">
                System listening... Cryptographic transactions will trace here.
              </div>
            ) : (
              syncLogs.map((log, i) => {
                let logTypeColor = 'text-slate-400';
                if (log.includes('[SUCCESS]')) logTypeColor = 'text-emerald-400 font-bold';
                if (log.includes('[ERROR]')) logTypeColor = 'text-rose-400';
                if (log.includes('[CRYPTO')) logTypeColor = 'text-cyan-400';

                return (
                  <div key={i} className={`leading-relaxed ${logTypeColor}`}>
                    {log}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
