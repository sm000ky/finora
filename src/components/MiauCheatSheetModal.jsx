import React from 'react';
import { X, BookOpen, Sparkles, Scale, CheckCircle } from 'lucide-react';
import { playClick } from '../utils/audio';

export default function MiauCheatSheetModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] rounded-3xl flex flex-col overflow-hidden bg-white/95 dark:bg-pastel-darkCard border-2 border-pastel-lavender/40 shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-pastel-lavender/25 dark:border-purple-900/40 flex items-center justify-between bg-pastel-cream/60 dark:bg-pastel-darkBg/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-pastel-lavender/25 flex items-center justify-center text-xl">
              🐱📖
            </div>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-slate-800 dark:text-purple-100">
                Buku Saku Akuntan Miau 🔍
              </h3>
              <p className="text-[11px] font-cute text-slate-500 dark:text-purple-300">
                Jurus sakti aturan debit/kredit, nomor akun, dan rumus pajak Indonesia!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-purple-950 flex items-center justify-center text-slate-500 hover:text-pastel-rose transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm font-cute">
          {/* Card 1: Saldo Normal */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-purple-900 shadow-sm space-y-2">
            <div className="flex items-center gap-2 font-heading font-bold text-pastel-rose text-sm">
              <Scale className="w-4 h-4" /> Saldo Normal Akun (Debit vs Kredit)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200">
                <b className="text-emerald-700 dark:text-emerald-300 block mb-1">Bertambah di DEBIT (+):</b>
                <ul className="space-y-0.5 text-slate-600 dark:text-purple-200 list-disc list-inside">
                  <li>Aset (Kas, Bank, Piutang, Peralatan)</li>
                  <li>Beban (Gaji, Listrik, Sewa, Bahan)</li>
                  <li>Prive (Pengambilan pribadi owner)</li>
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200">
                <b className="text-rose-700 dark:text-rose-300 block mb-1">Bertambah di KREDIT (+):</b>
                <ul className="space-y-0.5 text-slate-600 dark:text-purple-200 list-disc list-inside">
                  <li>Liabilitas (Utang Usaha, Utang Bank)</li>
                  <li>Ekuitas (Modal Pemilik)</li>
                  <li>Pendapatan (Penjualan, Jasa)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 2: Kode Akun Standar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-purple-900 shadow-sm space-y-2">
            <div className="font-heading font-bold text-slate-800 dark:text-purple-100 text-sm">
              🔢 Bagan Akun Standar (Chart of Accounts)
            </div>
            <p className="text-slate-600 dark:text-purple-200 leading-relaxed text-xs">
              • <b>101 Kas</b> / <b>102 Bank</b>: Uang tunai dan rekening bank.<br/>
              • <b>121 Peralatan</b>: Aset tahan lama &gt; 1 tahun (laptop, etalase, mesin).<br/>
              • <b>131 Perlengkapan</b>: Habis pakai (nota, cup, kantong plastik, sabun).<br/>
              • <b>301 Modal</b>: Setoran awal pemilik usaha.<br/>
              • <b>302 Prive</b>: Uang usaha yang ditarik untuk keperluan pribadi.<br/>
              • <b>401 Penjualan</b>: Omzet penjualan barang dagangan.<br/>
              • <b>501-506 Beban</b>: Biaya operasional rutin bulanan.
            </p>
          </div>

          {/* Card 3: Aturan Format Excel */}
          <div className="p-4 rounded-2xl bg-pastel-mint/15 dark:bg-slate-900 border border-pastel-mint/30 text-xs text-slate-700 dark:text-purple-200 space-y-1.5">
            <b className="text-pastel-darkMint dark:text-pastel-mint block font-heading">
              ✨ Standar Format Laporan Excel Resmi:
            </b>
            <p>
              1. <b>Indentasi Akun Kredit:</b> Akun di posisi kredit wajib ditulis menjorok ke kanan dengan spasi awal (misal: "    Modal" atau "    Kas").<br/>
              2. <b>Buku Besar 5-Kolom:</b> Tanggal | Keterangan | Debit | Kredit | Saldo Running kumulatif.<br/>
              3. <b>Neraca Saldo:</b> Wajib BALANCE seimbang antara total debit dan total kredit.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-pastel-lavender/20 dark:border-purple-900/40 bg-pastel-cream/40 dark:bg-pastel-darkBg/60 text-center">
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="px-8 py-2.5 rounded-2xl btn-bounce bg-gradient-to-r from-pastel-lavender to-pastel-deepLav text-white font-heading font-bold text-xs shadow-md"
          >
            Siap, Paham! Lanjut Bikin Excel ✨
          </button>
        </div>
      </div>
    </div>
  );
}
