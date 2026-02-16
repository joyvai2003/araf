
import React, { useState, useRef, useEffect } from 'react';
import { AppSettings, LiveEntry, Expense, NightEntry, CashEntry, DueEntry } from '../types';
import { translations } from '../translations';

interface Props {
  settings: AppSettings;
  onUpdate: (s: AppSettings) => void;
  liveEntries: LiveEntry[];
  expenses: Expense[];
  nightEntries: NightEntry[];
  cashEntries: CashEntry[];
  dueEntries: DueEntry[];
  uploadedDates: string[];
  language: 'bn' | 'en';
  onSyncSuccess: (data: any) => void;
}

const Settings: React.FC<Props> = ({ settings, onUpdate, liveEntries, expenses, nightEntries, cashEntries, dueEntries, uploadedDates, language, onSyncSuccess }) => {
  const [pass, setPass] = useState(settings.password);
  const [cash, setCash] = useState(settings.openingCash.toString());
  const [clientId, setClientId] = useState(settings.googleClientId || '');
  const [isExporting, setIsExporting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const pdfExportRef = useRef<HTMLDivElement>(null);
  const tokenClientRef = useRef<any>(null);
  
  const t = translations[language].settings;
  const currentOrigin = window.location.origin;

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google && settings.googleClientId) {
      try {
        tokenClientRef.current = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: settings.googleClientId.trim(),
          scope: 'https://www.googleapis.com/auth/drive.file',
          callback: '', 
        });
      } catch (e) { console.error("GIS Init Error:", e); }
    }
  }, [settings.googleClientId]);

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

  const syncWithDrive = async () => {
    if (!tokenClientRef.current) return alert("Google Client ID correctly set up?");
    setSyncStatus('loading');

    const fileName = "araf_telecom_sync_data.json";
    const appData = {
      liveEntries, expenses, nightEntries, cashEntries, dueEntries, uploadedDates,
      lastUpdated: Date.now()
    };

    tokenClientRef.current.callback = async (response: any) => {
      if (response.error) { setSyncStatus('error'); return; }
      const token = response.access_token;

      try {
        // Search for existing file
        const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}'&fields=files(id)`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { files } = await searchRes.json();

        if (files && files.length > 0) {
          // File exists - check if we should pull or push
          const fileId = files[0].id;
          if (window.confirm(language === 'bn' ? "গুগল ড্রাইভে আগের ডাটা পাওয়া গেছে। আপনি কি ক্লাউড থেকে ডাটা রিস্টোর করতে চান? (না চাইলে আপনার বর্তমান ডাটা ড্রাইভে সেভ হবে)" : "Found existing cloud data. Restore from Cloud? (Cancel to overwrite with current data)")) {
            // Pull
            const pullRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const cloudData = await pullRes.json();
            onSyncSuccess(cloudData);
            setSyncStatus('success');
            alert(language === 'bn' ? "ডাটা সফলভাবে রিস্টোর হয়েছে!" : "Data restored successfully!");
          } else {
            // Push (Update)
            await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(appData)
            });
            setSyncStatus('success');
            alert(language === 'bn' ? "ডাটা সফলভাবে ব্যাকআপ হয়েছে!" : "Data backed up successfully!");
          }
        } else {
          // Create new file
          const metadata = { name: fileName, mimeType: 'application/json' };
          const form = new FormData();
          form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
          form.append('file', new Blob([JSON.stringify(appData)], { type: 'application/json' }));

          await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: form
          });
          setSyncStatus('success');
          alert(language === 'bn' ? "প্রথমবারের মতো ক্লাউড ব্যাকআপ সফল হয়েছে!" : "First cloud backup successful!");
        }
      } catch (e) {
        setSyncStatus('error');
        alert("Sync Failed.");
      }
    };

    tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
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
    } catch (err) { alert("Error generating report."); }
    finally { setIsExporting(false); }
  };

  const allTransactions = [
    ...liveEntries.map(e => ({ date: e.date, cat: 'Income', desc: e.type, amount: e.amount })),
    ...expenses.map(e => ({ date: e.date, cat: 'Expense', desc: e.name, amount: e.amount }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500 pb-10">
      
      {/* Cloud Sync Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] shadow-xl text-white">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
          <span>🔄</span> {language === 'bn' ? 'ডিভাইস সিঙ্ক' : 'Device Sync'}
        </h2>
        <p className="text-indigo-100 text-xs mb-6 leading-relaxed">
          {language === 'bn' 
            ? 'ল্যাপটপ এবং মোবাইলে একই হিসাব দেখতে এই বাটনটি ব্যবহার করুন। আপনার সব হিসাব গুগল ড্রাইভে সুরক্ষিত থাকবে।' 
            : 'Use this to sync data across laptop and mobile. Your ledger will be safely stored in Google Drive.'}
        </p>
        <button 
          onClick={syncWithDrive}
          disabled={syncStatus === 'loading'}
          className={`w-full py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2 ${syncStatus === 'loading' ? 'bg-white/20' : 'bg-white text-indigo-600'}`}
        >
          {syncStatus === 'loading' ? '⏳ Syncing...' : (language === 'bn' ? 'ড্রাইভের সাথে সিঙ্ক করুন' : 'Sync with Google Drive')}
        </button>
      </div>

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
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest px-1">{t.clientId}</label>
            <input 
              type="text" 
              value={clientId} 
              onChange={e => setClientId(e.target.value)}
              placeholder="Paste Client ID here..."
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 outline-none font-mono text-xs border border-slate-100"
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
        </div>
      </div>
    </div>
  );
};

export default Settings;
