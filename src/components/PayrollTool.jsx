import React, { useState } from 'react';
import { Plus, Trash2, Download, Banknote, ShieldCheck, UserCheck } from 'lucide-react';
import { PTKP_LIST, calculatePPh21Ter } from '../utils/pph21Calculator';
import { exportPayrollExcel } from '../utils/excelGenerator';
import { playClick, playCoin, playSuccessChime } from '../utils/audio';
import { fireLittleBurst } from '../utils/confetti';
import { formatRupiah } from '../utils/terbilang';

const INITIAL_EMPLOYEES = [
  { id: '1', name: 'Alina Rahmawati', role: 'Staff Akuntansi', ptkp: 'TK/0', baseSalary: 6500000, allowance: 800000, bpjs: 195000 },
  { id: '2', name: 'Budi Santoso', role: 'Barista Senior', ptkp: 'K/1', baseSalary: 5200000, allowance: 500000, bpjs: 156000 },
  { id: '3', name: 'Citra Kirana', role: 'Digital Marketing', ptkp: 'TK/1', baseSalary: 7200000, allowance: 1200000, bpjs: 216000 },
  { id: '4', name: 'Doni Pratama', role: 'Manager Operasional', ptkp: 'K/2', baseSalary: 11000000, allowance: 2500000, bpjs: 330000 }
];

export default function PayrollTool() {
  const [companyName, setCompanyName] = useState('PT Sahabat Sejahtera');
  const [period, setPeriod] = useState('Agustus 2026');
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);

  // New employee form
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newPtkp, setNewPtkp] = useState('TK/0');
  const [newBase, setNewBase] = useState(6000000);
  const [newAllowance, setNewAllowance] = useState(500000);
  const [newBpjs, setNewBpjs] = useState(180000);

  // Computed employees with TER
  const processedEmployees = employees.map((emp) => {
    const bruto = (Number(emp.baseSalary) || 0) + (Number(emp.allowance) || 0);
    const ter = calculatePPh21Ter(bruto, emp.ptkp);
    const takeHomePay = bruto - (Number(emp.bpjs) || 0) - ter.pph21;

    return {
      ...emp,
      bruto,
      terCategory: ter.category,
      terRate: ter.rate,
      pph21: ter.pph21,
      takeHomePay
    };
  });

  const totalBruto = processedEmployees.reduce((s, x) => s + x.bruto, 0);
  const totalPph21 = processedEmployees.reduce((s, x) => s + x.pph21, 0);
  const totalTakeHome = processedEmployees.reduce((s, x) => s + x.takeHomePay, 0);

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    playCoin();
    setEmployees([
      ...employees,
      {
        id: String(Date.now()),
        name: newName,
        role: newRole || 'Staff',
        ptkp: newPtkp,
        baseSalary: Number(newBase) || 0,
        allowance: Number(newAllowance) || 0,
        bpjs: Number(newBpjs) || 0
      }
    ]);
    setNewName('');
    setNewRole('');
    fireLittleBurst();
  };

  const handleDelete = (id) => {
    playClick();
    setEmployees(employees.filter((emp) => emp.id !== id));
  };

  const handleExport = async () => {
    playClick();
    fireLittleBurst();
    await exportPayrollExcel({
      companyName,
      period,
      employees: processedEmployees,
      filename: `Payroll_PPh21_TER_${companyName.replace(/\s+/g, '_')}.xlsx`
    });
    playSuccessChime();
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 border-2 border-pastel-mint/40 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-pastel-mint/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💵</span>
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-slate-800 dark:text-purple-100">
                Kalkulator Slip Gaji & PPh 21 TER 2024
              </h2>
            </div>
            <p className="text-xs font-cute text-slate-600 dark:text-purple-300 mt-0.5">
              Sesuai skema Tarif Efektif Rata-Rata PP 58/2023 & PMK 168/2023: Kategori TER A, B, C otomatis terhitung!
            </p>
          </div>

          <button
            onClick={handleExport}
            className="btn-bounce px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-heading font-bold flex items-center gap-2 shadow-md hover:brightness-110"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Rekap Payroll Excel (.xlsx)</span>
          </button>
        </div>

        {/* Company Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          <div>
            <label className="block text-[11px] font-cute font-bold text-slate-600 dark:text-purple-300 mb-1">
              Nama Perusahaan / Usaha:
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute font-bold focus:outline-none focus:ring-2 focus:ring-pastel-mint"
            />
          </div>
          <div>
            <label className="block text-[11px] font-cute font-bold text-slate-600 dark:text-purple-300 mb-1">
              Periode Penggajian:
            </label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute font-bold focus:outline-none focus:ring-2 focus:ring-pastel-mint"
            />
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-pastel-cream dark:from-pastel-darkCard dark:to-pastel-darkBg border border-pastel-pink/30 shadow-sm">
          <div className="text-[11px] font-cute text-slate-500 dark:text-purple-300">Total Beban Gaji Bruto</div>
          <div className="font-heading font-extrabold text-lg text-slate-800 dark:text-purple-100 mt-0.5">
            {formatRupiah(totalBruto)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-pastel-cream dark:from-pastel-darkCard dark:to-pastel-darkBg border border-pastel-lavender/30 shadow-sm">
          <div className="text-[11px] font-cute text-slate-500 dark:text-purple-300">Total Potongan PPh 21 TER</div>
          <div className="font-heading font-extrabold text-lg text-rose-600 dark:text-rose-400 mt-0.5">
            {formatRupiah(totalPph21)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-pastel-cream dark:from-pastel-darkCard dark:to-pastel-darkBg border border-pastel-mint/30 shadow-sm">
          <div className="text-[11px] font-cute text-slate-500 dark:text-purple-300">Total Take Home Pay</div>
          <div className="font-heading font-extrabold text-lg text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatRupiah(totalTakeHome)}
          </div>
        </div>
      </div>

      {/* Employee List Table */}
      <div className="glass-card rounded-3xl border-2 border-pastel-mint/30 overflow-hidden shadow-md">
        <div className="p-4 border-b border-pastel-mint/20 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-purple-100">
            Daftar Karyawan ({employees.length} Orang)
          </h3>
          <span className="text-xs font-cute text-slate-400">
            Tarif Efektif Rata-Rata Bulanan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-pastel-mint/15 text-slate-700 dark:text-purple-200 font-heading">
              <tr>
                <th className="p-2.5">Karyawan</th>
                <th className="p-2.5">Jabatan</th>
                <th className="p-2.5 text-center">PTKP</th>
                <th className="p-2.5 text-center">Skema TER</th>
                <th className="p-2.5 text-right">Gaji Bruto</th>
                <th className="p-2.5 text-right">Potongan PPh 21</th>
                <th className="p-2.5 text-right">Take Home Pay</th>
                <th className="p-2.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30 font-cute">
              {processedEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-pastel-mint/5">
                  <td className="p-2.5 font-bold text-slate-800 dark:text-purple-100">{emp.name}</td>
                  <td className="p-2.5 text-slate-600 dark:text-purple-300">{emp.role}</td>
                  <td className="p-2.5 text-center font-mono font-bold text-slate-500">{emp.ptkp}</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pastel-lavender/25 text-pastel-deepLav dark:text-purple-300">
                      TER {emp.terCategory} ({emp.terRate}%)
                    </span>
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-700 dark:text-purple-200">
                    {formatRupiah(emp.bruto)}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                    {formatRupiah(emp.pph21)}
                  </td>
                  <td className="p-2.5 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(emp.takeHomePay)}
                  </td>
                  <td className="p-2.5 text-center">
                    <button
                      onClick={() => handleDelete(emp.id)}
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

      {/* Add Employee Form */}
      <form onSubmit={handleAddEmployee} className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-purple-900 shadow-sm space-y-3">
        <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-purple-100 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-pastel-mint" /> Tambah Karyawan Baru
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          <div>
            <label className="text-[10px] font-cute text-slate-500 block">Nama</label>
            <input
              type="text"
              placeholder="Nama Karyawan"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute"
            />
          </div>

          <div>
            <label className="text-[10px] font-cute text-slate-500 block">Jabatan</label>
            <input
              type="text"
              placeholder="Staff"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute"
            />
          </div>

          <div>
            <label className="text-[10px] font-cute text-slate-500 block">Status PTKP</label>
            <select
              value={newPtkp}
              onChange={(e) => setNewPtkp(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-cute"
            >
              {PTKP_LIST.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.code} (TER {p.terCategory})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-cute text-slate-500 block">Gaji Pokok</label>
            <input
              type="number"
              value={newBase}
              onChange={(e) => setNewBase(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-cute text-slate-500 block">Tunjangan</label>
            <input
              type="number"
              value={newAllowance}
              onChange={(e) => setNewAllowance(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-pastel-darkBg border border-slate-200 dark:border-purple-900 text-xs font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full btn-bounce py-1.5 rounded-xl bg-gradient-to-r from-pastel-mint to-teal-500 text-white font-heading font-bold text-xs flex items-center justify-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
