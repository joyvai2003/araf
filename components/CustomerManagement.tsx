
import React, { useState, useRef } from 'react';
import { DueEntry, LiveEntry } from '../types';

interface Props {
  dueEntries: DueEntry[];
  onAddDue: (d: DueEntry) => void;
  onUpdateDue: (id: string, updates: Partial<DueEntry>) => void;
  onDeleteDuePermanently: (id: string) => void;
  onAddLive: (e: LiveEntry) => void;
}

const CustomerManagement: React.FC<Props> = ({ dueEntries, onAddDue, onUpdateDue, onDeleteDuePermanently, onAddLive }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [showPaid, setShowPaid] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [confirmingDue, setConfirmingDue] = useState<DueEntry | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toLocaleDateString('en-CA');

  const activeDues = dueEntries.filter(d => !d.isPaid);
  const paidDues = dueEntries.filter(d => d.isPaid);

  const listToDisplay = showPaid ? paidDues : activeDues;

  const filteredDues = listToDisplay.filter(due => 
    due.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (due.phone && due.phone.includes(searchTerm))
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          setPhoto(canvas.toDataURL('image/jpeg', 0.8));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDue = () => {
    if (!name || !amount) return alert('কাস্টমারের নাম এবং টাকার পরিমাণ দিন।');
    onAddDue({
      id: crypto.randomUUID(),
      customerName: name,
      phone,
      amount: Number(amount),
      note,
      date: today,
      timestamp: Date.now(),
      customerPhoto: photo || undefined,
      isPaid: false
    });
    setName(''); setPhone(''); setAmount(''); setNote(''); setPhoto(null);
  };

  const confirmCollection = () => {
    if (!confirmingDue) return;
    onUpdateDue(confirmingDue.id, { isPaid: true, paidDate: today });
    onAddLive({
      id: crypto.randomUUID(),
      type: 'due_collection',
      amount: confirmingDue.amount,
      timestamp: Date.now(),
      date: today
    });
    setConfirmingDue(null);
  };

  const handleDownloadInvoice = async (due: DueEntry) => {
    setIsGeneratingInvoice(true);
    const element = document.getElementById(`invoice-${due.id}`);
    if (!element) return;
    
    const opt = {
      margin: 0,
      filename: `Invoice_${due.customerName}_${due.date}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      await window.html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error(err);
      alert('রসিদ তৈরিতে সমস্যা হয়েছে।');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleWhatsApp = (due: DueEntry) => {
    if (!due.phone) return alert('কাস্টমারের মোবাইল নম্বর নেই।');
    const cleanPhone = due.phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? '88' + cleanPhone : cleanPhone;
    const message = `আসালামু আলাইকুম ${due.customerName},\nআপনার আরাফ টেলিকম দোকানে বকেয়া পাওনা ৳${due.amount} টাকা। অনুগ্রহ করে দ্রুত বকেয়া পরিশোধ করার জন্য অনুরোধ করা হলো। ধন্যবাদ!`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Search & Toggle */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-20 z-30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span className="text-emerald-600">👥</span> কাস্টমার হিসাব
          </h2>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button onClick={() => setShowPaid(false)} className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${!showPaid ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>বাকি</button>
            <button onClick={() => setShowPaid(true)} className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${showPaid ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>পরিশোধিত</button>
          </div>
        </div>
        <div className="relative group">
          <input 
            type="text" 
            placeholder="নাম বা মোবাইল দিয়ে খুঁজুন..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-[1.8rem] bg-slate-50 border border-transparent outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all font-bold text-slate-700"
          />
          <span className="absolute left-5 top-4.5 text-xl opacity-30 group-focus-within:opacity-100 transition-opacity">🔍</span>
        </div>
      </div>

      {/* Entry Form */}
      {!showPaid && (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-50"></div>
          <div className="relative z-10">
            <div className="flex gap-4 items-start mb-6">
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">কাস্টমার প্রোফাইল</label>
                  <input type="text" placeholder="কাস্টমারের নাম" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-rose-500/20 font-black text-slate-700 placeholder:font-normal" />
                </div>
                <input type="text" placeholder="মোবাইল নম্বর" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-rose-500/20 font-bold" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-28 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 cursor-pointer overflow-hidden relative group hover:border-rose-400 hover:bg-rose-50/30 transition-all"
                >
                  {photo ? <img src={photo} alt="Preview" className="w-full h-full object-cover" /> : <><span className="text-3xl mb-1">📸</span><span className="text-[9px] font-black uppercase text-center leading-tight">কাস্টমার ফটো</span></>}
                </div>
                <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" />
                {photo && <button onClick={() => setPhoto(null)} className="text-[10px] text-rose-500 font-black underline">রিসেট</button>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <span className="absolute left-4 top-4 font-black text-rose-600 text-lg">৳</span>
                <input type="number" placeholder="পরিমাণ" value={amount} onChange={e => setAmount(e.target.value)} className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-rose-500/20 text-2xl font-black text-rose-700 placeholder:font-normal placeholder:text-slate-300" />
              </div>
              <input type="text" placeholder="নোট (যেমন: মোবাইল রিচার্জ)" value={note} onChange={e => setNote(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-rose-500/20 font-medium" />
            </div>
            <button onClick={handleAddDue} className="w-full bg-rose-600 hover:bg-rose-700 text-white py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-rose-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
              <span>📌</span> বাকি এন্ট্রি সেভ করুন
            </button>
          </div>
        </div>
      )}

      {/* Due/Paid List */}
      <div className="space-y-4">
        {filteredDues.map(due => (
          <div key={due.id} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-5 hover:border-emerald-400 transition-all group relative overflow-hidden">
            {due.isPaid && <div className="absolute top-8 right-[-45px] bg-emerald-600 text-white text-[10px] font-black px-12 py-1.5 rotate-45 shadow-xl tracking-[0.2em]">PAID ✅</div>}
            
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl overflow-hidden border border-slate-200 shadow-inner group-hover:scale-105 transition-transform">
                  {due.customerPhoto ? <img src={due.customerPhoto} alt="" className="w-full h-full object-cover" /> : "👤"}
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-slate-800 text-xl tracking-tight leading-none">{due.customerName}</h3>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{due.phone || 'মোবাইল নেই'}</p>
                    <p className="text-[11px] text-slate-300 font-bold">তারিখ: {due.date}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-black ${due.isPaid ? 'text-emerald-600' : 'text-rose-600'}`}>৳ {due.amount.toLocaleString('bn-BD')}</p>
                {!due.isPaid && <p className="text-[9px] bg-rose-50 text-rose-500 px-2 py-0.5 rounded-md font-black uppercase inline-block mt-1 animate-pulse tracking-widest">বকেয়া পাওনা</p>}
              </div>
            </div>

            {due.note && <div className="text-[11px] text-slate-500 bg-slate-50/50 p-4 rounded-2xl italic border-l-4 border-slate-200 leading-relaxed font-medium">বিস্তারিত: {due.note}</div>}

            <div className="flex gap-2">
              {!due.isPaid ? (
                <>
                  <button onClick={() => setConfirmingDue(due)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 transition-all">
                    <span>✅</span> আদায়
                  </button>
                  <button onClick={() => handleDownloadInvoice(due)} className="flex-1 bg-slate-900 hover:bg-black text-white h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-slate-200 active:scale-95 transition-all">
                    <span>📄</span> রসিদ
                  </button>
                  <button onClick={() => handleWhatsApp(due)} className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-green-100 transition-all active:scale-90">💬</button>
                </>
              ) : (
                <button onClick={() => onDeleteDuePermanently(due.id)} className="w-full bg-rose-50 text-rose-600 h-12 rounded-2xl text-[11px] font-black uppercase hover:bg-rose-600 hover:text-white transition-all">🗑️ ডিলিট করুন</button>
              )}
            </div>

            {/* PROFESSIONAL A5 INVOICE (Hidden) */}
            <div className="hidden">
              <div id={`invoice-${due.id}`} className="bg-white text-slate-900 w-[148mm] min-h-[210mm] font-['Hind_Siliguri'] relative p-0 overflow-hidden">
                {/* Modern Banner Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
                
                <div className="px-10 py-12 relative z-10">
                  <div className="flex justify-between items-start mb-14 border-b-2 border-slate-900 pb-8">
                    <div>
                      <h1 className="text-3xl font-black text-emerald-900 leading-none mb-2">ARAF TELECOM</h1>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Mobile & Computer Solutions</p>
                      <div className="text-[10px] font-bold text-slate-600 space-y-1">
                        <p className="flex items-center gap-2">📍 মেইন রোড, আরাপটেলিকম মার্কেট</p>
                        <p className="flex items-center gap-2">📞 ০১৭xxxxxxxx, ০১৯xxxxxxxx</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest mb-3 ${due.isPaid ? 'bg-emerald-600 text-white shadow-lg' : 'bg-rose-600 text-white shadow-lg'}`}>
                        {due.isPaid ? 'Payment Receipt' : 'Due Statement'}
                      </div>
                      <p className="text-[10px] text-slate-400 font-black uppercase">Invoice: #{due.id.slice(0,8).toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-14 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Details</p>
                      <h2 className="text-2xl font-black text-slate-900 leading-tight">{due.customerName}</h2>
                      <p className="text-sm font-bold text-slate-600">Ph: {due.phone || 'Not Provided'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Date: {due.date}</p>
                      {due.customerPhoto && <div className="w-24 h-24 rounded-3xl border-4 border-white shadow-2xl overflow-hidden float-right"><img src={due.customerPhoto} className="w-full h-full object-cover" /></div>}
                    </div>
                  </div>

                  <table className="w-full mb-20">
                    <thead>
                      <tr className="border-b-2 border-slate-900">
                        <th className="py-4 text-left font-black text-xs uppercase text-slate-400 tracking-widest">Service Description</th>
                        <th className="py-4 text-right font-black text-xs uppercase text-slate-400 tracking-widest">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-10">
                          <p className="font-black text-lg text-slate-800 mb-2">{due.note || 'Business Service Due'}</p>
                          <p className="text-[10px] text-slate-400 font-bold italic">This invoice serves as a formal record of {due.isPaid ? 'payment received' : 'outstanding balance'}.</p>
                        </td>
                        <td className="py-10 text-right align-top">
                          <p className="text-3xl font-black text-slate-900">৳ {due.amount.toLocaleString('bn-BD')}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="flex justify-between items-end border-t border-slate-100 pt-10">
                    <div className="max-w-[180px]">
                      <h4 className="text-[10px] font-black uppercase text-slate-800 mb-3 underline decoration-emerald-500 decoration-2">Note:</h4>
                      <p className="text-[9px] text-slate-400 leading-relaxed font-bold">
                        Please keep this receipt for future reference. For any queries, contact our support line. 
                        Digital records are stored securely in Araf Telecom Cloud.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="bg-slate-900 text-white px-10 py-6 rounded-[2.5rem] shadow-2xl mb-14">
                        <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em] mb-1">Final Amount</p>
                        <p className="text-4xl font-black">৳ {due.amount.toLocaleString('bn-BD')}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-44 border-t-2 border-slate-900 pt-3 mx-auto">
                          <p className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Authorized Signature</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Aesthetic Footer */}
                  <div className="absolute bottom-10 left-0 w-full text-center">
                    <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.6em]">Araf Telecom • Digital POS Solution</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredDues.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl grayscale opacity-30">📂</div>
            <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">কোন ডাটা পাওয়া যায়নি</p>
          </div>
        )}
      </div>

      {/* ADAI CONFIRMATION MODAL */}
      {confirmingDue && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="h-2 bg-emerald-500 w-full"></div>
            <div className="p-10 text-center">
              <div className="w-32 h-32 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-100 overflow-hidden relative group">
                {confirmingDue.customerPhoto ? (
                  <img src={confirmingDue.customerPhoto} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                  <span className="text-5xl">👤</span>
                )}
                <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">আদায় নিশ্চিত করুন</h3>
              <p className="text-slate-500 mb-10 font-medium leading-relaxed">
                কাস্টমার <span className="font-black text-slate-900">{confirmingDue.customerName}</span> এর থেকে <br/>
                <span className="text-3xl font-black text-emerald-600 block my-4">৳ {confirmingDue.amount.toLocaleString('bn-BD')}</span>
                টাকা কি নগদ বুঝে পেয়েছেন?
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <button onClick={confirmCollection} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 transition-all active:scale-[0.98]">হ্যাঁ, আদায় হয়েছে</button>
                <button onClick={() => setConfirmingDue(null)} className="w-full bg-slate-50 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-100">পরে করবো</button>
              </div>
            </div>
            <div className="bg-emerald-50 py-4 text-[11px] font-black text-emerald-700 uppercase text-center tracking-[0.4em]">ARAF TELECOM POS</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
