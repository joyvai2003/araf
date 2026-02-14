
import React, { useState } from 'react';
import { LiveEntry, Expense, NightEntry, NightCategory, CashEntry } from '../types';

interface Props {
  onAddLive: (e: LiveEntry) => void;
  onAddExpense: (e: Expense) => void;
  onAddNight: (e: NightEntry) => void;
  onDeleteNight: (id: string) => void;
  onAddCash: (e: CashEntry) => void;
  nightEntries: NightEntry[];
}

const EntryForms: React.FC<Props> = ({ onAddLive, onAddExpense, onAddNight, onDeleteNight, onAddCash, nightEntries }) => {
  const [activeSubTab, setActiveSubTab] = useState<'live' | 'expense' | 'night' | 'cashbox'>('live');
  const today = new Date().toLocaleDateString('en-CA');

  const todayNightEntries = nightEntries.filter(n => n.date === today);

  const getTodayEntry = (type: NightCategory) => {
    return todayNightEntries.find(e => e.type === type);
  };

  const digitalTotal = todayNightEntries
    .filter(e => ['bkash_agent', 'nagad_agent', 'bkash_p1', 'bkash_p2', 'nagad_p1', 'nagad_p2', 'rocket'].includes(e.type))
    .reduce((sum, e) => sum + e.amount, 0);

  const handleResetToday = () => {
    if (window.confirm('আজকের সকল নাইট সামারি কি মুছে ফেলতে চান?')) {
      todayNightEntries.forEach(e => onDeleteNight(e.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveSubTab('live')} className={`flex-1 min-w-[70px] py-2 text-[10px] font-bold rounded-lg transition-all ${activeSubTab === 'live' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>লাইভ</button>
        <button onClick={() => setActiveSubTab('expense')} className={`flex-1 min-w-[70px] py-2 text-[10px] font-bold rounded-lg transition-all ${activeSubTab === 'expense' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>খরচ</button>
        <button onClick={() => setActiveSubTab('night')} className={`flex-1 min-w-[70px] py-2 text-[10px] font-bold rounded-lg transition-all ${activeSubTab === 'night' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>নাইট</button>
        <button onClick={() => setActiveSubTab('cashbox')} className={`flex-1 min-w-[70px] py-2 text-[10px] font-bold rounded-lg transition-all ${activeSubTab === 'cashbox' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>ক্যাশ</button>
      </div>

      {activeSubTab === 'live' && (
        <div className="grid grid-cols-1 gap-4">
          <LiveInputCard title="ফটোকপি" type="photocopy" onAdd={onAddLive} icon="📠" />
          <LiveInputCard title="কালার প্রিন্ট" type="color_print" onAdd={onAddLive} icon="🌈" />
          <LiveInputCard title="ফটো প্রিন্ট" type="photo_print" onAdd={onAddLive} icon="🖼️" />
          <LiveInputCard title="অনলাইন আবেদন" type="online_apply" onAdd={onAddLive} icon="🌐" />
          <LiveInputCard title="অন্যান্য আয়" type="others" onAdd={onAddLive} icon="➕" />
        </div>
      )}

      {activeSubTab === 'expense' && <ExpenseForm onAdd={onAddExpense} />}

      {activeSubTab === 'night' && (
        <div className="space-y-4">
          <div className="bg-slate-800 p-5 rounded-[2rem] text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">নাইট ক্লোজিং ({today})</h3>
                <p className="text-[10px] text-slate-400">মোবাইল ব্যাংকিং ও লোড ব্যালেন্স আপডেট করুন।</p>
                <div className="mt-4">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">মোট ডিজিটাল ব্যালেন্স</p>
                  <p className="text-2xl font-black text-emerald-400">৳ {digitalTotal.toLocaleString('bn-BD')}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-[10px] font-bold bg-white/10 px-3 py-1 rounded-full">
                  এন্ট্রি: {todayNightEntries.length}/১১
                </div>
                <button 
                  onClick={handleResetToday}
                  className="text-[10px] font-bold bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full hover:bg-rose-500 hover:text-white transition-all"
                >
                  রিসেট
                </button>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <NightInputCard title="বিকাশ এজেন্ট" type="bkash_agent" onAdd={onAddNight} onDelete={onDeleteNight} icon="📱" color="bg-pink-50" existingEntry={getTodayEntry('bkash_agent')} />
            <NightInputCard title="নগদ এজেন্ট" type="nagad_agent" onAdd={onAddNight} onDelete={onDeleteNight} icon="🟠" color="bg-orange-50" existingEntry={getTodayEntry('nagad_agent')} />
            <NightInputCard title="বিকাশ পার্সোনাল ১" type="bkash_p1" onAdd={onAddNight} onDelete={onDeleteNight} icon="👤" color="bg-pink-50" existingEntry={getTodayEntry('bkash_p1')} />
            <NightInputCard title="বিকাশ পার্সোনাল ২" type="bkash_p2" onAdd={onAddNight} onDelete={onDeleteNight} icon="👥" color="bg-pink-50" existingEntry={getTodayEntry('bkash_p2')} />
            <NightInputCard title="নগদ পার্সোনাল ১" type="nagad_p1" onAdd={onAddNight} onDelete={onDeleteNight} icon="👤" color="bg-orange-50" existingEntry={getTodayEntry('nagad_p1')} />
            <NightInputCard title="নগদ পার্সোনাল ২" type="nagad_p2" onAdd={onAddNight} onDelete={onDeleteNight} icon="👥" color="bg-orange-50" existingEntry={getTodayEntry('nagad_p2')} />
            <NightInputCard title="রকেট" type="rocket" onAdd={onAddNight} onDelete={onDeleteNight} icon="🚀" color="bg-purple-50" existingEntry={getTodayEntry('rocket')} />
            <NightInputCard title="জিপি লোড" color="bg-blue-50" type="gp_load" onAdd={onAddNight} onDelete={onDeleteNight} icon="📶" existingEntry={getTodayEntry('gp_load')} />
            <NightInputCard title="রবি লোড" color="bg-red-50" type="robi_load" onAdd={onAddNight} onDelete={onDeleteNight} icon="📶" existingEntry={getTodayEntry('robi_load')} />
            <NightInputCard title="মিনিট কার্ড" color="bg-yellow-50" type="minute_card" onAdd={onAddNight} onDelete={onDeleteNight} icon="🎴" existingEntry={getTodayEntry('minute_card')} />
            <NightInputCard title="অন্যান্য" color="bg-slate-50" type="others" onAdd={onAddNight} onDelete={onDeleteNight} icon="📦" existingEntry={getTodayEntry('others')} />
          </div>
        </div>
      )}

      {activeSubTab === 'cashbox' && <CashBoxForm onAdd={onAddCash} />}
    </div>
  );
};

const CashBoxForm = ({ onAdd }: { onAdd: (e: CashEntry) => void }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const today = new Date().toLocaleDateString('en-CA');

  const handleEntry = (type: 'in' | 'out') => {
    if (!amount) return alert('টাকার পরিমাণ দিন');
    onAdd({
      id: crypto.randomUUID(),
      amount: Number(amount),
      type,
      note: note || (type === 'in' ? 'ক্যাশ জমা' : 'ক্যাশ উত্তোলন'),
      date: today,
      timestamp: Date.now()
    });
    setAmount('');
    setNote('');
    alert('ক্যাশ বক্স এন্ট্রি সফল হয়েছে!');
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-amber-100 p-2 rounded-xl text-amber-600 text-xl">💰</div>
        <h3 className="font-bold text-slate-800">ক্যাশ ইন/আউট (Box Adjustment)</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">টাকার পরিমাণ (৳)</label>
          <input 
            type="number" 
            placeholder="৳ ০.০০" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-2xl font-black text-slate-700" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">বিবরণ (ঐচ্ছিক)</label>
          <input 
            type="text" 
            placeholder="যেমন: খুচরা টাকা রাখলাম" 
            value={note} 
            onChange={e => setNote(e.target.value)} 
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <button 
            onClick={() => handleEntry('in')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 flex flex-col items-center gap-1 transition-all active:scale-95"
          >
            <span className="text-lg">➕</span>
            <span>ক্যাশ জমা</span>
          </button>
          <button 
            onClick={() => handleEntry('out')}
            className="bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-amber-100 flex flex-col items-center gap-1 transition-all active:scale-95"
          >
            <span className="text-lg">➖</span>
            <span>ক্যাশ উত্তোলন</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const LiveInputCard = ({ title, type, onAdd, icon }: any) => {
  const [amount, setAmount] = useState('');
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border border-slate-100">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="font-bold text-slate-700">{title}</span>
      </div>
      <div className="flex gap-2">
        <input 
          type="number" 
          placeholder="৳" 
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-20 px-3 py-1 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
        />
        <button 
          onClick={() => { if(amount) { onAdd({ id: crypto.randomUUID(), type, amount: Number(amount), timestamp: Date.now(), date: new Date().toLocaleDateString('en-CA') }); setAmount(''); } }}
          className="bg-emerald-600 text-white px-4 py-1 rounded-lg font-bold"
        >যোগ</button>
      </div>
    </div>
  );
};

const NightInputCard = ({ title, type, onAdd, onDelete, icon, color, existingEntry }: { title: string, type: NightCategory, onAdd: (e: NightEntry) => void, onDelete: (id: string) => void, icon: string, color: string, existingEntry?: NightEntry }) => {
  const [amount, setAmount] = useState('');
  
  return (
    <div className={`${color} p-4 rounded-2xl shadow-sm flex items-center justify-between border ${existingEntry ? 'border-emerald-500 ring-1 ring-emerald-500/10' : 'border-slate-200/50'}`}>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-bold text-slate-700 text-xs">{title}</span>
          {existingEntry && (
            <button 
              onClick={() => onDelete(existingEntry.id)}
              className="text-slate-300 hover:text-rose-500 transition-colors ml-1"
              title="মুছে ফেলুন"
            >
              🗑️
            </button>
          )}
        </div>
        {existingEntry && (
          <span className="text-[9px] font-bold text-emerald-700 mt-1">৳ {existingEntry.amount.toLocaleString('bn-BD')}</span>
        )}
      </div>
      <div className="flex gap-2">
        <input 
          type="number" 
          placeholder={existingEntry ? "নতুন" : "ব্যালেন্স"} 
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-20 px-2 py-1.5 rounded-xl border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-bold bg-white"
        />
        <button 
          onClick={() => { 
            if(amount) { 
              onAdd({ id: crypto.randomUUID(), type, amount: Number(amount), date: new Date().toLocaleDateString('en-CA') }); 
              setAmount('');
            } 
          }}
          className={`px-3 py-1.5 rounded-xl font-bold text-[10px] transition-all ${existingEntry ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-white'}`}
        >
          {existingEntry ? 'আপডেট' : 'সেভ'}
        </button>
      </div>
    </div>
  );
};

const ExpenseForm = ({ onAdd }: any) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const quickExpenses = [
    { label: 'দোকান ভাড়া', value: 'দোকান ভাড়া' },
    { label: 'বিদ্যুৎ বিল', value: 'বিদ্যুৎ বিল' },
    { label: 'ওয়াইফাই বিল', value: 'ওয়াইফাই বিল' },
    { label: 'অন্যান্য', value: '' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <h3 className="font-bold text-slate-800 border-b pb-2">খরচের হিসাব</h3>
      
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">দ্রুত নির্বাচন করুন</p>
        <div className="grid grid-cols-2 gap-2">
          {quickExpenses.map((exp) => (
            <button
              key={exp.label}
              onClick={() => setName(exp.value)}
              className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                name === exp.value && exp.value !== ''
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                  : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300'
              }`}
            >
              {exp.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">খরচের নাম</label>
          <input 
            type="text" 
            placeholder="খরচের নাম লিখুন" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" 
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">পরিমাণ (৳)</label>
          <input 
            type="number" 
            placeholder="৳ ০.০০" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-xl font-bold" 
          />
        </div>

        <button 
          onClick={() => { 
            if(name && amount) { 
              onAdd({ id: crypto.randomUUID(), name, amount: Number(amount), date: new Date().toLocaleDateString('en-CA') }); 
              setName(''); 
              setAmount(''); 
              alert('খরচ যোগ করা হয়েছে!');
            } else {
              alert('দয়া করে নাম এবং পরিমাণ দুটিই লিখুন।');
            }
          }}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-rose-200 transition-all active:scale-95"
        >
          খরচ যোগ করুন
        </button>
      </div>
    </div>
  );
};

export default EntryForms;
