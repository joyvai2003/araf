
import React, { useState, useEffect } from 'react';

interface Props {
  correctPassword: string;
  googleClientId?: string;
  onLogin: (user?: any) => void;
  onRecover: () => void;
  language: 'bn' | 'en';
}

const AuthScreen: React.FC<Props> = ({ correctPassword, googleClientId, onLogin, onRecover, language }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    /* global google */
    if (googleClientId && (window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: any) => {
          const payload = JSON.parse(atob(response.credential.split('.')[1]));
          onLogin({
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            googleId: payload.sub
          });
        }
      });
      (window as any).google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large", width: "100%", shape: "pill" }
      );
    }
  }, [googleClientId]);

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

        <div id="googleBtn" className="w-full flex justify-center"></div>
      </div>

      {showForgot && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-black text-slate-800 mb-2">{language === 'bn' ? 'একাউন্ট রিকভারি' : 'Account Recovery'}</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium">
              {language === 'bn' ? 'আপনার জিমেইল দিয়ে লগইন করলে আমরা গুগল ড্রাইভ থেকে আপনার আগের সকল ডাটা ফিরিয়ে আনব।' : 'Login with Gmail to recover your data from Google Drive.'}
            </p>
            <button 
              onClick={onRecover}
              className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest mb-4"
            >
              {language === 'bn' ? 'রিকভার করুন' : 'Recover Now'}
            </button>
            <button onClick={() => setShowForgot(false)} className="w-full py-2 text-slate-400 text-[10px] font-bold uppercase">Back</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthScreen;
