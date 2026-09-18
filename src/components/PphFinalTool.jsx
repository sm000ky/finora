import React, { useState } from 'react';
import { Download, Calculator, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';
import ExcelJS from 'exceljs';
import { playClick, playCoin, playSuccessChime } from '../utils/audio';
import { fireLittleBurst } from '../utils/confetti';
import { formatRupiah } from '../utils/terbilang';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DEFAULT_OMZET = [
  45000000, 52000000, 60000000, 55000000, 70000000, 85000000,
  68000000, 72000000, 80000000, 90000000, 95000000, 110000000
];

export default function PphFinalTool() {
  const [taxPayerType, setTaxPayerType] = useState('op'); // 'op' (Orang Pribadi) | 'badan' (CV / PT)
  const [businessName, setBusinessName] = useState('Kafe Boba Miau');
  const [taxYear, setTaxYear] = useState('2026');
  const [omzetList, setOmzetList] = useState(DEFAULT_OMZET);

  const handleUpdateMonth = (idx, val) => {
    const next = [...omzetList];
    next[idx] = Number(val) || 0;
    setOmzetList(next);
  };

  // Calculations:
  // For Orang Pribadi (OP): free limit up to cumulative Rp 500,000,000 (PP 55/2022)
  let cumulative = 0;
  let prevCumulative = 0;

  const rows = MONTHS.map((m, idx) => {
    const omzet = omzetList[idx] || 0;
    prevCumulative = cumulative;
    cumulative += omzet;

    let dppKenaPajak = 0;
    if (taxPayerType === 'badan') {
      dppKenaPajak = omzet;
    } else {
      // OP: threshold 500 jt
      if (cumulative <= 500000000) {
        dppKenaPajak = 0;
      } else if (prevCumulative < 500000000 && cumulative > 500000000) {
        dppKenaPajak = cumulative - 500000000;
      } else {
        dppKenaPajak = omzet;
      }
    }

    const pphTerutang = Math.round(dppKenaPajak * 0.005); // 0.5%
    return {
      month: m,
      omzet,
      cumulative,
      dppKenaPajak,
      pphTerutang
    };
  });

  const totalOmzet = rows.reduce((s, x) => s + x.omzet, 0);
  const totalPph = rows.reduce((s, x) => s + x.pphTerutang, 0);

  const handleExport = async () => {
    playClick();
    fireLittleBurst();

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Rekap PPh Final UMKM', { views: [{ showGridLines: true }] });

    ws.mergeCells('A1:E1');
    ws.getCell('A1').value = `${businessName} - REKAP OMZET & PPh FINAL UMKM 0.5% (PP 55/2022)`;
    ws.getCell('A1').font = { size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8357EB' } };
    ws.getCell('A1').alignment = { horizontal: 'center' };

    ws.mergeCells('A2:E2');
    ws.getCell('A2').value = `Tahun Pajak: ${taxYear} • Jenis Wajib Pajak: ${taxPayerType === 'op' ? 'Orang Pribadi (Bebas s.d. Rp 500 Juta)' : 'Badan Usaha (CV/PT)'}`;
    ws.getCell('A2').alignment = { horizontal: 'center' };

    const headers = ['Bulan', 'Peredaran Bruto (Omzet)', 'Akumulasi Omzet', 'DPP Kena Pajak', 'PPh Final 0.5%'];
    headers.forEach((h, i) => {
      const c = ws.getRow(4).getCell(i + 1);
      c.value = h;
      c.font = { bold: true };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8D7FF' } };
      c.alignment = { horizontal: 'center' };
    });

    rows.forEach((r, idx) => {
      const row = ws.getRow(5 + idx);
      row.getCell(1).value = r.month;
      row.getCell(2).value = r.omzet;
      row.getCell(2).numFmt = '#,##0';
      row.getCell(3).value = r.cumulative;
      row.getCell(3).numFmt = '#,##0';
      row.getCell(4).value = r.dppKenaPajak;
      row.getCell(4).numFmt = '#,##0';
      row.getCell(5).value = r.pphTerutang;
      row.getCell(5).numFmt = 'Rp #,##0';
      row.getCell(5).font = { bold: true };
    });

    const totRow = ws.getRow(5 + rows.length);
    totRow.getCell(1).value = 'TOTAL TAHUNAN';
    totRow.getCell(1).font = { bold: true };
    totRow.getCell(2).value = totalOmzet;
    totRow.getCell(2).numFmt = 'Rp #,##0';
    totRow.getCell(2).font = { bold: true };
    totRow.getCell(5).value = totalPph;
    totRow.getCell(5).numFmt = 'Rp #,##0';
    totRow.getCell(5).font = { bold: true };

    ws.columns.forEach((c) => { c.width = 24; });

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PPh_Final_UMKM_${businessName.replace(/\s+/g, '_')}_${taxYear}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);

    playSuccessChime();
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 border-2 border-purple-300 dark:border-purple-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-purple-200 dark:border-purple-900/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧮</span>
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-slate-800 dark:text-purple-100">
                Kalkulator PPh Final UMKM 0.5% (PP 55/2022)
              </h2>
            </div>
            <p className="text-xs font-cute text-slate-600 dark:text-purple-300 mt-0.5">
              Simulasi omzet bulanan dengan insentif batas omzet tidak kena pajak Rp 500 juta bagi Orang Pribadi.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="btn-bounce px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-heading font-bold flex items-center gap-2 shadow-md hover:brightness-110"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Laporan PPh Final Excel (.xlsx)</span>
          </button>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div>
            <label className="block text-[11px] font-cute font-bold text-slate-600 dark:text-purple-300 mb-1">
              Bentuk Entitas:
            </label>
            <select
              value={taxPayerType}
              onChange={(e) => setTaxPayerType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute font-bold"
            >
              <option value="op">Orang Pribadi (Bebas Pajak s.d. Rp 500 Jt)</option>
              <option value="badan">Badan Usaha (CV / PT - Tanpa Batas 500 Jt)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-cute font-bold text-slate-600 dark:text-purple-300 mb-1">
              Nama Usaha / Wajib Pajak:
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-cute font-bold text-slate-600 dark:text-purple-300 mb-1">
              Tahun Pajak:
            </label>
            <input
              type="text"
              value={taxYear}
              onChange={(e) => setTaxYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute font-bold"
            />
          </div>
        </div>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-pastel-darkCard border border-purple-200 dark:border-purple-900 shadow-sm">
          <div className="text-[11px] font-cute text-slate-500 dark:text-purple-300">Total Omzet Bruto 1 Tahun</div>
          <div className="font-heading font-extrabold text-xl text-slate-800 dark:text-purple-100 mt-1">
            {formatRupiah(totalOmzet)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-pastel-darkCard border border-purple-200 dark:border-purple-900 shadow-sm">
          <div className="text-[11px] font-cute text-slate-500 dark:text-purple-300">Total PPh Final Terutang (0.5%)</div>
          <div className="font-heading font-extrabold text-xl text-pastel-deepLav dark:text-purple-300 mt-1">
            {formatRupiah(totalPph)}
          </div>
        </div>
      </div>

      {/* Months Table */}
      <div className="glass-card rounded-3xl border-2 border-purple-200 dark:border-purple-900 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-purple-100 dark:bg-purple-950/60 text-slate-700 dark:text-purple-200 font-heading">
              <tr>
                <th className="p-2.5">Bulan</th>
                <th className="p-2.5 w-44">Omzet Bulan Ini (Rp)</th>
                <th className="p-2.5 text-right">Akumulasi Omzet</th>
                <th className="p-2.5 text-right">DPP Kena Pajak</th>
                <th className="p-2.5 text-right">PPh Final 0.5% (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30 font-cute">
              {rows.map((r, idx) => (
                <tr key={idx} className="hover:bg-purple-50/40">
                  <td className="p-2.5 font-bold text-slate-800 dark:text-purple-100">{r.month}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={omzetList[idx]}
                      onChange={(e) => handleUpdateMonth(idx, e.target.value)}
                      className="w-full px-2 py-1 rounded-lg bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-mono font-bold"
                    />
                  </td>
                  <td className="p-2.5 text-right font-mono text-slate-600 dark:text-purple-300">
                    {formatRupiah(r.cumulative)}
                  </td>
                  <td className="p-2.5 text-right font-mono text-slate-600 dark:text-purple-300">
                    {formatRupiah(r.dppKenaPajak)}
                  </td>
                  <td className="p-2.5 text-right font-mono font-extrabold text-pastel-deepLav dark:text-purple-300">
                    {formatRupiah(r.pphTerutang)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
