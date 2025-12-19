
import React, { useState } from 'react';
import { signInWithGoogle } from '../backend/authService';
import { ArrowLeft, CheckCircle2, Shield, Zap, Sprout } from 'lucide-react';
import { AntMascot } from './AntMascot';

interface AuthPageProps {
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // Browser will redirect
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      alert("Failed to connect to Google. Please try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-main animate-fade-in relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-10 left-10 opacity-20 pointer-events-none animate-float">
         <AntMascot variant="black" className="w-16 h-16 rotate-[-15deg]" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-20 pointer-events-none animate-float-delayed">
         <AntMascot variant="fire" className="w-20 h-20 rotate-[15deg]" />
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
                Upgrade your<br/>Research Mind.
              </h1>
              <p className="text-violet-100 text-lg opacity-90">
                Join thousands of researchers tracking their intellectual growth with OpenParallax.
              </p>
            </div>

            <div className="space-y-4 mt-8 md:mt-0">
              {[
                "Sync reading history across devices",
                "Earn ranks from 'Observer' to 'God Mode'",
                "Build your personal Knowledge Tree",
                "Access exclusive AI mentor features"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="bg-white/20 p-1 rounded-full">
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-surface flex flex-col justify-center relative">
           <button 
             onClick={onBack}
             className="absolute top-6 right-6 p-2 text-textMuted hover:text-textMain hover:bg-main rounded-full transition-colors"
           >
             <ArrowLeft size={20} />
           </button>

           <div className="text-center mb-8">
             <h2 className="font-serif text-2xl font-bold text-textMain mb-2">Welcome Back</h2>
             <p className="text-textMuted text-sm">Sign in to continue your journey.</p>
           </div>

           <div className="space-y-4">
             <button
               onClick={handleGoogleLogin}
               disabled={isLoading}
               className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-6 py-4 rounded-xl font-medium transition-all shadow-sm hover:shadow-md group relative overflow-hidden"
             >
               {isLoading && (
                 <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                   <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                 </div>
               )}
               <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                 <path
                   d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                   fill="#4285F4"
                 />
                 <path
                   d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                   fill="#34A853"
                 />
                 <path
                   d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                   fill="#FBBC05"
                 />
                 <path
                   d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                   fill="#EA4335"
                 />
               </svg>
               <span className="text-lg">Continue with Google</span>
             </button>
           </div>

           <div className="mt-8 text-center">
             <div className="flex items-center justify-center gap-2 text-xs text-textMuted">
               <Shield size={12} />
               <span>Secure authentication powered by Supabase</span>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
