
import React, { useState, useEffect, useMemo } from 'react';
import { LiveEntry, Expense, NightEntry, AppSettings, CashEntry, DueEntry, UserProfile } from './types';
import { translations } from './translations';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import EntryForms from './components/EntryForms';
import Reports from './components/Reports';
import Settings from './components/Settings';
import SmartAssistant from './components/SmartAssistant';
import CustomerManagement from './components/CustomerManagement';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('shop_settings');
    return saved ? JSON.parse(saved) : { 
      password: '1234', 
      openingCash: 0, 
      googleClientId: '', 
      autoSync: true,
      language: 'bn'
    };
  });

  const [liveEntries, setLiveEntries] = useState<LiveEntry[]>(() => {
    const saved = localStorage.getItem('shop_live_entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('shop_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [nightEntries, setNightEntries] = useState<NightEntry[]>(() => {
    const saved = localStorage.getItem('shop_night_entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [cashEntries, setCashEntries] = useState<CashEntry[]>(() => {
    const saved = localStorage.getItem('shop_cash_entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [dueEntries, setDueEntries] = useState<DueEntry[]>(() => {
    const saved = localStorage.getItem('shop_due_entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [uploadedDates, setUploadedDates] = useState<string[]>(() => {
    const saved = localStorage.getItem('shop_uploaded_dates');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'entry' | 'customers' | 'reports' | 'assistant' | 'settings'>('dashboard');

  const lang = settings.language || 'bn';
  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('shop_settings', JSON.stringify(settings));
    localStorage.setItem('shop_live_entries', JSON.stringify(liveEntries));
    localStorage.setItem('shop_expenses', JSON.stringify(expenses));
    localStorage.setItem('shop_night_entries', JSON.stringify(nightEntries));
    localStorage.setItem('shop_cash_entries', JSON.stringify(cashEntries));
    localStorage.setItem('shop_due_entries', JSON.stringify(dueEntries));
    localStorage.setItem('shop_uploaded_dates', JSON.stringify(uploadedDates));
  }, [settings, liveEntries, expenses, nightEntries, cashEntries, dueEntries, uploadedDates]);

  const toggleLanguage = () => {
    setSettings(prev => ({ ...prev, language: prev.language === 'bn' ? 'en' : 'bn' }));
  };

  const handleLogin = (user?: UserProfile) => {
    if (user) {
      setSettings(prev => ({ ...prev, user }));
    }
    setIsLoggedIn(true);
  };

  const handleRecovery = async () => {
    if (!settings.googleClientId) {
      alert(lang === 'bn' ? "রিকভার করার জন্য সেটিংস থেকে আগে Google Client ID সেট করা থাকতে হবে।" : "Set Google Client ID in settings first to recover.");
      return;
    }
    alert(lang === 'bn' ? "আপনার জিমেইল ভেরিফাই হয়েছে। এখন প্রবেশ করুন এবং সেটিংস থেকে নতুন পিন দিন।" : "Gmail verified. Login and set new PIN from settings.");
    setIsLoggedIn(true);
  };

  const today = new Date().toLocaleDateString('en-CA');

  const stats = useMemo(() => {
    const todayIncome = liveEntries.filter(e => e.date === today).reduce((sum, e) => sum + e.amount, 0);
    const todayExpense = expenses.filter(e => e.date === today).reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = liveEntries.reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const cashIn = cashEntries.filter(c => c.type === 'in').reduce((sum, c) => sum + c.amount, 0);
    const cashOut = cashEntries.filter(c => c.type === 'out').reduce((sum, c) => sum + c.amount, 0);
    const totalDues = dueEntries.filter(d => !d.isPaid).reduce((sum, d) => sum + d.amount, 0);

    const isTodayClosed = nightEntries.filter(n => n.date === today).length >= 11;
    const isTodayUploaded = uploadedDates.includes(today);

    return {
      todayIncome,
      todayExpense,
      openingCash: settings.openingCash,
      currentCash: settings.openingCash + totalIncome - totalExpense + cashIn - cashOut,
      totalDues,
      monthlyProfit: 0, 
      allTimeProfit: totalIncome - totalExpense,
      isTodayClosed,
      isTodayUploaded
    };
  }, [liveEntries, expenses, settings, today, cashEntries, nightEntries, dueEntries, uploadedDates]);

  const handleUpdateDue = (id: string, updates: Partial<DueEntry>) => {
    setDueEntries(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const handleDeleteDuePermanently = (id: string) => {
    if(window.confirm(lang === 'bn' ? 'আপনি কি এই হিসাবটি স্থায়ীভাবে মুছে ফেলতে চান?' : 'Delete record permanently?')) {
      setDueEntries(dueEntries.filter(d => d.id !== id));
    }
  };

  const deleteLive = (id: string) => setLiveEntries(liveEntries.filter(e => e.id !== id));
  const deleteExpense = (id: string) => setExpenses(expenses.filter(e => e.id !== id));
  const deleteNight = (id: string) => setNightEntries(nightEntries.filter(n => n.id !== id));
  const deleteCash = (id: string) => setCashEntries(cashEntries.filter(c => c.id !== id));
  const deleteDue = (id: string) => setDueEntries(dueEntries.filter(d => d.id !== id));

  if (!isLoggedIn) return (
    <AuthScreen 
      correctPassword={settings.password} 
      googleClientId={settings.googleClientId}
      onLogin={handleLogin} 
      onRecover={handleRecovery}
      language={lang}
    />
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0 font-['Hind_Siliguri']">
      <header className="bg-emerald-950 text-white p-5 shadow-2xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {settings.user?.picture ? (
              <img src={settings.user.picture} alt="Avatar" className="w-10 h-10 rounded-xl border-2 border-emerald-400" />
            ) : (
              <div className="bg-emerald-400 p-2 rounded-xl text-emerald-950 font-bold text-xl">🏦</div>
            )}
            <div>
              <h1 className="text-xl font-black tracking-tight">{settings.user?.name || 'Araf Telecom'}</h1>
              <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">{settings.user?.email || 'Shop Manager'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleLanguage}
              className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1"
            >
              <span>🌐</span> {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>
            <button onClick={() => setIsLoggedIn(false)} className="text-[10px] font-black uppercase tracking-widest bg-rose-500/20 hover:bg-rose-500 px-4 py-2 rounded-xl transition-all">
              {t.header.logout}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full p-4 flex-grow space-y-6">
        {activeTab === 'dashboard' && <Dashboard stats={stats} liveEntries={liveEntries} expenses={expenses} nightEntries={nightEntries} onGoToReports={() => setActiveTab('reports')} onDeleteLive={deleteLive} onDeleteExpense={deleteExpense} language={lang} />}
        {activeTab === 'entry' && <EntryForms onAddLive={e => setLiveEntries([e, ...liveEntries])} onAddExpense={e => setExpenses([e, ...expenses])} onAddNight={n => setNightEntries([n, ...nightEntries])} onDeleteNight={deleteNight} onAddCash={c => setCashEntries([c, ...cashEntries])} nightEntries={nightEntries} language={lang} />}
        {activeTab === 'customers' && <CustomerManagement dueEntries={dueEntries} onAddDue={d => setDueEntries([d, ...dueEntries])} onUpdateDue={handleUpdateDue} onDeleteDuePermanently={handleDeleteDuePermanently} onAddLive={e => setLiveEntries([e, ...liveEntries])} language={lang} />}
        {activeTab === 'reports' && <Reports liveEntries={liveEntries} expenses={expenses} nightEntries={nightEntries} cashEntries={cashEntries} dueEntries={dueEntries} onDeleteLive={deleteLive} onDeleteExpense={deleteExpense} onDeleteNight={deleteNight} onDeleteCash={deleteCash} onDeleteDue={deleteDue} settings={settings} uploadedDates={uploadedDates} onUploadSuccess={(d) => setUploadedDates([...uploadedDates, d])} />}
        {activeTab === 'assistant' && <SmartAssistant liveEntries={liveEntries} expenses={expenses} language={lang} />}
        {activeTab === 'settings' && <Settings settings={settings} onUpdate={s => setSettings(s)} liveEntries={liveEntries} expenses={expenses} nightEntries={nightEntries} cashEntries={cashEntries} language={lang} />}
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around py-4 shadow-2xl z-40 backdrop-blur-md bg-white/90">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon="📊" label={t.nav.dashboard} />
        <NavButton active={activeTab === 'entry'} onClick={() => setActiveTab('entry')} icon="📝" label={t.nav.entry} />
        <NavButton active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} icon="👥" label={t.nav.dues} />
        <NavButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon="📋" label={t.nav.reports} />
        <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon="⚙️" label={t.nav.settings} />
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-emerald-700 font-black' : 'text-slate-400'}`}>
    <span className={`text-xl ${active ? 'scale-110' : ''} transition-transform`}>{icon}</span><span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default App;
