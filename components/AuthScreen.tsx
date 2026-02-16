
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface Props {
  correctPassword: string;
  googleClientId?: string;
  onLogin: (user?: UserProfile) => void;
  onRecover: () => void;
  language: 'bn' | 'en';
}

const AuthScreen: React.FC<Props> = ({ correctPassword, googleClientId, onLogin, onRecover, language }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [googleStatus, setGoogleStatus] = useState<'idle' | 'loading' | 'ready' | 'error' | 'invalid_id'>('idle');

  // Safe JWT Decode helper for Google ID Tokens
  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("JWT Decode Error:", e);
      return null;
    }
  };

  useEffect(() => {
    const cid = googleClientId?.trim();
    
    if (cid && cid.length > 10) {
      if (!cid.endsWith('.apps.googleusercontent.com')) {
        setGoogleStatus('invalid_id');
        return;
      }

      const initGoogle = () => {
        if (!(window as any).google?.accounts?.id) {
          setGoogleStatus('loading');
          setTimeout(initGoogle, 500); // Polling for script load
          return;
        }

        try {
          (window as any).google.accounts.id.initialize({
            client_id: cid,
            callback: (response: any) => {
              const payload = decodeJwt(response.credential);
              if (payload) {
                onLogin({
                  email: payload.email,
                  name: payload.name,
                  picture: payload.picture,
                  googleId: payload.sub
                });
              } else {
                alert(language === 'bn' ? "লগইন তথ্য প্রক্রিয়াকরণে সমস্যা হয়েছে।" : "Problem processing login info.");
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
            error_callback: (err: any) => {
              console.error("GIS Error:", err);
              setGoogleStatus('error');
            }
          });
          
          const btnDiv = document.getElementById("googleBtn");
          if (btnDiv) {
            (window as any).google.accounts.id.renderButton(btnDiv, {
              theme: "outline",
              size: "large",
              width: "100%",
              shape: "pill",
              text: "signin_with"
            });
            setGoogleStatus('ready');
          }
        } catch (e) {
          console.error("Google Auth Init Exception:", e);
          setGoogleStatus('error');
        }
      };

      initGoogle();
    }
  }, [googleClientId, onLogin, language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-['Hind_Siliguri']">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm border border-slate-100 relative overflow-hidden animate-in zoom-in-95 duration-500 text-center">
        <div className="bg-emerald-100 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner border border-emerald-200">🏦</div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{language === 'bn' ? 'আরাফ টেলিকম' : 'Araf Telecom'}</h1>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 mb-8">Management System</p>
        
        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
          <input 
            type="password" 
            placeholder={language === 'bn' ? "পিন কোড লিখুন" : "Enter PIN"}
            autoFocus
            className={`w-full px-6 py-5 rounded-2xl border-none bg-slate-50 text-center text-2xl font-black tracking-[0.4em] transition-all outline-none focus:ring-4 ${error ? 'ring-rose-500/20' : 'focus:ring-emerald-500/10'}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-rose-500 text-[10px] font-bold">{language === 'bn' ? 'ভুল পিন! আবার চেষ্টা করুন।' : 'Wrong PIN! Try again.'}</p>}
          <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl transition-all text-xs uppercase tracking-[0.2em]">
            {language === 'bn' ? 'প্রবেশ করুন' : 'Login'}
          </button>
          <button 
            type="button" 
            onClick={() => setShowForgot(true)}
            className="text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-emerald-600 transition-colors"
          >
            {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-300"><span className="bg-white px-4 tracking-widest">{language === 'bn' ? 'অথবা জিমেইল দিয়ে' : 'OR VIA GMAIL'}</span></div>
        </div>

        {googleStatus === 'error' || googleStatus === 'invalid_id' ? (
           <div className="bg-rose-50 p-5 rounded-3xl border border-rose-100 text-left space-y-3">
              <div className="flex items-center gap-2">
                 <span className="text-lg">❌</span>
                 <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest">
                   {language === 'bn' ? 'কানেকশন এরর' : 'Auth Error'}
                 </p>
              </div>
              <div className="text-[9px] text-rose-500 font-bold leading-relaxed">
                 {googleStatus === 'invalid_id' 
                   ? (language === 'bn' ? 'ভুল ক্লায়েন্ট আইডি! এটি অবশ্যই .apps.googleusercontent.com দিয়ে শেষ হতে হবে।' : 'Invalid Client ID! Must end with .apps.googleusercontent.com')
                   : (language === 'bn' ? 'গুগল কানেকশন ব্যর্থ হয়েছে। সেটিংস থেকে ক্লায়েন্ট আইডি এবং অরিজিন চেক করুন (error: invalid_client)।' : 'Google Auth failed. Check your Client ID and Authorized Origins in Google Console.')
                 }
              </div>
           </div>
        ) : (
           <div id="googleBtn" className="w-full flex justify-center min-h-[40px] items-center">
              {googleStatus === 'loading' && <div className="text-[10px] font-bold text-slate-300 animate-pulse uppercase tracking-widest">Initializing...</div>}
              {googleStatus === 'idle' && !googleClientId && <div className="text-[9px] font-bold text-slate-300 uppercase italic">Google Auth Disabled</div>}
           </div>
        )}
      </div>

      {showForgot && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black text-slate-800 mb-2">{language === 'bn' ? 'একাউন্ট রিকভারি' : 'Account Recovery'}</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">
              {language === 'bn' ? 'আপনি যদি পিন ভুলে যান, তবে জিমেইল দিয়ে সাইন-ইন করে অ্যাপে প্রবেশ করতে পারবেন।' : 'If you forgot your PIN, you can sign in with your registered Gmail account to regain access.'}
            </p>
            <div className="space-y-3">
               <button 
                onClick={() => setShowForgot(false)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest"
               >
                {language === 'bn' ? 'বুঝেছি' : 'Got it'}
               </button>
               <button onClick={() => setShowForgot(false)} className="w-full py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthScreen;
