import React from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Banknote, 
  BookOpen, 
  Receipt, 
  Calculator, 
  HelpCircle 
} from 'lucide-react';
import { playClick } from '../utils/audio';

export const TOOLS = [
  {
    id: 'journal_studio',
    title: 'Jurnal & Neraca',
    subtitle: '1-Sheet Depot 3S & Multi-Sheet',
    icon: '📊',
    lucide: FileSpreadsheet,
    badge: 'Utama',
    colorFrom: 'from-pink-400',
    colorTo: 'to-rose-400',
    bgLight: 'bg-pastel-pink/15',
    borderColor: 'border-pastel-pink/40',
    textColor: 'text-pastel-rose'
  },
  {
    id: 'ai_smart',
    title: 'AI Smart Parser',
    subtitle: 'Ketik Bebas → Auto Jurnal',
    icon: '🤖',
    lucide: Sparkles,
    badge: 'AI Powered',
    colorFrom: 'from-purple-400',
    colorTo: 'to-indigo-500',
    bgLight: 'bg-pastel-lavender/15',
    borderColor: 'border-pastel-lavender/40',
    textColor: 'text-pastel-deepLav'
  },
  {
    id: 'payroll_pph21',
    title: 'Slip Gaji & PPh 21',
    subtitle: 'Skema TER 2024 & BPJS',
    icon: '💵',
    lucide: Banknote,
    badge: 'TER 2024',
    colorFrom: 'from-emerald-400',
    colorTo: 'to-teal-500',
    bgLight: 'bg-pastel-mint/15',
    borderColor: 'border-pastel-mint/40',
    textColor: 'text-pastel-darkMint'
  },
  {
    id: 'cashflow',
    title: 'Buku Kas Harian',
    subtitle: 'Arus Kas Masuk & Keluar',
    icon: '📖',
    lucide: BookOpen,
    badge: 'UMKM',
    colorFrom: 'from-amber-400',
    colorTo: 'to-orange-400',
    bgLight: 'bg-pastel-peach/15',
    borderColor: 'border-pastel-peach/40',
    textColor: 'text-amber-600'
  },
  {
    id: 'receipt_maker',
    title: 'Kwitansi & Faktur',
    subtitle: 'Terbilang Otomatis & Cetak',
    icon: '🧾',
    lucide: Receipt,
    badge: 'Siap Cetak',
    colorFrom: 'from-sky-400',
    colorTo: 'to-blue-500',
    bgLight: 'bg-pastel-sky/15',
    borderColor: 'border-pastel-sky/40',
    textColor: 'text-sky-600'
  },
  {
    id: 'pph_final',
    title: 'PPh Final 0.5%',
    subtitle: 'PP 55/2022 & Bebas 500Jt',
    icon: '🧮',
    lucide: Calculator,
    badge: 'Pajak',
    colorFrom: 'from-violet-400',
    colorTo: 'to-fuchsia-500',
    bgLight: 'bg-purple-100 dark:bg-purple-950/30',
    borderColor: 'border-purple-300 dark:border-purple-800',
    textColor: 'text-purple-600 dark:text-purple-300'
  }
];

export default function ToolNavigation({ activeTool, onSelectTool, onOpenCheatSheet }) {
  return (
    <div className="max-w-6xl mx-auto px-4 pt-5 pb-2">
      {/* Visual Menu Grid: No horizontal scroll! Clean multi-column wrapping */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        {TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;
          const IconComp = tool.lucide;

          return (
            <button
              key={tool.id}
              onClick={() => {
                playClick();
                onSelectTool(tool.id);
              }}
              className={`p-3 rounded-2xl sm:rounded-3xl text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between group ${
                isActive
                  ? 'bg-white dark:bg-pastel-darkCard shadow-lg ring-2 ring-pastel-rose dark:ring-pastel-pink scale-[1.02]'
                  : 'bg-white/75 dark:bg-pastel-darkCard/60 hover:bg-white dark:hover:bg-pastel-darkCard border border-slate-200/80 dark:border-purple-900/40 hover:border-pastel-pink/50 hover:shadow-md'
              }`}
            >
              {/* Top Row: Icon & Badge */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm transition-transform group-hover:scale-110 ${
                    isActive ? 'bg-gradient-to-tr text-white ' + tool.colorFrom + ' ' + tool.colorTo : tool.bgLight
                  }`}
                >
                  {tool.icon}
                </div>
                <span className={`text-[9px] font-cute font-extrabold px-2 py-0.5 rounded-full ${tool.bgLight} ${tool.textColor}`}>
                  {tool.badge}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className={`font-heading font-bold text-xs sm:text-sm leading-tight transition-colors ${
                  isActive ? 'text-pastel-rose dark:text-pastel-pink' : 'text-slate-800 dark:text-purple-100 group-hover:text-pastel-rose'
                }`}>
                  {tool.title}
                </h3>
                <p className="text-[10px] font-cute text-slate-500 dark:text-purple-300/80 mt-0.5 line-clamp-1">
                  {tool.subtitle}
                </p>
              </div>

              {/* Active Underline Indicator */}
              {isActive && (
                <div className={`absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r ${tool.colorFrom} ${tool.colorTo}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Quick CheatSheet Pill Button */}
      <div className="mt-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-cute text-slate-500 dark:text-purple-300">
          <span>✨</span>
          <span>Pilih menu di atas untuk mulai membuat laporan Excel otomatis</span>
        </div>

        <button
          onClick={() => {
            playClick();
            onOpenCheatSheet();
          }}
          className="btn-bounce inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-pastel-lavender/25 dark:bg-purple-950 text-pastel-deepLav dark:text-purple-300 text-xs font-cute font-bold hover:bg-pastel-lavender/40 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Buku Saku Akuntan</span>
        </button>
      </div>
    </div>
  );
}
