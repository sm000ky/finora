import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ToolNavigation from './components/ToolNavigation';
import JournalStudio from './components/JournalStudio';
import AiTransactionTool from './components/AiTransactionTool';
import PayrollTool from './components/PayrollTool';
import CashflowTool from './components/CashflowTool';
import ReceiptTool from './components/ReceiptTool';
import PphFinalTool from './components/PphFinalTool';
import MiauCheatSheetModal from './components/MiauCheatSheetModal';
import { isSoundEnabled, setSoundEnabled } from './utils/audio';

export default function App() {
  const [activeTool, setActiveTool] = useState('journal_studio');
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('miau_dark') === 'true';
    } catch {
      return false;
    }
  });
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [aiGeneratedTransactions, setAiGeneratedTransactions] = useState(null);

  // Sync Dark Mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      localStorage.setItem('miau_dark', String(darkMode));
    } catch {}
  }, [darkMode]);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  // Called when AI extracts transactions and user clicks "Terapkan ke Studio"
  const handleApplyAiTransactions = (rows) => {
    setAiGeneratedTransactions(rows);
    setActiveTool('journal_studio');
  };

  return (
    <div className="min-h-screen bg-[#fdf7fa] dark:bg-pastel-darkBg text-slate-800 dark:text-purple-100 transition-colors flex flex-col font-body">
      {/* Header */}
      <Header
        soundOn={soundOn}
        onToggleSound={handleToggleSound}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(!darkMode)}
      />

      {/* Tool Navigation Dock (No horizontal scrolling!) */}
      <ToolNavigation
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
      />

      {/* Active Screen Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 pb-12">
        {activeTool === 'journal_studio' && (
          <JournalStudio
            initialTransactions={aiGeneratedTransactions}
            onOpenAiTool={() => setActiveTool('ai_smart')}
          />
        )}

        {activeTool === 'ai_smart' && (
          <AiTransactionTool
            onApplyToJournal={handleApplyAiTransactions}
          />
        )}

        {activeTool === 'payroll_pph21' && <PayrollTool />}

        {activeTool === 'cashflow' && <CashflowTool />}

        {activeTool === 'receipt_maker' && <ReceiptTool />}

        {activeTool === 'pph_final' && <PphFinalTool />}
      </main>

      {/* Footer */}
      <footer className="border-t border-pastel-pink/20 dark:border-purple-900/40 bg-white/70 dark:bg-pastel-darkCard/70 py-4 text-center text-xs font-cute text-slate-500 dark:text-purple-300">
        <p>
          Miau Excel Studio: Akuntan Cantik & Laporan Keuangan Otomatis • Dibuat dengan 💗 untuk cewek tersayang
        </p>
      </footer>

      {/* Accounting Cheat Sheet Modal */}
      <MiauCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />
    </div>
  );
}
