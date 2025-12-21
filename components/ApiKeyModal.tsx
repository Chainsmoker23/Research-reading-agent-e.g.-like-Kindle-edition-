
import React, { useState, useEffect, useRef } from 'react';
import { X, Key, ShieldCheck, Save, AlertTriangle, Info, Database, Download, Upload, Check, Loader2, RefreshCw } from 'lucide-react';
import { createBackupBlob, restoreFromBackup } from '../services/dataService';

interface ApiKeyModalProps {
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'api' | 'data'>('api');
  
  // API Key State
  const [keys, setKeys] = useState<string[]>(['', '', '', '', '']);
  const [showSuccess, setShowSuccess] = useState(false);

  // Data Management State
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadedKeys = ['', '', '', '', ''];
    
    // Check for legacy single key and migrate
    const legacy = localStorage.getItem('user_gemini_key');
    if (legacy) loadedKeys[0] = legacy;

    // Load indexed keys (1-5)
    for (let i = 0; i < 5; i++) {
      const k = localStorage.getItem(`user_gemini_key_${i + 1}`);
      if (k) loadedKeys[i] = k;
    }
    setKeys(loadedKeys);
  }, []);

  const handleChange = (index: number, value: string) => {
    const newKeys = [...keys];
    newKeys[index] = value;
    setKeys(newKeys);
  };

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.removeItem('user_gemini_key'); // clear legacy

    keys.forEach((k, index) => {
      const storageKey = `user_gemini_key_${index + 1}`;
      if (k.trim()) {
        localStorage.setItem(storageKey, k.trim());
      } else {
        localStorage.removeItem(storageKey);
      }
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleDownloadBackup = () => {
    try {
      const blob = createBackupBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `openparallax_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to create backup.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setRestoreStatus('idle');

    try {
      await restoreFromBackup(file);
      setRestoreStatus('success');
      // Reload after a short delay to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error(err);
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
            <span>Settings & Data</span>
          </div>
          <button onClick={onClose} className="text-textMuted hover:text-textMain transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-borderSkin bg-main">
          <button 
            onClick={() => setActiveTab('api')}
            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'api' ? 'border-amber-500 text-amber-600' : 'border-transparent text-textMuted hover:text-textMain'}`}
          >
            API Configuration
          </button>
          <button 
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'data' ? 'border-amber-500 text-amber-600' : 'border-transparent text-textMuted hover:text-textMain'}`}
          >
            Data Security
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          
          {/* --- API KEYS TAB --- */}
          {activeTab === 'api' && (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 space-y-3">
                 <div className="flex gap-3">
                    <Key className="text-amber-600 shrink-0" size={18} />
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Configure up to 5 keys. The system rotates them automatically to manage quotas.
                    </p>
                 </div>
              </div>

              <form onSubmit={handleSaveKeys} className="space-y-4">
                {keys.map((k, index) => (
                  <div key={index} className="space-y-1">
                    <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider">
                      Key {index + 1}
                    </label>
                    <input 
                      type="password" 
                      value={k}
                      onChange={(e) => handleChange(index, e.target.value)}
                      placeholder={`AIzaSy...`}
                      className="w-full bg-main border border-borderSkin rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono transition-all"
                    />
                  </div>
                ))}
                
                <div className="pt-2">
                  <button 
                    type="submit"
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      showSuccess 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-textMain text-main hover:opacity-90'
                    }`}
                  >
                    {showSuccess ? (
                      <><Check size={18} /> Saved Successfully</>
                    ) : (
                      <><Save size={18} /> Save Keys</>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* --- DATA SECURITY TAB --- */}
          {activeTab === 'data' && (
            <div className="space-y-6">
               <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex gap-3">
                  <Database className="text-emerald-600 shrink-0" size={20} />
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    <strong>Secure Storage:</strong> Your reading history and achievements are stored locally on this device. Create backups to prevent data loss.
                  </p>
               </div>

               {/* Export Section */}
               <div className="space-y-2">
                 <h3 className="text-sm font-bold text-textMain uppercase tracking-wider">Export Data</h3>
                 <p className="text-xs text-textMuted mb-2">Download a secure JSON file of your entire progress.</p>
                 <button 
                   onClick={handleDownloadBackup}
                   className="w-full flex items-center justify-center gap-2 bg-surface border border-borderSkin hover:border-textMuted text-textMain py-3 rounded-xl transition-all font-medium group"
                 >
                   <Download size={18} className="text-amber-600 group-hover:scale-110 transition-transform" />
                   Download Backup
                 </button>
               </div>

               <div className="h-px bg-borderSkin"></div>

               {/* Import Section */}
               <div className="space-y-2">
                 <h3 className="text-sm font-bold text-textMain uppercase tracking-wider">Restore Data</h3>
                 <p className="text-xs text-textMuted mb-2">Restore your progress from a previous backup file.</p>
                 
                 <div className="relative">
                   <input 
                      type="file" 
                      ref={fileInputRef}
                      accept=".json"
                      onChange={handleFileChange}
                      className="hidden" 
                   />
                   
                   {restoreStatus === 'success' ? (
                     <div className="w-full bg-emerald-100 text-emerald-800 py-3 rounded-xl flex items-center justify-center gap-2 font-bold animate-pulse">
                        <Check size={18} /> Restore Complete. Reloading...
                     </div>
                   ) : restoreStatus === 'error' ? (
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-red-50 text-red-600 border border-red-200 py-3 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-red-100 transition-colors"
                     >
                        <AlertTriangle size={18} /> Failed. Try Again.
                     </button>
                   ) : (
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isRestoring}
                        className="w-full bg-textMain text-main py-3 rounded-xl flex items-center justify-center gap-2 font-bold hover:opacity-90 transition-all disabled:opacity-50"
                     >
                        {isRestoring ? (
                          <><Loader2 size={18} className="animate-spin" /> Restoring...</>
                        ) : (
                          <><Upload size={18} /> Upload Backup File</>
                        )}
                     </button>
                   )}
                 </div>
                 <p className="text-[10px] text-textMuted text-center mt-2">
                   This will overwrite current local data with the backup contents.
                 </p>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
