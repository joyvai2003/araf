
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

  const filteredLive = liveEntries.filter(e => e.date === filterDate);
  const filteredExp = expenses.filter(e => e.date === filterDate);
  const filteredNight = nightEntries.filter(n => n.date === filterDate);
  const filteredDue = dueEntries.filter(d => d.date === filterDate);

  const totalIncome = filteredLive.reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = filteredExp.reduce((sum, e) => sum + e.amount, 0);
  const digitalTotal = filteredNight.reduce((sum, n) => sum + n.amount, 0);
  const totalDueToday = filteredDue.reduce((sum, d) => sum + d.amount, 0);

  const isSynced = uploadedDates.includes(filterDate);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const opt = {
      margin: 5,
      filename: `Report_ArafTelecom_${filterDate}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
      // @ts-ignore
      await window.html2pdf().from(element).set(opt).save();
    } catch (e) {
      alert("PDF ডাউনলোড করতে সমস্যা হয়েছে।");
    }
  };

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
          filename: `Business_Report_${filterDate}.pdf`,
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

  const getLiveLabelEnglish = (type: string) => {
    switch (type) {
      case 'photocopy': return 'Photocopy';
      case 'color_print': return 'Color Print';
      case 'photo_print': return 'Photo Print';
      case 'online_apply': return 'Online Application';
      case 'due_collection': return 'Due Collection';
      case 'others': return 'Other Income';
      default: return type;
    }
  };

  const getNightLabelEnglish = (type: NightCategory) => {
    switch (type) {
      case 'bkash_agent': return 'bKash Agent';
      case 'nagad_agent': return 'Nagad Agent';
      case 'bkash_p1': return 'bKash Personal 1';
      case 'bkash_p2': return 'bKash Personal 2';
      case 'nagad_p1': return 'Nagad Personal 1';
      case 'nagad_p2': return 'Nagad Personal 2';
      case 'rocket': return 'Rocket';
      case 'gp_load': return 'GP Topup';
      case 'robi_load': return 'Robi Topup';
      case 'minute_card': return 'Minute Card';
      case 'others': return 'Other Digital';
      default: return type;
    }
  };

  const confirmDelete = (type: 'live' | 'expense' | 'night' | 'due', id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      if (type === 'live') onDeleteLive(id);
      if (type === 'expense') onDeleteExpense(id);
      if (type === 'night') onDeleteNight(id);
      if (type === 'due') onDeleteDue(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 no-print flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-slate-800">Report Archive</h2>
          {isSynced && <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-full animate-pulse">✅ SYNCED</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownloadPDF} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md">
            📥 Download PDF
          </button>
          <button onClick={handleSaveToDrive} disabled={uploadStatus !== 'idle'} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${uploadStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
            {uploadStatus === 'idle' ? '📤 Cloud Backup' : uploadStatus === 'generating' ? '⏳ Generating PDF' : '🚀 Uploading...'}
          </button>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none" />
        </div>
      </div>

      <div ref={reportRef} className="bg-white p-10 rounded-[1rem] shadow-sm border border-slate-100 pdf-container font-sans text-slate-900">
        <div className="border-b-4 border-slate-900 pb-6 mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight mb-1">Araf Telecom & Computer</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] mb-4">Official Business Statement</p>
          <div className="flex justify-center gap-8 text-xs font-bold text-slate-600">
            <span>Date: {new Date(filterDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>Report ID: #AT-{filterDate.replace(/-/g, '')}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-10">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
            <p className="text-[10px] text-slate-400 font-black mb-1 uppercase tracking-widest">Total Income</p>
            <p className="text-xl font-black text-emerald-600">৳ {totalIncome.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
            <p className="text-[10px] text-slate-400 font-black mb-1 uppercase tracking-widest">Total Expense</p>
            <p className="text-xl font-black text-rose-600">৳ {totalExpense.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
            <p className="text-[10px] text-slate-400 font-black mb-1 uppercase tracking-widest">Digital Bal.</p>
            <p className="text-xl font-black text-indigo-600">৳ {digitalTotal.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
            <p className="text-[10px] text-slate-400 font-black mb-1 uppercase tracking-widest">New Dues</p>
            <p className="text-xl font-black text-amber-600">৳ {totalDueToday.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Income Breakdown</h3>
            </div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-3 text-left font-black uppercase tracking-widest">Description</th>
                  <th className="p-3 text-right font-black uppercase tracking-widest">Amount (BDT)</th>
                  <th className="p-3 text-center no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLive.map(e => (
                  <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-medium">{getLiveLabelEnglish(e.type)}</td>
                    <td className="p-3 text-right font-black">৳ {e.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-center no-print">
                      <button onClick={() => confirmDelete('live', e.id)} className="text-rose-400 hover:text-rose-600 transition-colors">🗑️</button>
                    </td>
                  </tr>
                ))}
                {filteredLive.length === 0 && <tr><td colSpan={3} className="p-10 text-center text-slate-300 italic">No income entries found for this date.</td></tr>}
              </tbody>
            </table>
          </section>

          <div className="grid grid-cols-2 gap-10">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Night Summary</h3>
              </div>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600">
                    <th className="p-3 text-left font-black uppercase tracking-widest">Account</th>
                    <th className="p-3 text-right font-black uppercase tracking-widest">Balance</th>
                    <th className="p-3 text-center no-print">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNight.map(n => (
                    <tr key={n.id} className="border-b border-slate-100">
                      <td className="p-3 font-medium">{getNightLabelEnglish(n.type)}</td>
                      <td className="p-3 text-right font-black text-indigo-700">৳ {n.amount.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-center no-print">
                        <button onClick={() => confirmDelete('night', n.id)} className="text-rose-400 transition-colors">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Expense Details</h3>
              </div>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600">
                    <th className="p-3 text-left font-black uppercase tracking-widest">Item</th>
                    <th className="p-3 text-right font-black uppercase tracking-widest">Cost</th>
                    <th className="p-3 text-center no-print">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExp.map(e => (
                    <tr key={e.id} className="border-b border-slate-100">
                      <td className="p-3 font-medium">{e.name}</td>
                      <td className="p-3 text-right font-black text-rose-600">৳ {e.amount.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-center no-print">
                        <button onClick={() => confirmDelete('expense', e.id)} className="text-rose-400 transition-colors">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>

          {filteredDue.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Credit (Due) Records</h3>
              </div>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600">
                    <th className="p-3 text-left font-black uppercase tracking-widest">Customer</th>
                    <th className="p-3 text-left font-black uppercase tracking-widest">Phone</th>
                    <th className="p-3 text-right font-black uppercase tracking-widest">Amount</th>
                    <th className="p-3 text-center no-print">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDue.map(d => (
                    <tr key={d.id} className="border-b border-slate-100">
                      <td className="p-3 font-black">{d.customerName}</td>
                      <td className="p-3 text-slate-500">{d.phone || 'N/A'}</td>
                      <td className="p-3 text-right font-black text-amber-700">৳ {d.amount.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-center no-print">
                        <button onClick={() => confirmDelete('due', d.id)} className="text-rose-400 transition-colors">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>

        <div className="mt-20 pt-10 border-t-2 border-slate-100 flex justify-between items-end">
          <div className="space-y-2">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Statement Generated Digitally</p>
            <p className="text-[10px] text-slate-500 font-bold">Araf Telecom & Computer Service</p>
          </div>
          <div className="text-center w-48 border-t-2 border-slate-900 pt-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
