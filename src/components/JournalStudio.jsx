import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  FileSpreadsheet,
  Palette
} from 'lucide-react';
import { TEMPLATES, CHART_OF_ACCOUNTS } from '../data/accountingTemplates';
import { exportSingleSheetAccounting, exportMultiSheetAccounting } from '../utils/excelGenerator';
import { playClick, playCoin, playSuccessChime, playUnbalanced } from '../utils/audio';
import { fireCelebration, fireLittleBurst } from '../utils/confetti';
import { formatRupiah } from '../utils/terbilang';

export default function JournalStudio({ initialTransactions, onOpenAiTool }) {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('depot_3s');
  const [businessName, setBusinessName] = useState('DEPOT 3S');
  const [reportTitle, setReportTitle] = useState('JURNAL UMUM DAN NERACA SALDO');
  const [period, setPeriod] = useState('Periode Januari - Juni 2026');
  const [transactions, setTransactions] = useState(TEMPLATES.depot_3s.transactions);
  const [excelTheme, setExcelTheme] = useState('pastel'); // 'pastel' | 'navy'
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Sync if initialTransactions is provided from AI Parser
  useEffect(() => {
    if (initialTransactions && initialTransactions.length > 0) {
      setTransactions(initialTransactions);
      setBusinessName('USAHA BARU');
      setReportTitle('JURNAL UMUM & NERACA SALDO');
      setPeriod('Periode Berjalan 2026');
    }
  }, [initialTransactions]);

  // Handle template switch
  const handleSelectTemplate = (key) => {
    playClick();
    setSelectedTemplateKey(key);
    if (TEMPLATES[key]) {
      const tmpl = TEMPLATES[key];
      setBusinessName(tmpl.businessName);
      setReportTitle(tmpl.reportTitle);
      setPeriod(tmpl.period);
      setTransactions([...tmpl.transactions]);
      fireLittleBurst();
    }
  };

  // Calculations
  const totalDebit = useMemo(() => {
    return transactions.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
  }, [transactions]);

  const totalCredit = useMemo(() => {
    return transactions.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);
  }, [transactions]);

  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;
  const difference = Math.abs(totalDebit - totalCredit);

  // Trigger celebration once when balance is achieved
  useEffect(() => {
    if (isBalanced) {
      playSuccessChime();
    }
  }, [isBalanced]);

  // Compute Neraca Saldo & Buku Besar automatically from transactions
  const { neracaList, ledgerData, labaRugiData } = useMemo(() => {
    const ledger = {};

    transactions.forEach((tx) => {
      const ref = (tx.ref || '').trim();
      const rawAccount = (tx.account || '').trim();
      if (!ref && !rawAccount) return;

      const code = ref || '101';
      if (!ledger[code]) {
        const foundCoa = CHART_OF_ACCOUNTS.find((c) => c.code === code);
        ledger[code] = {
          code: code,
          name: foundCoa ? foundCoa.name : rawAccount.replace(/^\s+/, ''),
          entries: [],
          totalDebit: 0,
          totalCredit: 0
        };
      }

      const d = Number(tx.debit) || 0;
      const c = Number(tx.credit) || 0;
      ledger[code].entries.push({
        date: tx.date || '',
        keterangan: rawAccount,
        debit: d,
        credit: c
      });
      ledger[code].totalDebit += d;
      ledger[code].totalCredit += c;
    });

    // Build Neraca List
    const nList = [];
    const revenues = [];
    const expenses = [];

    Object.keys(ledger).sort().forEach((code) => {
      const item = ledger[code];
      const isDebitNormal = !['201', '202', '301', '401', '402'].includes(code);

      let finalDebit = 0;
      let finalCredit = 0;

      if (isDebitNormal) {
        const bal = item.totalDebit - item.totalCredit;
        if (bal >= 0) finalDebit = bal;
        else finalCredit = Math.abs(bal);
      } else {
        const bal = item.totalCredit - item.totalDebit;
        if (bal >= 0) finalCredit = bal;
        else finalDebit = Math.abs(bal);
      }

      nList.push({
        code: item.code,
        name: item.name,
        debit: finalDebit,
        credit: finalCredit
      });

      // Split into Revenue and Expense for Income Statement
      if (code.startsWith('4')) {
        revenues.push({ name: item.name, amount: finalCredit });
      } else if (code.startsWith('5')) {
        expenses.push({ name: item.name, amount: finalDebit });
      }
    });

    const totRev = revenues.reduce((s, x) => s + x.amount, 0);
    const totExp = expenses.reduce((s, x) => s + x.amount, 0);

    return {
      neracaList: nList,
      ledgerData: ledger,
      labaRugiData: {
        revenues,
        expenses,
        netIncome: totRev - totExp
      }
    };
  }, [transactions]);

  // Add row
  const handleAddRow = () => {
    playCoin();
    const newId = String(Date.now());
    setTransactions([
      ...transactions,
      { id: newId, date: '', account: '', ref: '101', debit: 0, credit: 0 }
    ]);
  };

  // Delete row
  const handleDeleteRow = (id) => {
    playClick();
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  // Update row
  const handleUpdateRow = (id, field, value) => {
    setTransactions(
      transactions.map((t) => {
        if (t.id === id) {
          return { ...t, [field]: value };
        }
        return t;
      })
    );
  };

  // Copy to Clipboard (TSV)
  const handleCopyClipboard = () => {
    playClick();
    let text = `${reportTitle}\n${businessName} - ${period}\n\n`;
    text += "Tanggal\tKeterangan\tRef\tDebit\tKredit\n";
    transactions.forEach((t) => {
      text += `${t.date}\t${t.account}\t${t.ref}\t${t.debit || ''}\t${t.credit || ''}\n`;
    });
    text += `TOTAL\t\t\t${totalDebit}\t${totalCredit}\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export 1-Sheet Excel (Depot 3S Style)
  const handleExport1Sheet = async () => {
    try {
      setIsExporting(true);
      playClick();
      fireCelebration();
      const fname = `${businessName.replace(/\s+/g, '_')}_Format_1Sheet.xlsx`;
      await exportSingleSheetAccounting({
        businessName,
        reportTitle,
        period,
        transactions,
        neracaList,
        theme: excelTheme,
        filename: fname
      });
      playSuccessChime();
    } catch (err) {
      console.error(err);
      alert('Gagal mengekspor Excel: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Export 4-Sheet Excel (Full Cycle)
  const handleExport4Sheet = async () => {
    try {
      setIsExporting(true);
      playClick();
      fireCelebration();
      const fname = `${businessName.replace(/\s+/g, '_')}_Siklus_4Sheet.xlsx`;
      await exportMultiSheetAccounting({
        businessName,
        period,
        transactions,
        ledgerData,
        neracaList,
        labaRugiData,
        theme: excelTheme,
        filename: fname
      });
      playSuccessChime();
    } catch (err) {
      console.error(err);
      alert('Gagal mengekspor Excel: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Banner Card: Presets & Info */}
      <div className="glass-card rounded-3xl p-4 sm:p-6 border-2 border-pastel-pink/30 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-pastel-pink/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-slate-800 dark:text-purple-100">
                Studio Jurnal Umum & Neraca Saldo
              </h2>
            </div>
            <p className="text-xs font-cute text-slate-500 dark:text-purple-300">
              Format 1-Sheet seimbang persis Depot 3S atau 4-Sheet lengkap (Jurnal, Buku Besar 5-Kolom, Neraca Saldo, Laba Rugi).
            </p>
          </div>

          {/* Quick Presets Picker */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-cute font-bold text-slate-500 dark:text-purple-300">
              Template:
            </span>
            {Object.keys(TEMPLATES).map((key) => {
              const tmpl = TEMPLATES[key];
              const isSel = selectedTemplateKey === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectTemplate(key)}
                  className={`btn-bounce px-3 py-1.5 rounded-xl text-xs font-cute font-bold flex items-center gap-1.5 transition-all ${
                    isSel
                      ? 'bg-gradient-to-r from-pastel-pink to-pastel-rose text-white shadow-sm'
                      : 'bg-white dark:bg-pastel-darkCard border border-slate-200 dark:border-purple-900 text-slate-600 dark:text-purple-300 hover:border-pastel-pink'
                  }`}
                >
                  <span>{tmpl.icon}</span>
                  <span>{tmpl.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Meta Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div>
            <label className="block text-[11px] font-cute font-bold text-slate-600 dark:text-purple-300 mb-1">
              Nama Usaha / Bisnis:
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute font-bold focus:outline-none focus:ring-2 focus:ring-pastel-pink"
            />
          </div>

          <div>
            <label className="block text-[11px] font-cute font-bold text-slate-600 dark:text-purple-300 mb-1">
              Judul Laporan:
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute font-bold focus:outline-none focus:ring-2 focus:ring-pastel-pink"
            />
          </div>

          <div>
            <label className="block text-[11px] font-cute font-bold text-slate-600 dark:text-purple-300 mb-1">
              Periode Akuntansi:
            </label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute font-bold focus:outline-none focus:ring-2 focus:ring-pastel-pink"
            />
          </div>
        </div>
      </div>

      {/* Real-time Balance Status Bar */}
      <div className={`p-4 rounded-3xl border-2 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm transition-all duration-300 ${
        isBalanced
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
      }`}>
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
            isBalanced ? 'bg-emerald-100 text-emerald-600 animate-wiggle' : 'bg-rose-100 text-rose-600'
          }`}>
            {isBalanced ? '🎉' : '⚠️'}
          </div>
          <div>
            <div className={`font-heading font-extrabold text-sm sm:text-base flex items-center justify-center sm:justify-start gap-1.5 ${
              isBalanced ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
            }`}>
              {isBalanced ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  PERSAMAAN AKUNTANSI BALANCE & SEIMBANG!
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  DEBIT & KREDIT BELUM BALANCE!
                </>
              )}
            </div>
            <p className="text-xs font-cute text-slate-600 dark:text-purple-200 mt-0.5">
              {isBalanced
                ? `Total Debit = Kredit: ${formatRupiah(totalDebit)} • Siap diunduh ke Excel!`
                : `Terdapat selisih ${formatRupiah(difference)}. Pastikan setiap transaksi memiliki pasangan debit & kredit yang sama.`}
            </p>
          </div>
        </div>

        {/* Quick Numbers */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold">
          <div className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-800">
            <span className="text-[10px] text-slate-400 block">Total Debit</span>
            <span className="text-emerald-600 dark:text-emerald-400">{formatRupiah(totalDebit)}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-800">
            <span className="text-[10px] text-slate-400 block">Total Kredit</span>
            <span className="text-rose-600 dark:text-rose-400">{formatRupiah(totalCredit)}</span>
          </div>
        </div>
      </div>

      {/* Table Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleAddRow}
            className="btn-bounce flex-1 sm:flex-none px-4 py-2 rounded-2xl bg-gradient-to-r from-pastel-pink to-pastel-rose text-white text-xs font-heading font-bold flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Baris</span>
          </button>

          <button
            onClick={handleCopyClipboard}
            className="btn-bounce px-3.5 py-2 rounded-2xl bg-white dark:bg-pastel-darkCard border border-slate-200 dark:border-purple-900 text-xs font-cute font-bold text-slate-600 dark:text-purple-300 flex items-center gap-1.5 shadow-sm hover:border-pastel-pink"
            title="Salin untuk dipaste ke Excel atau Google Sheets"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Data'}</span>
          </button>
        </div>

        {/* Excel Theme & Downloads */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Theme Switcher */}
          <div className="flex items-center gap-1 bg-white dark:bg-pastel-darkCard border border-slate-200 dark:border-purple-900 rounded-2xl px-2 py-1 text-[11px] font-cute font-bold">
            <Palette className="w-3.5 h-3.5 text-pastel-rose" />
            <select
              value={excelTheme}
              onChange={(e) => setExcelTheme(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-purple-200 focus:outline-none cursor-pointer"
            >
              <option value="pastel">Tema Pastel Manis</option>
              <option value="navy">Tema Formal Navy</option>
            </select>
          </div>

          {/* Export 1 Sheet */}
          <button
            onClick={handleExport1Sheet}
            disabled={isExporting}
            className="btn-bounce px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-heading font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 disabled:opacity-50"
            title="Format 1 Sheet persis file Depot 3S (Jurnal + Neraca Saldo)"
          >
            <Download className="w-4 h-4" />
            <span>Export 1-Sheet (.xlsx)</span>
          </button>

          {/* Export 4 Sheet */}
          <button
            onClick={handleExport4Sheet}
            disabled={isExporting}
            className="btn-bounce px-4 py-2 rounded-2xl bg-gradient-to-r from-pastel-lavender to-pastel-deepLav text-white text-xs font-heading font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 disabled:opacity-50"
            title="Format 4 Sheet Lengkap: Jurnal, Buku Besar, Neraca, Laba Rugi"
          >
            <Layers className="w-4 h-4" />
            <span>Export 4-Sheet (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Main Journal Table */}
      <div className="glass-card rounded-3xl border-2 border-pastel-pink/30 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-pastel-pink/30 via-pastel-lavender/30 to-pastel-mint/30 dark:from-purple-950/60 dark:to-slate-900 border-b border-pastel-pink/20">
                <th className="p-3 font-heading font-bold text-slate-700 dark:text-purple-200 w-12 text-center">No</th>
                <th className="p-3 font-heading font-bold text-slate-700 dark:text-purple-200 w-28">Tanggal</th>
                <th className="p-3 font-heading font-bold text-slate-700 dark:text-purple-200">Keterangan Akun</th>
                <th className="p-3 font-heading font-bold text-slate-700 dark:text-purple-200 w-20 text-center">Ref</th>
                <th className="p-3 font-heading font-bold text-slate-700 dark:text-purple-200 w-36 text-right">Debit (Rp)</th>
                <th className="p-3 font-heading font-bold text-slate-700 dark:text-purple-200 w-36 text-right">Kredit (Rp)</th>
                <th className="p-3 font-heading font-bold text-slate-700 dark:text-purple-200 w-12 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30 font-cute">
              {transactions.map((row, idx) => {
                const isCredit = row.account.startsWith('    ') || (Number(row.credit) > 0 && Number(row.debit) === 0);

                return (
                  <tr
                    key={row.id || idx}
                    className="hover:bg-pastel-pink/5 dark:hover:bg-purple-950/20 transition-colors"
                  >
                    <td className="p-2.5 text-center text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Tanggal */}
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.date}
                        placeholder="DD-Mmm"
                        onChange={(e) => handleUpdateRow(row.id, 'date', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-white/70 dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900/60 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-pastel-pink"
                      />
                    </td>

                    {/* Keterangan Akun */}
                    <td className="p-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={row.account}
                          placeholder="Nama Akun (beri spasi untuk kredit)"
                          onChange={(e) => handleUpdateRow(row.id, 'account', e.target.value)}
                          className={`w-full px-2 py-1.5 rounded-lg bg-white/70 dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900/60 text-xs font-cute font-bold focus:outline-none focus:ring-1 focus:ring-pastel-pink ${
                            isCredit ? 'pl-6 text-slate-600 dark:text-purple-300' : 'text-slate-800 dark:text-purple-100'
                          }`}
                        />
                      </div>
                    </td>

                    {/* Ref / Kode Akun */}
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.ref}
                        placeholder="101"
                        onChange={(e) => handleUpdateRow(row.id, 'ref', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-white/70 dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900/60 text-xs font-mono text-center focus:outline-none focus:ring-1 focus:ring-pastel-pink"
                      />
                    </td>

                    {/* Debit */}
                    <td className="p-2">
                      <input
                        type="number"
                        value={row.debit || ''}
                        placeholder="0"
                        onChange={(e) => handleUpdateRow(row.id, 'debit', Number(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 rounded-lg bg-white/70 dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900/60 text-xs font-mono text-right font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-1 focus:ring-pastel-pink"
                      />
                    </td>

                    {/* Kredit */}
                    <td className="p-2">
                      <input
                        type="number"
                        value={row.credit || ''}
                        placeholder="0"
                        onChange={(e) => handleUpdateRow(row.id, 'credit', Number(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 rounded-lg bg-white/70 dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900/60 text-xs font-mono text-right font-bold text-rose-600 dark:text-rose-400 focus:outline-none focus:ring-1 focus:ring-pastel-pink"
                      />
                    </td>

                    {/* Hapus */}
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition-colors"
                        title="Hapus Baris"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Total Row */}
            <tfoot>
              <tr className="bg-pastel-cream/80 dark:bg-pastel-darkCard border-t-2 border-slate-300 dark:border-purple-800 font-heading font-extrabold text-xs">
                <td colSpan={3} className="p-3 text-center text-slate-700 dark:text-purple-200">
                  TOTAL JURNAL UMUM
                </td>
                <td className="p-3 text-center text-slate-400 font-mono">
                  Σ
                </td>
                <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                  {formatRupiah(totalDebit)}
                </td>
                <td className="p-3 text-right text-rose-600 dark:text-rose-400 font-mono text-sm">
                  {formatRupiah(totalCredit)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Auto-Calculated Neraca Saldo Preview Box */}
      <div className="glass-card rounded-3xl p-5 border-2 border-pastel-lavender/40 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📑</span>
            <h3 className="font-heading font-bold text-sm sm:text-base text-slate-800 dark:text-purple-100">
              Pratinjau Neraca Saldo (Dihitung Otomatis)
            </h3>
          </div>
          <span className="text-xs font-cute font-bold text-pastel-deepLav dark:text-purple-300">
            {neracaList.length} Akun Terdaftar
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {neracaList.map((n) => (
            <div
              key={n.code}
              className="p-3 rounded-2xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900/60 flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-purple-950 text-slate-500 dark:text-purple-400">
                  {n.code}
                </span>
                <div className="font-cute font-bold text-xs text-slate-800 dark:text-purple-200 mt-1">
                  {n.name}
                </div>
              </div>
              <div className="text-right font-mono text-xs font-bold">
                {n.debit > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(n.debit)} (D)
                  </span>
                )}
                {n.credit > 0 && (
                  <span className="text-rose-600 dark:text-rose-400">
                    {formatRupiah(n.credit)} (K)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
