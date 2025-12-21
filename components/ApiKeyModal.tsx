
import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, Save, AlertTriangle, Info } from 'lucide-react';

interface ApiKeyModalProps {
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose }) => {
  const [keys, setKeys] = useState<string[]>(['', '', '', '', '']);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadedKeys = ['', '', '', '', ''];
    
    // Check for legacy single key and migrate to slot 1 if slot 1 is empty
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear legacy key to prioritize the new indexed system
    localStorage.removeItem('user_gemini_key');

    keys.forEach((k, index) => {
      const storageKey = `user_gemini_key_${index + 1}`;
      if (k.trim()) {
        localStorage.setItem(storageKey, k.trim());
      } else {
        localStorage.removeItem(storageKey);
      }
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-surface border border-borderSkin rounded-2xl shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
        <div className="bg-main p-6 border-b border-borderSkin flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-textMain font-serif font-bold text-lg">
            <Key size={20} className="text-amber-600" />
            <span>API Configuration</span>
          </div>
          <button onClick={onClose} className="text-textMuted hover:text-textMain transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 space-y-3">
             <div className="flex gap-3">
                <ShieldCheck className="text-amber-600 shrink-0" size={20} />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Multi-Key Rotation:</strong> The system will automatically rotate through these keys if one fails or hits a rate limit.
                </p>
             </div>
             <div className="flex gap-3 pt-2 border-t border-amber-200/50">
                <Info className="text-amber-600 shrink-0" size={20} />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Quota Tip:</strong> Keys in the <em>same</em> Google Cloud Project share the same quota (15 RPM free). To get more quota, create a <strong>New Project</strong> in Google AI Studio for each key.
                </p>
             </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {keys.map((k, index) => (
              <div key={index} className="space-y-1">
                <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider">
                  API Key {index + 1} {index === 0 ? '(Primary)' : '(Backup)'}
                </label>
                <input 
                  type="password" 
                  value={k}
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder={`AIzaSy... (Key ${index + 1})`}
                  className="w-full bg-main border border-borderSkin rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono transition-all"
                />
              </div>
            ))}

            <div className="pt-2">
                <p className="text-[10px] text-textMuted flex items-center gap-1 mb-4">
                  <AlertTriangle size={10} /> Keys are prioritized in order (1 → 5). Leave empty to skip.
                </p>

                <button 
                  type="submit"
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    showSuccess 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-textMain text-main hover:opacity-90'
                  }`}
                >
                  {showSuccess ? (
                    <><ShieldCheck size={18} /> Saved Successfully</>
                  ) : (
                    <><Save size={18} /> Save Configuration</>
                  )}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
