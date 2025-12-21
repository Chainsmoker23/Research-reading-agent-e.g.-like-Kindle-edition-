
import React, { useState, useEffect, useRef } from 'react';
import { X, Key, ShieldCheck, Save, Database, Download, Upload, Check, Loader2, Server } from 'lucide-react';
import { createBackupBlob, restoreFromBackup } from '../services/dataService';

interface ApiKeyModalProps {
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'api' | 'db' | 'data'>('api');
  
  // API Key State
  const [keys, setKeys] = useState<string[]>(['', '', '', '', '']);
  const [neonUrl, setNeonUrl] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Data Management State
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load Keys
    const loadedKeys = ['', '', '', '', ''];
    const legacy = localStorage.getItem('user_gemini_key');
    if (legacy) loadedKeys[0] = legacy;
    for (let i = 0; i < 5; i++) {
      const k = localStorage.getItem(`user_gemini_key_${i + 1}`);
      if (k) loadedKeys[i] = k;
    }
    setKeys(loadedKeys);

    // Load DB Url
    const db = localStorage.getItem('neon_db_url');
    if (db) setNeonUrl(db);
  }, []);

  const handleChange = (index: number, value: string) => {
    const newKeys = [...keys];
    newKeys[index] = value;
    setKeys(newKeys);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save Keys
    localStorage.removeItem('user_gemini_key');
    keys.forEach((k, index) => {
      const storageKey = `user_gemini_key_${index + 1}`;
      if (k.trim()) localStorage.setItem(storageKey, k.trim());
      else localStorage.removeItem(storageKey);
    });

    // Save DB
    if (neonUrl.trim()) localStorage.setItem('neon_db_url', neonUrl.trim());
    else localStorage.removeItem('neon_db_url');

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleDownloadBackup = () => {
    try {
      const blob = createBackupBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `openparallax_backup.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) { alert("Failed to create backup."); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsRestoring(true);
    try {
      await restoreFromBackup(file);
      setRestoreStatus('success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setRestoreStatus('error');
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-surface border border-borderSkin rounded-2xl shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-main px-6 py-4 border-b border-borderSkin flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-textMain font-serif font-bold text-lg">
            <ShieldCheck size={20} className="text-amber-600" />
            <span>Settings</span>
          </div>
          <button onClick={onClose} className="text-textMuted hover:text-textMain transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-borderSkin bg-main">
          <button onClick={() => setActiveTab('api')} className={`flex-1 py-3 text-xs md:text-sm font-bold border-b-2 ${activeTab === 'api' ? 'border-amber-500 text-amber-600' : 'border-transparent text-textMuted'}`}>API Keys</button>
          <button onClick={() => setActiveTab('db')} className={`flex-1 py-3 text-xs md:text-sm font-bold border-b-2 ${activeTab === 'db' ? 'border-amber-500 text-amber-600' : 'border-transparent text-textMuted'}`}>Database</button>
          <button onClick={() => setActiveTab('data')} className={`flex-1 py-3 text-xs md:text-sm font-bold border-b-2 ${activeTab === 'data' ? 'border-amber-500 text-amber-600' : 'border-transparent text-textMuted'}`}>Data</button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form onSubmit={handleSave} className="space-y-6 h-full flex flex-col">
            
            {/* --- API KEYS TAB --- */}
            {activeTab === 'api' && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
                    <Key className="text-amber-600 shrink-0" size={18} />
                    <p className="text-xs text-amber-800">Configure keys to avoid rate limits.</p>
                </div>
                {keys.map((k, index) => (
                  <div key={index} className="space-y-1">
                    <label className="text-[10px] font-bold text-textMuted uppercase">Key {index + 1}</label>
                    <input type="password" value={k} onChange={(e) => handleChange(index, e.target.value)} placeholder={`AIzaSy...`} className="w-full bg-main border border-borderSkin rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono" />
                  </div>
                ))}
              </div>
            )}

            {/* --- DATABASE TAB --- */}
            {activeTab === 'db' && (
              <div className="space-y-4">
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
                    <Server className="text-blue-600 shrink-0" size={18} />
                    <div className="text-xs text-blue-800">
                      <p className="font-bold mb-1">Status: {neonUrl ? 'Custom' : 'Default Active'}</p>
                      <p>Tracking activity for Divesh & Manish across devices.</p>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-textMuted uppercase">Connection String</label>
                    <input 
                      type="password" 
                      value={neonUrl} 
                      onChange={(e) => setNeonUrl(e.target.value)} 
                      placeholder="Default built-in database active" 
                      className="w-full bg-main border border-borderSkin rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono" 
                    />
                    <p className="text-[10px] text-textMuted pt-1">Leave empty to use the secure default connection.</p>
                 </div>
              </div>
            )}

            {/* --- DATA TAB --- */}
            {activeTab === 'data' && (
               <div className="space-y-6">
                 <div className="space-y-2">
                   <h3 className="text-sm font-bold text-textMain uppercase">Export</h3>
                   <button type="button" onClick={handleDownloadBackup} className="w-full flex items-center justify-center gap-2 bg-surface border border-borderSkin text-textMain py-3 rounded-xl hover:bg-main">
                     <Download size={18} /> Download Backup
                   </button>
                 </div>
                 <div className="space-y-2">
                   <h3 className="text-sm font-bold text-textMain uppercase">Restore</h3>
                   <input type="file" ref={fileInputRef} accept=".json" onChange={handleFileChange} className="hidden" />
                   <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full bg-surface border border-borderSkin text-textMain py-3 rounded-xl hover:bg-main flex items-center justify-center gap-2">
                     {isRestoring ? <Loader2 size={18} className="animate-spin"/> : <Upload size={18} />} Restore File
                   </button>
                   {restoreStatus === 'success' && <p className="text-xs text-emerald-600 text-center font-bold">Success!</p>}
                 </div>
               </div>
            )}

            {/* Save Button (Visible for API & DB tabs) */}
            {activeTab !== 'data' && (
              <div className="pt-2 mt-auto">
                <button type="submit" className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${showSuccess ? 'bg-emerald-500 text-white' : 'bg-textMain text-main'}`}>
                  {showSuccess ? <><Check size={18} /> Saved</> : <><Save size={18} /> Save Settings</>}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
