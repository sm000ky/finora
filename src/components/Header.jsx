import React from 'react';
import { Volume2, VolumeX, Moon, Sun, Sparkles, Heart } from 'lucide-react';
import { playClick } from '../utils/audio';

export default function Header({
  soundOn,
  onToggleSound,
  darkMode,
  onToggleDark,
  themeColor,
  onChangeTheme
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-pastel-darkCard/90 backdrop-blur-md border-b border-pastel-pink/20 dark:border-pastel-darkBorder transition-colors shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand & Mascot */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-pastel-pink via-pastel-lavender to-pastel-mint flex items-center justify-center text-2xl sm:text-3xl shadow-md animate-float">
              🐱
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-pastel-mint ring-2 ring-white">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-heading font-extrabold text-lg sm:text-xl text-slate-800 dark:text-purple-100 tracking-tight leading-none">
                MIAU EXCEL STUDIO
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-cute font-extrabold bg-pastel-pink/20 text-pastel-rose dark:bg-pink-950/60">
                <Sparkles className="w-3 h-3" /> Auto-Engine
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-cute text-slate-500 dark:text-purple-300/80 mt-0.5">
              Akuntan Cantik, Jurnal Cerdas & Laporan Excel Otomatis ✨
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Sweet Love Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-pastel-cream dark:bg-purple-950/40 border border-pastel-pink/30 text-xs font-cute font-bold text-pastel-rose">
            <Heart className="w-3.5 h-3.5 fill-pastel-rose animate-pulse" />
            <span>Spesial Buat Kamu 💕</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              playClick();
              onToggleSound();
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900/60 flex items-center justify-center text-slate-600 dark:text-purple-300 hover:text-pastel-rose transition-colors btn-bounce shadow-sm"
            title={soundOn ? 'Matikan Suara Efek' : 'Nyalakan Suara Efek'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-pastel-rose" /> : <VolumeX className="w-4 h-4 opacity-50" />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => {
              playClick();
              onToggleDark();
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900/60 flex items-center justify-center text-slate-600 dark:text-purple-300 hover:text-amber-500 transition-colors btn-bounce shadow-sm"
            title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-pastel-deepLav" />}
          </button>
        </div>
      </div>
    </header>
  );
}
