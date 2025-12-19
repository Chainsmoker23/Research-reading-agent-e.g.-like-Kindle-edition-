
import React, { useState } from 'react';
import { loginUser, registerUser } from '../backend/authService';
import { ArrowLeft, CheckCircle2, Shield, Zap, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { AntMascot } from './AntMascot';

interface AuthPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        await loginUser(email, password);
      } else {
        await registerUser(email, password);
      }
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
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-violet-600 to-fuchsia-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
                 <Zap size={24} className="text-yellow-300" fill="currentColor" />
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {isLogin ? 'Welcome Back.' : 'Start Your Journey.'}
              </h1>
              <p className="text-violet-100 text-lg opacity-90">
                Join thousands of researchers tracking their intellectual growth with OpenParallax.
              </p>
            </div>

            <div className="space-y-4 mt-8 md:mt-0">
              {["Sync history", "Earn ranks", "Build Knowledge Tree"].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="bg-white/20 p-1 rounded-full">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider">{item}</span>
                </div>
              ))}
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
               {isLogin ? 'Login' : 'Create Account'}
             </h2>
             <p className="text-textMuted text-sm">Use your email to access your library.</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
             {error && (
               <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-shake">
                 {error}
               </div>
             )}

             <div className="space-y-1">
                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-main border border-borderSkin rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none transition-all"
                    placeholder="name@example.com"
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
                    className="w-full bg-main border border-borderSkin rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none transition-all"
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
               ) : isLogin ? (
                 <><LogIn size={20} /> Login</>
               ) : (
                 <><UserPlus size={20} /> Register</>
               )}
             </button>
           </form>

           <div className="mt-8 text-center space-y-4">
             <button 
               onClick={() => setIsLogin(!isLogin)}
               className="text-sm font-medium text-violet-600 hover:text-violet-700 underline underline-offset-4"
             >
               {isLogin ? "Don't have an account? Register here" : "Already have an account? Login here"}
             </button>
             
             <div className="flex items-center justify-center gap-2 text-[10px] text-textMuted uppercase tracking-widest pt-4 border-t border-borderSkin">
               <Shield size={12} />
               <span>Parallax Secure Vault Access</span>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
