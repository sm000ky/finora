import React, { useState } from 'react';
import { Download, Receipt, Sparkles, Check, Printer } from 'lucide-react';
import { exportReceiptExcel } from '../utils/excelGenerator';
import { terbilang, formatRupiah } from '../utils/terbilang';
import { playClick, playCoin, playSuccessChime } from '../utils/audio';
import { fireLittleBurst } from '../utils/confetti';

export default function ReceiptTool() {
  const [receiptNo, setReceiptNo] = useState('KW-2026/08/001');
  const [date, setDate] = useState('18 Agustus 2026');
  const [payer, setPayer] = useState('Bobby Chandra (CV Miau Boba)');
  const [amount, setAmount] = useState(15000000);
  const [purpose, setPurpose] = useState('Pembayaran 1 Unit Mesin Espresso dan Pelatihan Barista');
  const [receiver, setReceiver] = useState('CV Berkah Sentosa (Bagian Kasir)');

  const terbilangText = terbilang(amount);

  const handleExport = async () => {
    playClick();
    fireLittleBurst();
    await exportReceiptExcel({
      receiptNo,
      date,
      payer,
      amount,
      purpose,
      receiver,
      filename: `Kwitansi_${receiptNo.replace(/[\/\\:]/g, '_')}.xlsx`
    });
    playSuccessChime();
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 border-2 border-pastel-sky/40 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-pastel-sky/25">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧾</span>
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-slate-800 dark:text-purple-100">
                Pembuat Kwitansi & Tanda Terima Resmi
              </h2>
            </div>
            <p className="text-xs font-cute text-slate-600 dark:text-purple-300 mt-0.5">
              Dilengkapi konversi angka ke kata Terbilang Rupiah otomatis, stempel lunas, dan ekspor ke Excel siap print!
            </p>
          </div>

          <button
            onClick={handleExport}
            className="btn-bounce px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-heading font-bold flex items-center gap-2 shadow-md hover:brightness-110"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Kwitansi Excel (.xlsx)</span>
          </button>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-4">
          <div>
            <label className="block text-[11px] font-cute font-bold text-slate-600 dark:text-purple-300 mb-1">
              Nomor Kwitansi:
            </label>
            <input
              type="text"
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-pastel-sky"
            />
          </div>

          <div>
            <label className="block text-[11px] font-cute font-bold text-slate-600 dark:text-purple-300 mb-1">
              Tanggal Kwitansi:
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute font-bold focus:outline-none focus:ring-2 focus:ring-pastel-sky"
            />
          </div>

          <div>
            <label className="block text-[11px] font-cute font-bold text-slate-600 dark:text-purple-300 mb-1">
              Jumlah Uang (Rp):
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-pastel-sky"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-cute font-bold text-slate-600 dark:text-purple-300 mb-1">
              Sudah Terima Dari:
            </label>
            <input
              type="text"
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute font-bold focus:outline-none focus:ring-2 focus:ring-pastel-sky"
            />
          </div>

          <div>
            <label className="block text-[11px] font-cute font-bold text-slate-600 dark:text-purple-300 mb-1">
              Penerima / Bendahara:
            </label>
            <input
              type="text"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute font-bold focus:outline-none focus:ring-2 focus:ring-pastel-sky"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-cute font-bold text-slate-600 dark:text-purple-300 mb-1">
              Untuk Pembayaran:
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute font-bold focus:outline-none focus:ring-2 focus:ring-pastel-sky"
            />
          </div>
        </div>
      </div>

      {/* Realistic Receipt Sheet Preview */}
      <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#fffef8] dark:bg-slate-900 border-2 border-amber-200 dark:border-purple-900 shadow-xl relative overflow-hidden text-slate-800 dark:text-slate-100 font-cute">
        {/* Cute Stamp */}
        <div className="absolute top-4 right-4 border-2 border-emerald-500/70 text-emerald-600 dark:text-emerald-400 font-heading font-extrabold text-[11px] px-3 py-1 rounded-xl uppercase rotate-6 pointer-events-none tracking-widest shadow-sm">
          ✓ LUNAS / PAID
        </div>

        {/* Header */}
        <div className="text-center pb-4 border-b-2 border-dashed border-amber-300 dark:border-purple-800">
          <div className="text-xs font-heading font-bold text-pastel-rose uppercase tracking-widest">
            BUKTI PENERIMAAN KAS
          </div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-amber-300 mt-1">
            KWITANSI PEMBAYARAN
          </h3>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-purple-300 mt-3 font-mono">
            <span>No: <b>{receiptNo}</b></span>
            <span>Tanggal: <b>{date}</b></span>
          </div>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-3.5 text-xs sm:text-sm">
          <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-purple-300">Telah Terima Dari</span>
            <span className="col-span-2 font-bold text-slate-900 dark:text-purple-100">: {payer}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-purple-300">Banyaknya Uang</span>
            <span className="col-span-2 font-mono font-extrabold text-base text-emerald-600 dark:text-emerald-400">: {formatRupiah(amount)}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-purple-300">Terbilang</span>
            <span className="col-span-2 italic text-slate-700 dark:text-purple-200">: "{terbilangText}"</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-purple-300">Untuk Pembayaran</span>
            <span className="col-span-2 text-slate-800 dark:text-purple-100">: {purpose}</span>
          </div>
        </div>

        {/* Footer Signature */}
        <div className="pt-6 flex justify-end text-center text-xs">
          <div className="space-y-10">
            <div className="text-slate-500 dark:text-purple-300 font-cute">Penerima Uang:</div>
            <div className="font-bold underline text-slate-800 dark:text-purple-100 font-heading">
              {receiver}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
