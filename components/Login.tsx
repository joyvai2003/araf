
import React, { useState } from 'react';

interface Props {
  correctPassword: string;
  onLogin: () => void;
}

const Login: React.FC<Props> = ({ correctPassword, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

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
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 text-center">
          <div className="bg-emerald-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner border border-emerald-200">🏦</div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">আরাফ টেলিকম</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 mb-8">Management System</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <input 
              type="password" 
              placeholder="পিন কোড লিখুন"
              autoFocus
              className={`w-full px-6 py-5 rounded-2xl border-none bg-slate-50 text-center text-2xl font-black tracking-[0.4em] transition-all outline-none focus:ring-4 ${error ? 'ring-rose-500/20' : 'focus:ring-emerald-500/10'}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-rose-500 text-[10px] font-bold">ভুল পিন! আবার চেষ্টা করুন।</p>}
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-200 transition-all active:scale-95 text-xs uppercase tracking-widest">
              প্রবেশ করুন
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
