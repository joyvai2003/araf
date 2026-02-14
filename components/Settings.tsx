
import React, { useState, useRef } from 'react';
import { AppSettings, LiveEntry, Expense, NightEntry, CashEntry } from '../types';

interface Props {
  settings: AppSettings;
  onUpdate: (s: AppSettings) => void;
  liveEntries: LiveEntry[];
  expenses: Expense[];
  nightEntries: NightEntry[];
  cashEntries: CashEntry[];
}

const Settings: React.FC<Props> = ({ settings, onUpdate, liveEntries, expenses, nightEntries, cashEntries }) => {
  const [pass, setPass] = useState(settings.password);
  const [cash, setCash] = useState(settings.openingCash.toString());
  const [clientId, setClientId] = useState(settings.googleClientId || '');
  const [autoSync, setAutoSync] = useState(settings.autoSync);
  const [isExporting, setIsExporting] = useState(false);
  const pdfExportRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    onUpdate({ 
      password: pass, 
      openingCash: Number(cash),
      googleClientId: clientId.trim(),
      autoSync
    });
    alert('সেটিংস সেভ হয়েছে!');
  };

  const exportToPDF = async () => {
    if (!pdfExportRef.current) return;
    setIsExporting(true);

    const element = pdfExportRef.current;
    const opt = {
      margin: 10,
      filename: `Araf_Telecom_Full_Report_${new Date().toLocaleDateString()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      await window.html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("পিডিএফ তৈরি করতে সমস্যা হয়েছে।");
    } finally {
      setIsExporting(false);
    }
  };

  const getLiveLabel = (type: string) => {
    switch (type) {
      case 'photocopy': return 'ফটোকপি';
      case 'color_print': return 'কালার প্রিন্ট';
      case 'photo_print': return 'ফটো প্রিন্ট';
      case 'online_apply': return 'অনলাইন আবেদন';
      case 'others': return 'অন্যান্য আয়';
      default: return type;
    }
  };

  const getNightLabel = (type: string) => {
    switch (type) {
      case 'bkash_agent': return 'বিকাশ এজেন্ট';
      case 'nagad_agent': return 'নগদ এজেন্ট';
      case 'bkash_p1': return 'বিকাশ পার্সোনাল ১';
      case 'bkash_p2': return 'বিকাশ পার্সোনাল ২';
      case 'nagad_p1': return 'নগদ পার্সোনাল ১';
      case 'nagad_p2': return 'নগদ পার্সোনাল ২';
      case 'rocket': return 'রকেট';
      case 'gp_load': return 'জিপি লোড';
      case 'robi_load': return 'রবি লোড';
      case 'minute_card': return 'মিনিট কার্ড';
      case 'others': return 'অন্যান্য';
      default: return type;
    }
  };

  const allTransactions = [
    ...liveEntries.map(e => ({ date: e.date, cat: 'আয় (লাইভ)', desc: getLiveLabel(e.type), amount: e.amount, type: 'Income' })),
    ...expenses.map(e => ({ date: e.date, cat: 'খরচ', desc: e.name, amount: e.amount, type: 'Expense' })),
    ...nightEntries.map(e => ({ date: e.date, cat: 'নাইট সামারি', desc: getNightLabel(e.type), amount: e.amount, type: 'Balance' })),
    ...cashEntries.map(c => ({ date: c.date, cat: 'ক্যাশ বক্স', desc: c.note, amount: c.amount, type: c.type === 'in' ? 'Cash In' : 'Cash Out' }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = liveEntries.reduce((s, e) => s + e.amount, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500 pb-10">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span>⚙️</span> জেনারেল সেটিংস
        </h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div>
              <p className="text-sm font-bold text-emerald-900">অটোমেটিক ক্লাউড ব্যাকআপ</p>
              <p className="text-[10px] text-emerald-600 font-bold">দিনের শেষে অটো-পিডিএফ আপলোড</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={autoSync} onChange={e => setAutoSync(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">ওপেনিং ক্যাশ ব্যালেন্স (৳)</label>
            <input 
              type="number" 
              value={cash} 
              onChange={e => setCash(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <label className="block text-sm font-bold text-blue-800 mb-2">গুগল ক্লায়েন্ট আইডি</label>
            <input 
              type="text" 
              placeholder="গুগল ড্রাইভ ব্যাকআপের জন্য আইডি"
              value={clientId} 
              onChange={e => setClientId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">লগইন পাসওয়ার্ড</label>
            <input 
              type="text" 
              value={pass} 
              onChange={e => setPass(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
            />
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95"
          >
            সেভিংস আপডেট করুন
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span>📊</span> ডাটা ম্যানেজমেন্ট
        </h2>
        
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-2xl">📕</div>
          <div>
            <h4 className="font-bold text-slate-800">মাস্টার PDF রিপোর্ট</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">আপনার অ্যাপে থাকা সকল লেনদেনের একটি পূর্ণাঙ্গ পিডিএফ ফাইল ডাউনলোড করুন।</p>
          </div>
          
          <button 
            onClick={exportToPDF}
            disabled={isExporting}
            className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-rose-100 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <span>{isExporting ? '⏳' : '📄'}</span> 
            {isExporting ? 'পিডিএফ তৈরি হচ্ছে...' : 'পূর্ণাঙ্গ PDF ডাউনলোড করুন'}
          </button>
        </div>
      </div>

      {/* Hidden Export Template */}
      <div className="hidden">
        <div ref={pdfExportRef} className="p-10 bg-white text-slate-900 font-['Hind_Siliguri']">
          <div className="border-b-4 border-slate-800 pb-6 mb-10 text-center">
            <h1 className="text-3xl font-black mb-1 uppercase tracking-tight">Araf Telecom And Computer</h1>
            <p className="text-slate-500 font-bold text-sm">মাস্টার বিজনেস রিপোর্ট (Master Ledger)</p>
            <p className="text-slate-400 text-[10px] mt-1 font-bold">রিপোর্ট তৈরির তারিখ: {new Date().toLocaleDateString('bn-BD')}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
              <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">মোট সর্বমোট আয়</p>
              <p className="text-3xl font-black text-emerald-800">৳ {totalIncome.toLocaleString('bn-BD')}</p>
            </div>
            <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
              <p className="text-xs font-black text-rose-600 uppercase tracking-widest mb-2">মোট সর্বমোট ব্যয়</p>
              <p className="text-3xl font-black text-rose-800">৳ {totalExpense.toLocaleString('bn-BD')}</p>
            </div>
          </div>

          <table className="w-full border-collapse mb-10">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-3 border border-slate-300 text-left text-sm font-black">তারিখ</th>
                <th className="p-3 border border-slate-300 text-left text-sm font-black">বিভাগ</th>
                <th className="p-3 border border-slate-300 text-left text-sm font-black">বিবরণ</th>
                <th className="p-3 border border-slate-300 text-right text-sm font-black">পরিমাণ (৳)</th>
              </tr>
            </thead>
            <tbody>
              {allTransactions.map((t, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-3 border border-slate-200 text-xs">{t.date}</td>
                  <td className="p-3 border border-slate-200 text-xs font-bold">{t.cat}</td>
                  <td className="p-3 border border-slate-200 text-xs">{t.desc}</td>
                  <td className="p-3 border border-slate-200 text-right text-xs font-black">
                    {t.amount.toLocaleString('bn-BD')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-end">
            <div className="text-[10px] text-slate-400 font-bold uppercase">
              System Generated Master Report<br/>
              Shop: Araf Telecom And Computer
            </div>
            <div className="w-48 border-t-2 border-slate-800 pt-2 text-center">
              <p className="text-xs font-black">স্বাক্ষর ও সীল</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
