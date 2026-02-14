
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';

interface Props {
  onAdd: (t: Omit<Transaction, 'id'>) => void;
}

const TransactionForm: React.FC<Props> = ({ onAdd }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('অন্যান্য');

  const categories = type === 'income' 
    ? ['বেতন', 'বোনাস', 'উপহার', 'বিনিয়োগ', 'অন্যান্য']
    : ['খাবার', 'যাতায়াত', 'বাজার', 'বিল', 'শিক্ষা', 'স্বাস্থ্য', 'বিনোদন', 'অন্যান্য'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    
    onAdd({
      description,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toLocaleDateString('bn-BD')
    });

    setDescription('');
    setAmount('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
      <h2 className="text-lg font-bold text-slate-800 mb-4">নতুন হিসাব যোগ করুন</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">বিবরণ</label>
          <input 
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="যেমন: দুপুরের খাবার"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">পরিমাণ (৳)</label>
          <input 
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            required
          />
        </div>
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${type === 'expense' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            ব্যয়
          </button>
          <button 
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${type === 'income' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            আয়
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">ক্যাটাগরি</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button 
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
        >
          সেভ করুন
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
