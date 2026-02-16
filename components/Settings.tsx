
import React, { useState, useRef } from 'react';
import { AppSettings, LiveEntry, Expense } from '../types';
import { translations } from '../translations';

interface Props {
  settings: AppSettings;
  onUpdate: (s: AppSettings) => void;
  liveEntries: LiveEntry[];
  expenses: Expense[];
  nightEntries: any[];
  cashEntries: any[];
  language: 'bn' | 'en';
}

const Settings: React.FC<Props> = ({ settings, onUpdate, liveEntries, expenses, language }) => {
  const [pass, setPass] = useState(settings.password);
  const [cash, setCash] = useState(settings.openingCash.toString());
  const [clientId, setClientId] = useState(settings.googleClientId || '');
  const [isExporting, setIsExporting] = useState(false);
  const pdfExportRef = useRef<HTMLDivElement>(null);
  
  const t = translations[language].settings;
  const currentOrigin = window.location.origin;

  const handleSave = () => {
    const cleanId = clientId.trim();
    onUpdate({ 
      ...settings,
      password: pass, 
      openingCash: Number(cash),
      googleClientId: cleanId
    });
    alert(language === 'bn' ? 'সেটিংস সফলভাবে সেভ হয়েছে!' : 'Settings saved successfully!');
  };

  const copyOrigin = () => {
    navigator.clipboard.writeText(currentOrigin);
    alert(language === 'bn' ? 'ইউআরএল কপি হয়েছে!' : 'URL Copied!');
  };

  const exportToPDF = async () => {
    if (!pdfExportRef.current) return;
    setIsExporting(true);

    const element = pdfExportRef.current;
    const opt = {
      margin: 10,
      filename: `Master_Ledger_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      await window.html2pdf().from(element).set(opt).save();
    } catch (err) {
      alert("Error generating full report.");
    } finally {
      setIsExporting(false);
    }
  };

  const allTransactions = [
    ...liveEntries.map(e => ({ date: e.date, cat: 'Income', desc: e.type, amount: e.amount })),
    ...expenses.map(e => ({ date: e.date, cat: 'Expense', desc: e.name, amount: e.amount }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500 pb-10">
      
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span>⚙️</span> {t.title}
        </h2>
        
        <div className="space-y-6">
          <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100 space-y-4">
             <div className="flex items-center gap-2">
                <span className="text-xl">🛠️</span>
                <p className="text-[11px] font-black text-blue-800 uppercase tracking-widest">
                  {language === 'bn' ? 'গুগল ক্লাউড সেটআপ গাইড' : 'Google Cloud Setup Guide'}
                </p>
             </div>
             <div className="text-[11px] text-blue-700 space-y-3 leading-relaxed font-medium">
                <p>১. <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="underline font-bold">Google Cloud Console</a>-এ গিয়ে <b>Web Application</b> আইডি তৈরি করুন।</p>
                
                <div className="bg-white/60 p-3 rounded-2xl space-y-2">
                   <p className="font-bold text-blue-900 uppercase text-[9px]">ধাপ ২: এই ইউআরএলটি 'Authorized JavaScript Origins' এ দিন:</p>
                   <div className="flex items-center gap-2">
                      <code className="text-[10px] flex-1 break-all font-mono font-bold bg-blue-100 p-2 rounded-lg">{currentOrigin}</code>
                      <button onClick={copyOrigin} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase shadow-sm active:scale-95">COPY</button>
                   </div>
                </div>

                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                   <p className="text-rose-700 font-bold">⚠️ সতর্ক হোন:</p>
                   <p className="text-rose-600">আপনি <b>Client ID</b> কপি করছেন তো? <b>Client Secret</b> নয় তো? আইডিটি দেখতে এমন হবে: <br/> <code className="text-[9px] bg-white/50 px-1">12345-abcde.apps.googleusercontent.com</code></p>
                </div>

                <p>৩. আপনার অ্যাপ যদি <b>Testing Mode</b>-এ থাকে, তবে আপনার ইমেইলটি <b>Test Users</b> লিস্টে যোগ করুন।</p>
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest px-1">{t.clientId}</label>
            <input 
              type="text" 
              value={clientId} 
              onChange={e => setClientId(e.target.value)}
              placeholder="Paste Client ID here (Ends with .apps.googleusercontent.com)"
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 outline-none font-mono text-xs border border-slate-100 placeholder:opacity-30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest px-1">{t.pin}</label>
            <input 
              type="text" 
              value={pass} 
              onChange={e => setPass(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 outline-none font-black text-xl tracking-[0.4em] border border-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest px-1">{t.opening}</label>
            <input 
              type="number" 
              value={cash} 
              onChange={e => setCash(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 outline-none font-black text-xl text-emerald-600 border border-slate-100"
            />
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.8rem] text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
          >
            {t.update}
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span>📊</span> {t.exportTitle}
        </h2>
        <button 
          onClick={exportToPDF}
          disabled={isExporting}
          className="w-full bg-rose-50 text-rose-600 py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"
        >
          {isExporting ? (language === 'bn' ? '⏳ তৈরির কাজ চলছে...' : '⏳ Generating...') : t.exportBtn}
        </button>
      </div>

      <div className="pdf-offscreen">
        <div ref={pdfExportRef} className="p-12 bg-white font-sans text-slate-900">
          <div className="border-b-4 border-slate-900 pb-6 mb-8">
            <h1 className="text-3xl font-black">Araf Telecom & Computer</h1>
            <h2 className="text-xl font-bold text-slate-500">Master Business Ledger</h2>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Generated: {new Date().toLocaleString()}</p>
          </div>
          
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3 border border-slate-800 text-left text-[10px] uppercase font-black">Date</th>
                <th className="p-3 border border-slate-800 text-left text-[10px] uppercase font-black">Type</th>
                <th className="p-3 border border-slate-800 text-left text-[10px] uppercase font-black">Description</th>
                <th className="p-3 border border-slate-800 text-right text-[10px] uppercase font-black">Amount (BDT)</th>
              </tr>
            </thead>
            <tbody>
              {allTransactions.map((t, i) => (
                <tr key={i} className="border-b border-slate-200">
                  <td className="p-3 border border-slate-200 text-[11px] font-bold">{t.date}</td>
                  <td className={`p-3 border border-slate-200 text-[10px] font-black uppercase ${t.cat === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>{t.cat}</td>
                  <td className="p-3 border border-slate-200 text-[11px]">{t.desc}</td>
                  <td className={`p-3 border border-slate-200 text-right font-black text-[11px] ${t.cat === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>৳ {t.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-10 pt-4 border-t border-slate-100 text-[9px] text-slate-300 uppercase tracking-widest text-center">
            End of Report • Powered by Araf Telecom Management System
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
