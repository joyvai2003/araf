
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LiveEntry, Expense } from '../types';
import { translations } from '../translations';

interface Props {
  stats: {
    todayIncome: number;
    todayExpense: number;
    currentCash: number;
    totalDues: number;
    monthlyProfit: number;
    allTimeProfit: number;
    openingCash: number;
    isTodayClosed: boolean;
    isTodayUploaded: boolean;
  };
  liveEntries: LiveEntry[];
  expenses: Expense[];
  onGoToReports: () => void;
  nightEntries: any[];
  onDeleteLive: (id: string) => void;
  onDeleteExpense: (id: string) => void;
  language: 'bn' | 'en';
}

const Dashboard: React.FC<Props> = ({ stats, liveEntries, expenses, onGoToReports, nightEntries, onDeleteLive, onDeleteExpense, language }) => {
  const t = translations[language].dashboard;
  const tEntry = translations[language].entry.liveTypes;
  const today = new Date().toLocaleDateString('en-CA');
  const todayNightCount = nightEntries.filter(n => n.date === today).length;

  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'short' });
      const month = d.getMonth();
      const year = d.getFullYear();
      const monthlyIncome = liveEntries.filter(e => {
        const entryDate = new Date(e.date);
        return entryDate.getMonth() === month && entryDate.getFullYear() === year;
      }).reduce((sum, e) => sum + e.amount, 0);
      const monthlyExp = expenses.filter(e => {
        const entryDate = new Date(e.date);
        return entryDate.getMonth() === month && entryDate.getFullYear() === year;
      }).reduce((sum, e) => sum + e.amount, 0);
      data.push({ name: monthLabel, income: monthlyIncome, expense: monthlyExp });
    }
    return data;
  }, [liveEntries, expenses, language]);

  const recentEntries = useMemo(() => {
    const combined = [
      ...liveEntries.map(e => ({ ...e, category: t.income, itemType: 'live' })),
      ...expenses.map(e => ({ ...e, type: 'expense', category: t.expense, itemType: 'expense' }))
    ].sort((a, b) => {
      const timeA = 'timestamp' in a ? a.timestamp : new Date(a.date).getTime();
      const timeB = 'timestamp' in b ? b.timestamp : new Date(b.date).getTime();
      return timeB - timeA;
    }).slice(0, 5);
    return combined;
  }, [liveEntries, expenses, t]);

  const handleDelete = (entry: any) => {
    if (window.confirm(t.deleteConfirm)) {
      if (entry.itemType === 'live') {
        onDeleteLive(entry.id);
      } else {
        onDeleteExpense(entry.id);
      }
    }
  };

  const getLabel = (type: string) => {
    return (tEntry as any)[type] || type;
  };

  const numFormat = (n: number) => n.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-IN');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Wallet Summary Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-200/50">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-emerald-100/80 text-xs font-bold uppercase tracking-[0.2em] mb-1">{t.totalBalance}</p>
              <h2 className="text-4xl font-black tracking-tight">৳ {numFormat(stats.currentCash)}</h2>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/20">
              <span className="text-2xl">🏦</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
            <div>
              <p className="text-emerald-100/60 text-[10px] font-bold uppercase tracking-widest mb-1">{t.todayIncome}</p>
              <p className="text-xl font-bold">৳ {numFormat(stats.todayIncome)}</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-100/60 text-[10px] font-bold uppercase tracking-widest mb-1">{t.todayExpense}</p>
              <p className="text-xl font-bold">৳ {numFormat(stats.todayExpense)}</p>
            </div>
          </div>
        </div>
        
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-rose-50 border border-rose-100 p-5 rounded-[2rem] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{t.totalDues}</p>
            <h4 className="text-2xl font-black text-rose-800">৳ {numFormat(stats.totalDues)}</h4>
          </div>
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-xl">⏳</div>
        </div>

        <div className={`p-5 rounded-[2rem] border flex items-center justify-between transition-all ${stats.isTodayClosed && !stats.isTodayUploaded ? 'border-amber-400 bg-amber-50/30' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${stats.isTodayUploaded ? 'bg-emerald-100 text-emerald-600' : stats.isTodayClosed ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
              {stats.isTodayUploaded ? '✅' : stats.isTodayClosed ? '📤' : '☁️'}
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">{stats.isTodayUploaded ? t.secured : t.backup}</p>
              <p className="text-[10px] text-slate-400 font-bold">{t.syncStatus}</p>
            </div>
          </div>
          <button 
            onClick={onGoToReports}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md ${stats.isTodayUploaded ? 'text-emerald-600 bg-emerald-50' : 'text-white bg-indigo-600'}`}
          >
            {stats.isTodayUploaded ? (language === 'bn' ? 'রিপোর্ট' : 'Report') : (language === 'bn' ? 'সিঙ্ক' : 'Sync')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">{t.monthlyTrx}</h3>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> <span className="text-[10px] font-bold text-slate-400">{t.income}</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-200"></span> <span className="text-[10px] font-bold text-slate-400">{t.expense}</span></div>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 700 }} dy={10} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={8} />
                <Bar dataKey="expense" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-4">{t.nightProgress}</h3>
            <div className="relative h-32 flex items-center justify-center">
              <div className={`relative w-24 h-24 rounded-full border-[10px] transition-all flex items-center justify-center ${stats.isTodayClosed ? 'border-emerald-500 ring-8 ring-emerald-50' : 'border-slate-50'}`}>
                <div className="text-center">
                  <span className={`text-xl font-black ${stats.isTodayClosed ? 'text-emerald-600' : 'text-slate-800'}`}>{todayNightCount}</span>
                  <span className="text-[10px] text-slate-400 block font-bold">/ 11</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50">
            <p className="text-[10px] text-slate-400 font-bold uppercase text-center">
              {stats.isTodayClosed ? (language === 'bn' ? 'আজকের সব হিসাব সম্পন্ন ✅' : "Today's closure complete ✅") : (language === 'bn' ? 'আজকের নাইট এন্ট্রি স্ট্যাটাস' : "Today's Night Status")}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-6">{t.recentTrx}</h3>
        <div className="space-y-4">
          {recentEntries.map((entry: any, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${entry.category === t.income ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {entry.category === t.income ? '📥' : '📤'}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">
                    {'type' in entry && typeof entry.type === 'string' && entry.category === t.income ? getLabel(entry.type) : (entry.name || t.expense)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{entry.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className={`text-sm font-black ${entry.category === t.income ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {entry.category === t.income ? '+' : '-'} ৳{numFormat(entry.amount)}
                </p>
                <button 
                  onClick={() => handleDelete(entry)}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-100 rounded-lg text-rose-500 transition-all"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          {recentEntries.length === 0 && (
            <div className="text-center py-6 text-slate-300 italic text-xs font-bold uppercase tracking-widest">
              {t.noData}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
