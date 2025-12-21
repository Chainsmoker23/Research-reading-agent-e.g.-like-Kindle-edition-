
import React, { useState } from 'react';
import { loginUser } from '../services/authService';
import { ArrowLeft, Shield, Zap, Mail, Lock, LogIn, LockKeyhole } from 'lucide-react';
import { AntMascot } from './AntMascot';

interface AuthPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await loginUser(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-main animate-fade-in relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-10 left-10 opacity-20 pointer-events-none animate-float">
         <AntMascot variant="black" className="w-16 h-16 rotate-[-15deg]" />
      </div>

      <div className="w-full max-w-4xl bg-surface border border-borderSkin rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* Left Side: Pitch */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-slate-800 to-zinc-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 border border-white/20">
                 <LockKeyhole size={24} className="text-emerald-400" fill="currentColor" />
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4 leading-tight text-emerald-50">
                Restricted Access.
              </h1>
              <p className="text-zinc-400 text-lg opacity-90">
                This system is private and restricted to authorized personnel only.
              </p>
            </div>

            {/* Private Access Keys */}
            <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 mt-6">
              <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Shield size={14} /> Authorized Accounts
              </div>
              <div className="text-sm space-y-2 font-mono text-zinc-300">
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span>ID: divesh</span>
                  <span className="opacity-50">divesh23</span>
                </div>
                <div className="flex justify-between">
                  <span>ID: manish</span>
                  <span className="opacity-50">Manish9</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Custom Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-surface flex flex-col justify-center relative">
           <button 
             onClick={onBack}
             className="absolute top-6 right-6 p-2 text-textMuted hover:text-textMain hover:bg-main rounded-full transition-colors"
           >
             <ArrowLeft size={20} />
           </button>

           <div className="text-center mb-8">
             <h2 className="font-serif text-2xl font-bold text-textMain mb-2">
               System Login
             </h2>
             <p className="text-textMuted text-sm">Verify your identity to proceed.</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
             {error && (
               <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-shake">
                 {error}
               </div>
             )}

             <div className="space-y-1">
                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                  <input 
                    type="text" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-main border border-borderSkin rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all"
                    placeholder="Enter ID"
                  />
                </div>
             </div>

             <div className="space-y-1">
                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-main border border-borderSkin rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
             </div>

             <button
               type="submit"
               disabled={isLoading}
               className="w-full bg-textMain text-main py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 group"
             >
               {isLoading ? (
                 <div className="w-5 h-5 border-2 border-main border-t-transparent rounded-full animate-spin"></div>
               ) : (
                 <><LogIn size={20} /> Authenticate</>
               )}
             </button>
           </form>

           <div className="mt-8 text-center space-y-4">
             <div className="flex items-center justify-center gap-2 text-[10px] text-textMuted uppercase tracking-widest pt-4 border-t border-borderSkin">
               <Shield size={12} />
               <span>Secure Local Vault</span>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
