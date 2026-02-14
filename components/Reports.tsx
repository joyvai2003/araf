
import React, { useState, useRef, useEffect } from 'react';
import { LiveEntry, Expense, NightEntry, NightCategory, CashEntry, AppSettings, DueEntry } from '../types';

interface Props {
  liveEntries: LiveEntry[];
  expenses: Expense[];
  nightEntries: NightEntry[];
  cashEntries: CashEntry[];
  dueEntries: DueEntry[];
  onDeleteLive: (id: string) => void;
  onDeleteExpense: (id: string) => void;
  onDeleteNight: (id: string) => void;
  onDeleteCash: (id: string) => void;
  onDeleteDue: (id: string) => void;
  settings: AppSettings;
  uploadedDates: string[];
  onUploadSuccess: (date: string) => void;
  autoSyncEnabled?: boolean;
  onAutoSyncHandled?: () => void;
}

const Reports: React.FC<Props> = ({ liveEntries, expenses, nightEntries, cashEntries, dueEntries, onDeleteLive, onDeleteExpense, onDeleteNight, onDeleteCash, onDeleteDue, settings, uploadedDates, onUploadSuccess, autoSyncEnabled, onAutoSyncHandled }) => {
  const [filterDate, setFilterDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'generating' | 'uploading' | 'success' | 'error'>('idle');
  const reportRef = useRef<HTMLDivElement>(null);
  const tokenClientRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google && settings.googleClientId) {
      try {
        tokenClientRef.current = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: settings.googleClientId,
          scope: 'https://www.googleapis.com/auth/drive.file',
          callback: '', 
        });
      } catch (e) {
        console.error("GIS Init Error:", e);
      }
    }
  }, [settings.googleClientId]);

  useEffect(() => {
    if (autoSyncEnabled && uploadStatus === 'idle' && tokenClientRef.current) {
      handleSaveToDrive();
      if (onAutoSyncHandled) onAutoSyncHandled();
    }
  }, [autoSyncEnabled, tokenClientRef.current]);

  const filteredLive = liveEntries.filter(e => e.date === filterDate);
  const filteredExp = expenses.filter(e => e.date === filterDate);
  const filteredNight = nightEntries.filter(n => n.date === filterDate);
  const filteredDue = dueEntries.filter(d => d.date === filterDate);

  const totalIncome = filteredLive.reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = filteredExp.reduce((sum, e) => sum + e.amount, 0);
  const digitalTotal = filteredNight.reduce((sum, n) => sum + n.amount, 0);
  const totalDueToday = filteredDue.reduce((sum, d) => sum + d.amount, 0);

  const isSynced = uploadedDates.includes(filterDate);

  const uploadFileToDrive = async (blob: Blob, accessToken: string) => {
    const filename = `Report_ArafTelecom_${filterDate}.pdf`;
    const metadata = { name: filename, mimeType: 'application/pdf' };
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const multipartRequestBody =
          delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) +
          delimiter + 'Content-Type: application/pdf\r\n' + 'Content-Transfer-Encoding: base64\r\n\r\n' +
          base64Data + close_delim;

        try {
          const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + accessToken,
              'Content-Type': 'multipart/related; boundary=' + boundary,
            },
            body: multipartRequestBody,
          });
          if (!response.ok) throw new Error('Upload failed');
          resolve(await response.json());
        } catch (e) { reject(e); }
      };
      reader.readAsDataURL(blob);
    });
  };

  const handleSaveToDrive = async () => {
    if (!reportRef.current) return;
    if (!settings.googleClientId) {
      alert("Settings থেকে Google Client ID সেট করুন।");
      return;
    }
    setUploadStatus('generating');
    try {
      tokenClientRef.current.callback = async (response: any) => {
        if (response.error) { setUploadStatus('error'); return; }
        const accessToken = response.access_token;
        const element = reportRef.current;
        const opt = {
          margin: 5,
          filename: `Report_ArafTelecom_${filterDate}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        // @ts-ignore
        const pdfBlob = await window.html2pdf().from(element).set(opt).output('blob');
        setUploadStatus('uploading');
        await uploadFileToDrive(pdfBlob, accessToken);
        onUploadSuccess(filterDate);
        setUploadStatus('success');
        setTimeout(() => setUploadStatus('idle'), 3000);
      };
      tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
    } catch (e) { 
      setUploadStatus('error');
    }
  };

  const getLiveLabel = (type: string) => {
    switch (type) {
      case 'photocopy': return 'ফটোকপি';
      case 'color_print': return 'কালার প্রিন্ট';
      case 'photo_print': return 'ফটো প্রিন্ট';
      case 'online_apply': return 'অনলাইন আবেদন';
      case 'due_collection': return 'বকেয়া আদায়';
      case 'others': return 'অন্যান্য আয়';
      default: return type;
    }
  };

  const getNightLabel = (type: NightCategory) => {
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

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 no-print flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-slate-800">রিপোর্ট আর্কাইভ</h2>
          {isSynced && <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-full animate-pulse">✅ SYNCED</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={handleSaveToDrive} disabled={uploadStatus !== 'idle'} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${uploadStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
            {uploadStatus === 'idle' ? '📤 ক্লাউড ব্যাকআপ' : uploadStatus === 'generating' ? '⏳ PDF তৈরি হচ্ছে' : '🚀 আপলোড হচ্ছে'}
          </button>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none" />
        </div>
      </div>

      <div ref={reportRef} className="bg-white p-8 rounded-[1rem] shadow-sm border border-slate-100 pdf-container">
        {/* Professional PDF Header */}
        <div className="border-b-4 border-slate-800 pb-4 mb-6 text-center">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Araf Telecom And Computer</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">ডেইলি বিজনেস স্টেটমেন্ট</p>
          <p className="text-sm text-slate-800 font-black mt-1">তারিখ: {new Date(filterDate).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Financial Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
            <p className="text-[10px] text-emerald-600 font-black mb-1 uppercase">মোট আয়</p>
            <p className="text-lg font-black text-emerald-800">৳ {totalIncome.toLocaleString('bn-BD')}</p>
          </div>
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-center">
            <p className="text-[10px] text-rose-600 font-black mb-1 uppercase">মোট ব্যয়</p>
            <p className="text-lg font-black text-rose-800">৳ {totalExpense.toLocaleString('bn-BD')}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
            <p className="text-[10px] text-indigo-600 font-black mb-1 uppercase">ডিজিটাল</p>
            <p className="text-lg font-black text-indigo-800">৳ {digitalTotal.toLocaleString('bn-BD')}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
            <p className="text-[10px] text-amber-600 font-black mb-1 uppercase">নতুন বাকি</p>
            <p className="text-lg font-black text-amber-800">৳ {totalDueToday.toLocaleString('bn-BD')}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">আয়ের বিবরণ</h3>
            <table className="w-full text-[11px] border-collapse">
              <thead><tr className="bg-slate-50"><th className="p-2 border border-slate-200 text-left">বিভাগ</th><th className="p-2 border border-slate-200 text-right">টাকা</th></tr></thead>
              <tbody>
                {filteredLive.map(e => (
                  <tr key={e.id}><td className="p-2 border border-slate-100">{getLiveLabel(e.type)}</td><td className="p-2 border border-slate-100 text-right font-bold">৳ {e.amount}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">নাইট সামারি</h3>
              <table className="w-full text-[11px] border-collapse">
                <thead><tr className="bg-slate-50"><th className="p-2 border border-slate-200 text-left">অ্যাকাউন্ট</th><th className="p-2 border border-slate-200 text-right">ব্যালেন্স</th></tr></thead>
                <tbody>
                  {filteredNight.map(n => (
                    <tr key={n.id}><td className="p-2 border border-slate-100">{getNightLabel(n.type)}</td><td className="p-2 border border-slate-100 text-right font-bold">৳ {n.amount.toLocaleString('bn-BD')}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">ব্যয়ের বিবরণ</h3>
              <table className="w-full text-[11px] border-collapse">
                <thead><tr className="bg-slate-50"><th className="p-2 border border-slate-200 text-left">খাত</th><th className="p-2 border border-slate-200 text-right">টাকা</th></tr></thead>
                <tbody>
                  {filteredExp.map(e => (
                    <tr key={e.id}><td className="p-2 border border-slate-100">{e.name}</td><td className="p-2 border border-slate-100 text-right font-bold text-rose-600">৳ {e.amount}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredDue.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">আজকের বাকি তালিকা</h3>
              <table className="w-full text-[11px] border-collapse">
                <thead><tr className="bg-slate-50"><th className="p-2 border border-slate-200 text-left">কাস্টমার</th><th className="p-2 border border-slate-200 text-left">মোবাইল</th><th className="p-2 border border-slate-200 text-right">টাকা</th></tr></thead>
                <tbody>
                  {filteredDue.map(d => (
                    <tr key={d.id}><td className="p-2 border border-slate-100">{d.customerName}</td><td className="p-2 border border-slate-100">{d.phone || '-'}</td><td className="p-2 border border-slate-100 text-right font-bold text-amber-600">৳ {d.amount}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-end">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Araf Telecom And Computer</div>
          <div className="text-center w-32 border-t border-slate-800 pt-2"><p className="text-[10px] font-bold">স্বাক্ষর ও সীল</p></div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
