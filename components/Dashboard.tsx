
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LiveEntry, Expense, NightEntry } from '../types';

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
  nightEntries: NightEntry[];
}

const Dashboard: React.FC<Props> = ({ stats, liveEntries, expenses, onGoToReports, nightEntries }) => {
  const today = new Date().toLocaleDateString('en-CA');
  const todayNightCount = nightEntries.filter(n => n.date === today).length;

  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('bn-BD', { month: 'short' });
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
  }, [liveEntries, expenses]);

  const recentEntries = useMemo(() => {
    const combined = [
      ...liveEntries.map(e => ({ ...e, category: 'আয়' })),
      ...expenses.map(e => ({ ...e, type: 'expense', category: 'ব্যয়' }))
    ].sort((a, b) => {
      const timeA = 'timestamp' in a ? a.timestamp : new Date(a.date).getTime();
      const timeB = 'timestamp' in b ? b.timestamp : new Date(b.date).getTime();
      return timeB - timeA;
    }).slice(0, 4);
    return combined;
  }, [liveEntries, expenses]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Wallet Summary Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-200/50">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-emerald-100/80 text-xs font-bold uppercase tracking-[0.2em] mb-1">মোট ক্যাশ ব্যালেন্স</p>
              <h2 className="text-4xl font-black tracking-tight">৳ {stats.currentCash.toLocaleString('bn-BD')}</h2>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/20">
              <span className="text-2xl">🏦</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
            <div>
              <p className="text-emerald-100/60 text-[10px] font-bold uppercase tracking-widest mb-1">আজকের আয়</p>
              <p className="text-xl font-bold">৳ {stats.todayIncome.toLocaleString('bn-BD')}</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-100/60 text-[10px] font-bold uppercase tracking-widest mb-1">আজকের ব্যয়</p>
              <p className="text-xl font-bold">৳ {stats.todayExpense.toLocaleString('bn-BD')}</p>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dues Card */}
        <div className="bg-rose-50 border border-rose-100 p-5 rounded-[2rem] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">মোট কাস্টমার বাকি</p>
            <h4 className="text-2xl font-black text-rose-800">৳ {stats.totalDues.toLocaleString('bn-BD')}</h4>
          </div>
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-xl">⏳</div>
        </div>

        {/* Sync Status / Action Floating Bar (Re-designed for dashboard flow) */}
        <div className={`p-5 rounded-[2rem] border flex items-center justify-between transition-all ${stats.isTodayClosed && !stats.isTodayUploaded ? 'border-amber-400 bg-amber-50/30' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${stats.isTodayUploaded ? 'bg-emerald-100 text-emerald-600' : stats.isTodayClosed ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
              {stats.isTodayUploaded ? '✅' : stats.isTodayClosed ? '📤' : '☁️'}
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">{stats.isTodayUploaded ? 'সুরক্ষিত' : 'ব্যাকআপ'}</p>
              <p className="text-[10px] text-slate-400 font-bold">ড্রাইভ সিঙ্ক</p>
            </div>
          </div>
          <button 
            onClick={onGoToReports}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md ${stats.isTodayUploaded ? 'text-emerald-600 bg-emerald-50' : 'text-white bg-indigo-600'}`}
          >
            {stats.isTodayUploaded ? 'রিপোর্ট' : 'সিঙ্ক'}
          </button>
        </div>
      </div>

      {/* Charts & Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">মাসিক লেনদেন</h3>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> <span className="text-[10px] font-bold text-slate-400">আয়</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-200"></span> <span className="text-[10px] font-bold text-slate-400">ব্যয়</span></div>
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

        {/* Night Summary Progress */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-4">নাইট সামারি প্রগ্রেস</h3>
            <div className="relative h-32 flex items-center justify-center">
              <div className={`relative w-24 h-24 rounded-full border-[10px] transition-all flex items-center justify-center ${stats.isTodayClosed ? 'border-emerald-500 ring-8 ring-emerald-50' : 'border-slate-50'}`}>
                <div className="text-center">
                  <span className={`text-xl font-black ${stats.isTodayClosed ? 'text-emerald-600' : 'text-slate-800'}`}>{todayNightCount}</span>
                  <span className="text-[10px] text-slate-400 block font-bold">/ ১১</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50">
            <p className="text-[10px] text-slate-400 font-bold uppercase text-center">
              {stats.isTodayClosed ? 'আজকের সব হিসাব সম্পন্ন ✅' : 'আজকের নাইট এন্ট্রি স্ট্যাটাস'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-6">সাম্প্রতিক লেনদেন</h3>
        <div className="space-y-4">
          {recentEntries.map((entry: any, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${entry.category === 'আয়' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {entry.category === 'আয়' ? '📥' : '📤'}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">
                    {'type' in entry && typeof entry.type === 'string' && entry.category === 'আয়' ? getLiveLabel(entry.type) : (entry.name || 'ব্যয়')}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{entry.category}</p>
                </div>
              </div>
              <p className={`text-sm font-black ${entry.category === 'আয়' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {entry.category === 'আয়' ? '+' : '-'} ৳{entry.amount}
              </p>
            </div>
          ))}
          {recentEntries.length === 0 && (
            <div className="text-center py-6 text-slate-300 italic text-xs font-bold uppercase tracking-widest">
              কোন ডাটা পাওয়া যায়নি
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper inside the file to avoid import issues
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

export default Dashboard;
