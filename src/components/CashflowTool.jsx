import React, { useState } from 'react';
import { Plus, Trash2, Download, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import ExcelJS from 'exceljs';
import { playClick, playCoin, playSuccessChime } from '../utils/audio';
import { fireLittleBurst } from '../utils/confetti';
import { formatRupiah } from '../utils/terbilang';

const INITIAL_CASH = [
  { id: '1', date: '01-Aug', desc: 'Saldo Awal Bulan Kas Kasir', category: 'Modal', type: 'in', amount: 5000000 },
  { id: '2', date: '02-Aug', desc: 'Penjualan Minuman & Snack', category: 'Penjualan', type: 'in', amount: 1850000 },
  { id: '3', date: '03-Aug', desc: 'Beli Gas Elpiji & Es Batu', category: 'Operasional', type: 'out', amount: 240000 },
  { id: '4', date: '04-Aug', desc: 'Penjualan Minuman Dine-in', category: 'Penjualan', type: 'in', amount: 2100000 },
  { id: '5', date: '05-Aug', desc: 'Beli Cup & Sedotan Boba', category: 'Bahan Baku', type: 'out', amount: 450000 },
  { id: '6', date: '06-Aug', desc: 'Bayar Tagihan Listrik Toko', category: 'Utilitas', type: 'out', amount: 350000 }
];

export default function CashflowTool() {
  const [cashEntries, setCashEntries] = useState(INITIAL_CASH);
  const [storeName, setStoreName] = useState('Kafe Boba Miau');

  // New entry form
  const [newDate, setNewDate] = useState('07-Aug');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Penjualan');
  const [newType, setNewType] = useState('in');
  const [newAmount, setNewAmount] = useState(500000);

  // Running balance
  let running = 0;
  const processed = cashEntries.map((item) => {
    if (item.type === 'in') running += Number(item.amount) || 0;
    else running -= Number(item.amount) || 0;
    return { ...item, runningBalance: running };
  });

  const totalIn = cashEntries.filter((x) => x.type === 'in').reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const totalOut = cashEntries.filter((x) => x.type === 'out').reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const netCash = totalIn - totalOut;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newDesc.trim() || Number(newAmount) <= 0) return;
    playCoin();
    setCashEntries([
      ...cashEntries,
      {
        id: String(Date.now()),
        date: newDate,
        desc: newDesc,
        category: newCategory,
        type: newType,
        amount: Number(newAmount)
      }
    ]);
    setNewDesc('');
    fireLittleBurst();
  };

  const handleDelete = (id) => {
    playClick();
    setCashEntries(cashEntries.filter((x) => x.id !== id));
  };

  // Export Excel
  const handleExport = async () => {
    playClick();
    fireLittleBurst();

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Buku Kas Harian', { views: [{ showGridLines: true }] });

    ws.mergeCells('A1:F1');
    ws.getCell('A1').value = `${storeName} - BUKU KAS HARIAN UMKM`;
    ws.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFB570' } };
    ws.getCell('A1').alignment = { horizontal: 'center' };

    const headers = ['Tanggal', 'Keterangan', 'Kategori', 'Kas Masuk (Debit)', 'Kas Keluar (Kredit)', 'Saldo Kas'];
    headers.forEach((h, i) => {
      const c = ws.getRow(3).getCell(i + 1);
      c.value = h;
      c.font = { bold: true };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3D6' } };
      c.alignment = { horizontal: 'center' };
    });

    processed.forEach((p, idx) => {
      const r = ws.getRow(4 + idx);
      r.getCell(1).value = p.date;
      r.getCell(1).alignment = { horizontal: 'center' };
      r.getCell(2).value = p.desc;
      r.getCell(3).value = p.category;
      r.getCell(3).alignment = { horizontal: 'center' };
      r.getCell(4).value = p.type === 'in' ? p.amount : null;
      r.getCell(4).numFmt = '#,##0';
      r.getCell(5).value = p.type === 'out' ? p.amount : null;
      r.getCell(5).numFmt = '#,##0';
      r.getCell(6).value = p.runningBalance;
      r.getCell(6).numFmt = 'Rp #,##0';
      r.getCell(6).font = { bold: true };
    });

    // Total row
    const totRow = ws.getRow(4 + processed.length);
    totRow.getCell(2).value = 'TOTAL MUTASI KAS';
    totRow.getCell(2).font = { bold: true };
    totRow.getCell(4).value = totalIn;
    totRow.getCell(4).numFmt = 'Rp #,##0';
    totRow.getCell(4).font = { bold: true };
    totRow.getCell(5).value = totalOut;
    totRow.getCell(5).numFmt = 'Rp #,##0';
    totRow.getCell(5).font = { bold: true };
    totRow.getCell(6).value = netCash;
    totRow.getCell(6).numFmt = 'Rp #,##0';
    totRow.getCell(6).font = { bold: true };

    ws.columns.forEach((c) => { c.width = 20; });
    ws.getColumn(2).width = 35;

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Buku_Kas_${storeName.replace(/\s+/g, '_')}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);

    playSuccessChime();
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 border-2 border-pastel-peach/40 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-pastel-peach/25">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📖</span>
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-slate-800 dark:text-purple-100">
                Buku Kas Harian & Arus Kas UMKM
              </h2>
            </div>
            <p className="text-xs font-cute text-slate-600 dark:text-purple-300 mt-0.5">
              Catat kas masuk dan kas keluar harian, saldo running otomatis bertambah/berkurang dan siap diekspor ke Excel!
            </p>
          </div>

          <button
            onClick={handleExport}
            className="btn-bounce px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-heading font-bold flex items-center gap-2 shadow-md hover:brightness-110"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Buku Kas Excel (.xlsx)</span>
          </button>
        </div>

        <div className="pt-4 max-w-sm">
          <label className="block text-[11px] font-cute font-bold text-slate-600 dark:text-purple-300 mb-1">
            Nama Toko / Usaha:
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute font-bold focus:outline-none focus:ring-2 focus:ring-pastel-peach"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-emerald-50 dark:from-pastel-darkCard dark:to-emerald-950/20 border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-cute text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Total Kas Masuk
            </span>
            <div className="font-heading font-extrabold text-lg text-emerald-600 dark:text-emerald-400 mt-1">
              {formatRupiah(totalIn)}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-rose-50 dark:from-pastel-darkCard dark:to-rose-950/20 border border-rose-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-cute text-rose-700 dark:text-rose-300 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> Total Kas Keluar
            </span>
            <div className="font-heading font-extrabold text-lg text-rose-600 dark:text-rose-400 mt-1">
              {formatRupiah(totalOut)}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-amber-50 dark:from-pastel-darkCard dark:to-amber-950/20 border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-cute text-amber-700 dark:text-amber-300 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5" /> Saldo Kas Akhir
            </span>
            <div className="font-heading font-extrabold text-lg text-amber-600 dark:text-amber-400 mt-1">
              {formatRupiah(netCash)}
            </div>
          </div>
        </div>
      </div>

      {/* Cashflow Table */}
      <div className="glass-card rounded-3xl border-2 border-pastel-peach/30 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-pastel-peach/20 text-slate-700 dark:text-purple-200 font-heading">
              <tr>
                <th className="p-2.5 w-24">Tanggal</th>
                <th className="p-2.5">Keterangan Transaksi</th>
                <th className="p-2.5 w-28 text-center">Kategori</th>
                <th className="p-2.5 w-32 text-right">Kas Masuk (D)</th>
                <th className="p-2.5 w-32 text-right">Kas Keluar (K)</th>
                <th className="p-2.5 w-36 text-right">Saldo Kas</th>
                <th className="p-2.5 w-12 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30 font-cute">
              {processed.map((item) => (
                <tr key={item.id} className="hover:bg-pastel-peach/5">
                  <td className="p-2.5 font-mono text-slate-500 text-[11px]">{item.date}</td>
                  <td className="p-2.5 font-bold text-slate-800 dark:text-purple-100">{item.desc}</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-purple-950 text-slate-600 dark:text-purple-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {item.type === 'in' ? formatRupiah(item.amount) : '-'}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                    {item.type === 'out' ? formatRupiah(item.amount) : '-'}
                  </td>
                  <td className="p-2.5 text-right font-mono font-extrabold text-slate-800 dark:text-purple-100">
                    {formatRupiah(item.runningBalance)}
                  </td>
                  <td className="p-2.5 text-center">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors mx-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Cash Transaction */}
      <form onSubmit={handleAdd} className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-purple-900 shadow-sm space-y-3">
        <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-purple-100 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-pastel-peach" /> Catat Kas Masuk / Keluar Baru
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5">
          <div>
            <label className="text-[10px] font-cute text-slate-500 block">Tanggal</label>
            <input
              type="text"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] font-cute text-slate-500 block">Keterangan</label>
            <input
              type="text"
              placeholder="Contoh: Beli Bahan Baku Susu"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-cute text-slate-500 block">Tipe Arus</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute font-bold"
            >
              <option value="in">Kas Masuk (+)</option>
              <option value="out">Kas Keluar (-)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-cute text-slate-500 block">Jumlah (Rp)</label>
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(Number(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-mono font-bold"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full btn-bounce py-1.5 rounded-xl bg-gradient-to-r from-pastel-peach to-orange-500 text-white font-heading font-bold text-xs flex items-center justify-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
