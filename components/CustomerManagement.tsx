
import React, { useState, useRef } from 'react';
import { DueEntry, LiveEntry } from '../types';
import { translations } from '../translations';

interface Props {
  dueEntries: DueEntry[];
  onAddDue: (d: DueEntry) => void;
  onUpdateDue: (id: string, updates: Partial<DueEntry>) => void;
  onDeleteDuePermanently: (id: string) => void;
  onAddLive: (e: LiveEntry) => void;
  language: 'bn' | 'en';
}

const CustomerManagement: React.FC<Props> = ({ dueEntries, onAddDue, onUpdateDue, onDeleteDuePermanently, onAddLive, language }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [showPaid, setShowPaid] = useState(false);
  const [confirmingDue, setConfirmingDue] = useState<DueEntry | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toLocaleDateString('en-CA');
  const t = translations[language].dues;

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
    if (!name || !amount) return alert(language === 'bn' ? 'কাস্টমারের নাম এবং পরিমাণ দিন।' : 'Enter name and amount.');
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
    setIsGenerating(true);
    const element = document.getElementById(`invoice-${due.id}`);
    if (!element) {
      setIsGenerating(false);
      return;
    }
    
    const opt = {
      margin: 0,
      filename: `Invoice_${due.customerName}_${due.date}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 3, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      await window.html2pdf().from(element).set(opt).save();
    } catch (err) {
      alert('Error generating receipt.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-20 z-30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span className="text-emerald-600">👥</span> {t.title}
          </h2>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button onClick={() => setShowPaid(false)} className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${!showPaid ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{t.dueTab}</button>
            <button onClick={() => setShowPaid(true)} className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${showPaid ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{t.paidTab}</button>
          </div>
        </div>
        <div className="relative group">
          <input 
            type="text" 
            placeholder={t.search} 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-[1.8rem] bg-slate-50 border border-transparent outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all font-bold text-slate-700"
          />
          <span className="absolute left-5 top-4.5 text-xl opacity-30">🔍</span>
        </div>
      </div>

      {!showPaid && (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex gap-4 items-start mb-6">
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.profile}</label>
                  <input type="text" placeholder={t.custName} value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none outline-none font-black text-slate-700" />
                </div>
                <input type="text" placeholder={t.mobile} value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none outline-none font-bold" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-28 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 cursor-pointer overflow-hidden relative group"
                >
                  {photo ? <img src={photo} alt="Preview" className="w-full h-full object-cover" /> : <><span className="text-3xl mb-1">📸</span><span className="text-[9px] font-black uppercase text-center">{language === 'bn' ? 'ফটো' : 'Photo'}</span></>}
                </div>
                <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <input type="number" placeholder={t.amount} value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none outline-none text-xl font-black text-rose-700" />
              <input type="text" placeholder={t.note} value={note} onChange={e => setNote(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none outline-none font-medium" />
            </div>
            <button onClick={handleAddDue} className="w-full bg-rose-600 text-white py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl">
              <span>📌</span> {t.save}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredDues.map(due => (
          <div key={due.id} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-5 hover:border-emerald-400 transition-all group relative overflow-hidden">
            {due.isPaid && <div className="absolute top-8 right-[-45px] bg-emerald-600 text-white text-[10px] font-black px-12 py-1.5 rotate-45 shadow-xl tracking-[0.2em]">{t.paid.toUpperCase()} ✅</div>}
            
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl overflow-hidden border border-slate-200">
                  {due.customerPhoto ? <img src={due.customerPhoto} alt="" className="w-full h-full object-cover" /> : "👤"}
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-slate-800 text-xl tracking-tight leading-none">{due.customerName}</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{due.phone || (language === 'bn' ? 'মোবাইল নেই' : 'No mobile')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-black ${due.isPaid ? 'text-emerald-600' : 'text-rose-600'}`}>৳ {due.amount.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-IN')}</p>
                {!due.isPaid && <p className="text-[9px] bg-rose-50 text-rose-500 px-2 py-0.5 rounded-md font-black uppercase inline-block mt-1">{t.unpaid}</p>}
              </div>
            </div>

            <div className="flex gap-2">
              {!due.isPaid ? (
                <>
                  <button onClick={() => setConfirmingDue(due)} className="flex-1 bg-emerald-600 text-white h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <span>✅</span> {t.collect}
                  </button>
                  <button onClick={() => handleDownloadInvoice(due)} disabled={isGenerating} className="flex-1 bg-slate-900 text-white h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <span>📄</span> {isGenerating ? '...' : t.receipt}
                  </button>
                </>
              ) : (
                <button onClick={() => onDeleteDuePermanently(due.id)} className="w-full bg-rose-50 text-rose-600 h-12 rounded-2xl text-[11px] font-black uppercase hover:bg-rose-600 hover:text-white transition-all">🗑️ {t.delete}</button>
              )}
            </div>
            
            {/* INVOICE TEMPLATE (English) - Moved offscreen instead of hidden */}
            <div className="pdf-offscreen">
               <div id={`invoice-${due.id}`} className="bg-white p-12 w-[148mm] min-h-[210mm] font-sans text-slate-900">
                  <div className="border-b-4 border-slate-900 pb-6 mb-10">
                    <h1 className="text-4xl font-black mb-1">ARAF TELECOM</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Mobile & Computer Solutions</p>
                  </div>

                  <div className="mb-10">
                    <p className="text-[10px] uppercase font-black text-slate-300 mb-2">Customer Details</p>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-black text-slate-900">{due.customerName}</p>
                        <p className="text-sm font-bold text-slate-500">Phone: {due.phone || 'N/A'}</p>
                      </div>
                      {due.customerPhoto && (
                        <div className="w-20 h-20 rounded-2xl border-2 border-white shadow-md overflow-hidden">
                          <img src={due.customerPhoto} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-12">
                     <p className="text-[10px] uppercase font-black text-slate-300 mb-2">Service Note</p>
                     <p className="text-sm font-bold text-slate-700 italic border-l-4 border-slate-200 pl-4 py-2">
                        {due.note || 'General Telecom Service'}
                     </p>
                  </div>

                  <div className="bg-slate-900 text-white p-8 rounded-[2rem] flex justify-between items-center shadow-xl mb-12">
                    <div>
                      <p className="text-[10px] uppercase font-black opacity-50 mb-1">Current Status</p>
                      <p className="text-xl font-black">{due.isPaid ? 'PAID ✅' : 'OUTSTANDING ⏳'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black opacity-50 mb-1">Total Amount</p>
                      <p className="text-4xl font-black">৳ {due.amount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-slate-100 pt-10">
                    <div>
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Date: {due.date}</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Inv ID: #AT-{due.id.slice(0,8).toUpperCase()}</p>
                    </div>
                    <div className="text-center w-40 border-t-2 border-slate-900 pt-3">
                      <p className="text-[10px] font-black uppercase">Authorized Sign</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {confirmingDue && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 text-center animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-2">{language === 'bn' ? 'আদায় নিশ্চিত করুন' : 'Confirm Collection'}</h3>
            <p className="text-slate-500 mb-8">{confirmingDue.customerName} - <span className="font-black text-emerald-600">৳{confirmingDue.amount}</span></p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmCollection} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase">Confirm</button>
              <button onClick={() => setConfirmingDue(null)} className="w-full text-slate-400 py-2 font-black uppercase">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
