
import React, { useState } from 'react';
import { LiveEntry, Expense } from '../types';
import { getFinancialAdvice } from '../services/geminiService';

interface Props {
  liveEntries: LiveEntry[];
  expenses: Expense[];
}

const SmartAssistant: React.FC<Props> = ({ liveEntries, expenses }) => {
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async () => {
    if (liveEntries.length === 0 && expenses.length === 0) {
      setAdvice("পরামর্শ দেওয়ার জন্য আপনার কিছু হিসাব থাকা প্রয়োজন। আগে কিছু এন্ট্রি করুন!");
      return;
    }
    setLoading(true);
    const result = await getFinancialAdvice(liveEntries, expenses);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="bg-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-2xl shadow-lg shadow-emerald-500/20">🤖</div>
          <h2 className="text-2xl font-black mb-2 tracking-tight">স্মার্ট এআই সহকারী</h2>
          <p className="opacity-70 mb-8 max-w-sm text-sm leading-relaxed">আপনার দোকানের আয়-ব্যয় বিশ্লেষণ করে জেমিনি এআই আপনাকে বিজনেস গ্রোথ টিপস দেবে।</p>
          <button 
            onClick={handleGetAdvice}
            disabled={loading}
            className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transform active:scale-95 transition-all ${loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-white'}`}
          >
            {loading ? 'অ্যানালাইজ করা হচ্ছে...' : 'পরামর্শ নিন'}
          </button>
        </div>
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
      </div>

      {advice && (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <h3 className="font-black text-slate-800 uppercase tracking-wider text-xs">জেমিনির বিজনেস রিপোর্ট</h3>
          </div>
          <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
            {advice}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartAssistant;
