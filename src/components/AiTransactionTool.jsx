import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, RotateCcw, FileText, Zap } from 'lucide-react';
import { parseTextLocally, parseWithAI } from '../utils/aiTransactionParser';
import { playClick, playCoin, playSuccessChime } from '../utils/audio';
import { fireLittleBurst } from '../utils/confetti';
import { formatRupiah } from '../utils/terbilang';

const SAMPLES = [
  {
    title: 'Catatan Depot Air Isi Ulang',
    text: `01-Jan setor modal awal 60jt tunai
02-Jan beli peralatan toko 16jt tunai
03-Jan beli motor operasional 2jt
04-Jan beli galon air 2.4jt
05-Jan beli perlengkapan 190rb
31-Jan omzet penjualan air 3.080.000
31-Jan bayar air tangki 500rb
31-Jan bayar listrik 100rb
31-Jan bayar bensin 100rb
31-Jan owner ambil prive 2.380.000`
  },
  {
    title: 'Catatan Kafe Boba & Bakery',
    text: `01-Aug modal tunai pemilik 25jt
02-Aug sewa ruko 1 bulan 3jt
05-Aug beli bahan baku sirup dan boba 4.2jt
15-Aug omzet penjualan boba 11.5jt
25-Aug bayar gaji barista 3.5jt
31-Aug omzet penjualan 13.8jt
31-Aug bayar wifi dan listrik 650rb`
  },
  {
    title: 'Catatan Olshop Skincare',
    text: `01-Sep modal awal bank 15jt
03-Sep beli packaging dan bubble wrap 800rb
05-Sep beli stok serum dan sunscreen 6.5jt
08-Sep bayar endorsement selebgram 1.5jt
15-Sep omzet penjualan shopee 12.4jt
28-Sep omzet penjualan tiktok 9.6jt`
  }
];

export default function AiTransactionTool({ onApplyToJournal }) {
  const [inputText, setInputText] = useState(SAMPLES[0].text);
  const [parsedRows, setParsedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useLocalOnly, setUseLocalOnly] = useState(false);

  const handleParse = async () => {
    if (!inputText.trim()) return;
    playClick();
    setLoading(true);

    let rows = [];
    if (useLocalOnly) {
      rows = parseTextLocally(inputText);
    } else {
      rows = await parseWithAI(inputText);
    }

    setParsedRows(rows);
    setLoading(false);
    playSuccessChime();
    fireLittleBurst();
  };

  const handleApply = () => {
    if (parsedRows.length === 0) return;
    playClick();
    fireLittleBurst();
    onApplyToJournal(parsedRows);
  };

  const totDebit = parsedRows.reduce((s, x) => s + (Number(x.debit) || 0), 0);
  const totCredit = parsedRows.reduce((s, x) => s + (Number(x.credit) || 0), 0);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Banner */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 border-2 border-pastel-lavender/40 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-pastel-lavender/25">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-wiggle">🤖</span>
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-slate-800 dark:text-purple-100">
                AI Smart Transaction Parser
              </h2>
            </div>
            <p className="text-xs font-cute text-slate-600 dark:text-purple-300">
              Ketik atau paste catatan transaksi santai sehari-hari dalam bahasa Indonesia, AI akan mengubahnya jadi baris Jurnal Umum berpasangan yang balance!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-cute text-slate-500 dark:text-purple-300">
              Mode:
            </span>
            <button
              onClick={() => setUseLocalOnly(!useLocalOnly)}
              className={`px-3 py-1 rounded-xl text-xs font-cute font-bold border transition-all ${
                useLocalOnly
                  ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-pastel-lavender/25 text-pastel-deepLav border-pastel-lavender dark:bg-purple-950 dark:text-purple-300'
              }`}
            >
              {useLocalOnly ? '⚡ Smart Heuristic (Offline)' : '✨ AI Powered (Auto-fallback)'}
            </button>
          </div>
        </div>

        {/* Sample Chips */}
        <div className="pt-4 space-y-2">
          <span className="text-xs font-cute font-bold text-slate-500 dark:text-purple-300">
            Coba Contoh Catatan:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playClick();
                  setInputText(s.text);
                }}
                className="btn-bounce px-3 py-1 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute font-bold text-slate-700 dark:text-purple-200 hover:border-pastel-lavender shadow-sm"
              >
                <span>💡 {s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="mt-4">
          <textarea
            rows={8}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tulis transaksi di sini, misal:&#10;1 Jan setor modal awal 50jt tunai&#10;2 Jan beli laptop kantor 12jt&#10;15 Jan omzet penjualan 8.5jt"
            className="w-full p-4 rounded-2xl bg-white dark:bg-pastel-darkBg border-2 border-pastel-lavender/30 text-xs font-mono text-slate-800 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-pastel-lavender shadow-inner leading-relaxed"
          />
        </div>

        {/* Action Button */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] font-cute text-slate-400">
            💡 Tips: Tulis nominal bebas seperti "60jt", "16 juta", "500rb", atau "190.000".
          </span>

          <button
            onClick={handleParse}
            disabled={loading}
            className="w-full sm:w-auto btn-bounce px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pastel-lavender via-pastel-deepLav to-purple-600 text-white font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:brightness-110 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'AI Sedang Mengekstrak...' : 'Ekstrak Jurnal Otomatis ✨'}</span>
          </button>
        </div>
      </div>

      {/* Result Preview */}
      {parsedRows.length > 0 && (
        <div className="glass-card rounded-3xl p-5 border-2 border-pastel-mint/40 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-pastel-mint/25 text-pastel-darkMint dark:text-pastel-mint text-xs font-cute font-extrabold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Berhasil Dikonversi ke {parsedRows.length} Entri Jurnal!
              </div>
              <h3 className="font-heading font-bold text-base text-slate-800 dark:text-purple-100 mt-1">
                Hasil Parsing Jurnal Berpasangan
              </h3>
            </div>

            <button
              onClick={handleApply}
              className="btn-bounce px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-heading font-bold text-xs flex items-center gap-2 shadow-md hover:brightness-110"
            >
              <span>Terapkan ke Studio Jurnal & Unduh Excel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mini Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-purple-900/60 bg-white dark:bg-pastel-darkBg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-purple-950/40 text-slate-600 dark:text-purple-300 font-heading">
                <tr>
                  <th className="p-2.5 w-24">Tanggal</th>
                  <th className="p-2.5">Keterangan Akun</th>
                  <th className="p-2.5 w-16 text-center">Ref</th>
                  <th className="p-2.5 w-32 text-right">Debit</th>
                  <th className="p-2.5 w-32 text-right">Kredit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30 font-cute">
                {parsedRows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-pastel-pink/5">
                    <td className="p-2 text-slate-400 font-mono text-[11px]">{r.date}</td>
                    <td className="p-2 font-bold text-slate-700 dark:text-purple-200">{r.account}</td>
                    <td className="p-2 text-center text-slate-400 font-mono">{r.ref}</td>
                    <td className="p-2 text-right font-mono text-emerald-600 dark:text-emerald-400">
                      {r.debit > 0 ? formatRupiah(r.debit) : '-'}
                    </td>
                    <td className="p-2 text-right font-mono text-rose-600 dark:text-rose-400">
                      {r.credit > 0 ? formatRupiah(r.credit) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-heading font-bold text-xs">
                <tr>
                  <td colSpan={3} className="p-2.5 text-center">Total Balance</td>
                  <td className="p-2.5 text-right text-emerald-600">{formatRupiah(totDebit)}</td>
                  <td className="p-2.5 text-right text-rose-600">{formatRupiah(totCredit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
