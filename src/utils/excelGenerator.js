import ExcelJS from 'exceljs';

// Color Palettes
const THEMES = {
  pastel: {
    primaryFill: 'FFD1E8', // Soft pink
    primaryFont: '5A3D54',
    secondaryFill: 'E8D7FF', // Soft lavender
    secondaryFont: '3E2E5B',
    accentFill: 'D0F5E8', // Soft mint
    accentFont: '1E4D3E',
    totalFill: 'FFF3D6', // Soft peach/gold
    totalFont: '664200',
    headerFill: 'FFB8D9',
    headerFont: 'FFFFFF',
    borderColor: 'DDA6C2'
  },
  navy: {
    primaryFill: '1B365D',
    primaryFont: 'FFFFFF',
    secondaryFill: 'D9E1F2',
    secondaryFont: '1B365D',
    accentFill: 'B4C7E7',
    accentFont: '000000',
    totalFill: 'E8EEF5',
    totalFont: '1B365D',
    headerFill: '1B365D',
    headerFont: 'FFFFFF',
    borderColor: '8EA9DB'
  }
};

const thinBorder = {
  top: { style: 'thin', color: { argb: 'FFAAAAAA' } },
  left: { style: 'thin', color: { argb: 'FFAAAAAA' } },
  bottom: { style: 'thin', color: { argb: 'FFAAAAAA' } },
  right: { style: 'thin', color: { argb: 'FFAAAAAA' } }
};

const doubleBottomBorder = {
  top: { style: 'thin', color: { argb: 'FF444444' } },
  left: { style: 'thin', color: { argb: 'FFAAAAAA' } },
  bottom: { style: 'double', color: { argb: 'FF222222' } },
  right: { style: 'thin', color: { argb: 'FFAAAAAA' } }
};

// Helper to trigger browser download
async function saveWorkbook(workbook, filename) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

// Auto-adjust column widths
function autoFitColumns(worksheet, maxLimit = 45) {
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const valStr = cell.value ? cell.value.toString() : '';
      if (valStr.length > maxLength && !cell.isMerged) {
        maxLength = valStr.length;
      }
    });
    column.width = Math.min(Math.max(maxLength + 3, 12), maxLimit);
  });
}

// 1. GENERATE SINGLE SHEET (Depot 3S Style: Jurnal Umum + Neraca Saldo)
export async function exportSingleSheetAccounting({
  businessName = 'DEPOT 3S',
  reportTitle = 'JURNAL UMUM DAN NERACA SALDO',
  period = 'Periode Januari - Juni 2026',
  transactions = [],
  neracaList = [],
  theme = 'pastel',
  filename = 'Laporan_Keuangan_Format_1Sheet.xlsx'
}) {
  const t = THEMES[theme] || THEMES.pastel;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Miau Excel Studio';
  wb.created = new Date();

  const ws = wb.addWorksheet('Laporan Keuangan', {
    views: [{ showGridLines: true }]
  });

  // Main Header
  ws.mergeCells('A1:E1');
  ws.getCell('A1').value = reportTitle;
  ws.getCell('A1').font = { name: 'Calibri', size: 14, bold: true, color: { argb: t.headerFont } };
  ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.headerFill } };
  ws.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;

  ws.mergeCells('A2:E2');
  ws.getCell('A2').value = businessName;
  ws.getCell('A2').font = { name: 'Calibri', size: 12, bold: true };
  ws.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells('A3:E3');
  ws.getCell('A3').value = period;
  ws.getCell('A3').font = { name: 'Calibri', size: 10, italic: true };
  ws.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };

  let rowIdx = 5;

  // Section A: JURNAL UMUM
  ws.mergeCells(`A${rowIdx}:E${rowIdx}`);
  const secA = ws.getCell(`A${rowIdx}`);
  secA.value = 'SEKSI A: JURNAL UMUM';
  secA.font = { name: 'Calibri', size: 11, bold: true, color: { argb: t.primaryFont } };
  secA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.secondaryFill } };
  secA.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  ws.getRow(rowIdx).height = 22;
  rowIdx++;

  // Table Headers
  const journalHeaders = ['Tanggal', 'Keterangan', 'Ref', 'Debit', 'Kredit'];
  const headerRow = ws.getRow(rowIdx);
  journalHeaders.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: t.primaryFont } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.primaryFill } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder;
  });
  headerRow.height = 22;
  const journalStartRow = rowIdx + 1;
  rowIdx++;

  // Write Journal Rows
  transactions.forEach((item) => {
    const r = ws.getRow(rowIdx);
    r.getCell(1).value = item.date || '';
    r.getCell(1).alignment = { horizontal: 'center' };

    r.getCell(2).value = item.account || '';
    r.getCell(2).alignment = { horizontal: 'left' };

    r.getCell(3).value = item.ref || '';
    r.getCell(3).alignment = { horizontal: 'center' };

    r.getCell(4).value = item.debit > 0 ? Number(item.debit) : null;
    r.getCell(4).numFmt = '#,##0';
    r.getCell(4).alignment = { horizontal: 'right' };

    r.getCell(5).value = item.credit > 0 ? Number(item.credit) : null;
    r.getCell(5).numFmt = '#,##0';
    r.getCell(5).alignment = { horizontal: 'right' };

    for (let c = 1; c <= 5; c++) {
      r.getCell(c).border = thinBorder;
    }
    rowIdx++;
  });

  const journalEndRow = rowIdx - 1;

  // Total Journal Row
  const totalJournalRow = ws.getRow(rowIdx);
  totalJournalRow.getCell(2).value = 'TOTAL JURNAL';
  totalJournalRow.getCell(2).font = { name: 'Calibri', bold: true };
  totalJournalRow.getCell(2).alignment = { horizontal: 'center' };

  totalJournalRow.getCell(4).value = {
    formula: `SUM(D${journalStartRow}:D${journalEndRow})`,
    result: transactions.reduce((acc, x) => acc + (Number(x.debit) || 0), 0)
  };
  totalJournalRow.getCell(4).numFmt = 'Rp #,##0';
  totalJournalRow.getCell(4).font = { name: 'Calibri', bold: true };
  totalJournalRow.getCell(4).alignment = { horizontal: 'right' };

  totalJournalRow.getCell(5).value = {
    formula: `SUM(E${journalStartRow}:E${journalEndRow})`,
    result: transactions.reduce((acc, x) => acc + (Number(x.credit) || 0), 0)
  };
  totalJournalRow.getCell(5).numFmt = 'Rp #,##0';
  totalJournalRow.getCell(5).font = { name: 'Calibri', bold: true };
  totalJournalRow.getCell(5).alignment = { horizontal: 'right' };

  for (let c = 1; c <= 5; c++) {
    totalJournalRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.totalFill } };
    totalJournalRow.getCell(c).border = doubleBottomBorder;
  }
  totalJournalRow.height = 24;

  // Space 2 rows
  rowIdx += 3;

  // Section B: NERACA SALDO
  ws.mergeCells(`A${rowIdx}:E${rowIdx}`);
  const secB = ws.getCell(`A${rowIdx}`);
  secB.value = `SEKSI B: NERACA SALDO (${period})`;
  secB.font = { name: 'Calibri', size: 11, bold: true, color: { argb: t.primaryFont } };
  secB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.secondaryFill } };
  secB.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  ws.getRow(rowIdx).height = 22;
  rowIdx++;

  // Neraca Table Headers
  const neracaHeaders = ['No. Akun', 'Nama Akun', 'Ref', 'Debit', 'Kredit'];
  const neracaHeaderRow = ws.getRow(rowIdx);
  neracaHeaders.forEach((h, i) => {
    const cell = neracaHeaderRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: t.primaryFont } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.primaryFill } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder;
  });
  neracaHeaderRow.height = 22;
  const neracaStartRow = rowIdx + 1;
  rowIdx++;

  // Write Neraca Rows
  neracaList.forEach((n) => {
    const r = ws.getRow(rowIdx);
    r.getCell(1).value = n.code || '';
    r.getCell(1).alignment = { horizontal: 'center' };

    r.getCell(2).value = n.name || '';
    r.getCell(2).alignment = { horizontal: 'left' };

    r.getCell(3).value = '';
    r.getCell(3).alignment = { horizontal: 'center' };

    r.getCell(4).value = n.debit > 0 ? Number(n.debit) : null;
    r.getCell(4).numFmt = '#,##0';
    r.getCell(4).alignment = { horizontal: 'right' };

    r.getCell(5).value = n.credit > 0 ? Number(n.credit) : null;
    r.getCell(5).numFmt = '#,##0';
    r.getCell(5).alignment = { horizontal: 'right' };

    for (let c = 1; c <= 5; c++) {
      r.getCell(c).border = thinBorder;
    }
    rowIdx++;
  });

  const neracaEndRow = rowIdx - 1;

  // Total Neraca Row
  const totalNeracaRow = ws.getRow(rowIdx);
  totalNeracaRow.getCell(2).value = 'TOTAL NERACA SALDO';
  totalNeracaRow.getCell(2).font = { name: 'Calibri', bold: true };
  totalNeracaRow.getCell(2).alignment = { horizontal: 'center' };

  totalNeracaRow.getCell(4).value = {
    formula: `SUM(D${neracaStartRow}:D${neracaEndRow})`,
    result: neracaList.reduce((acc, x) => acc + (Number(x.debit) || 0), 0)
  };
  totalNeracaRow.getCell(4).numFmt = 'Rp #,##0';
  totalNeracaRow.getCell(4).font = { name: 'Calibri', bold: true };
  totalNeracaRow.getCell(4).alignment = { horizontal: 'right' };

  totalNeracaRow.getCell(5).value = {
    formula: `SUM(E${neracaStartRow}:E${neracaEndRow})`,
    result: neracaList.reduce((acc, x) => acc + (Number(x.credit) || 0), 0)
  };
  totalNeracaRow.getCell(5).numFmt = 'Rp #,##0';
  totalNeracaRow.getCell(5).font = { name: 'Calibri', bold: true };
  totalNeracaRow.getCell(5).alignment = { horizontal: 'right' };

  for (let c = 1; c <= 5; c++) {
    totalNeracaRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.accentFill } };
    totalNeracaRow.getCell(c).border = doubleBottomBorder;
  }
  totalNeracaRow.height = 24;

  // Column Widths
  ws.getColumn(1).width = 14;
  ws.getColumn(2).width = 38;
  ws.getColumn(3).width = 8;
  ws.getColumn(4).width = 20;
  ws.getColumn(5).width = 20;

  await saveWorkbook(wb, filename);
}

// 2. GENERATE MULTI SHEET (Jurnal, Buku Besar 5-Kolom, Neraca Saldo, Laba Rugi)
export async function exportMultiSheetAccounting({
  businessName = 'DEPOT 3S',
  period = 'Periode Januari - Juni 2026',
  transactions = [],
  ledgerData = {},
  neracaList = [],
  labaRugiData = { revenues: [], expenses: [], netIncome: 0 },
  theme = 'pastel',
  filename = 'Siklus_Akuntansi_Lengkap_4Sheet.xlsx'
}) {
  const t = THEMES[theme] || THEMES.pastel;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Miau Excel Studio';

  // SHEET 1: JURNAL UMUM
  const wsJurnal = wb.addWorksheet('1. Jurnal Umum', { views: [{ showGridLines: true }] });
  wsJurnal.mergeCells('A1:E1');
  wsJurnal.getCell('A1').value = `${businessName} - JURNAL UMUM`;
  wsJurnal.getCell('A1').font = { size: 14, bold: true, color: { argb: t.headerFont } };
  wsJurnal.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.headerFill } };
  wsJurnal.getCell('A1').alignment = { horizontal: 'center' };

  wsJurnal.mergeCells('A2:E2');
  wsJurnal.getCell('A2').value = period;
  wsJurnal.getCell('A2').alignment = { horizontal: 'center' };

  ['Tanggal', 'Keterangan Akun', 'Ref', 'Debit', 'Kredit'].forEach((h, i) => {
    const c = wsJurnal.getRow(4).getCell(i + 1);
    c.value = h;
    c.font = { bold: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.primaryFill } };
    c.alignment = { horizontal: 'center' };
    c.border = thinBorder;
  });

  transactions.forEach((tx, i) => {
    const row = wsJurnal.getRow(5 + i);
    row.getCell(1).value = tx.date || '';
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(2).value = tx.account || '';
    row.getCell(3).value = tx.ref || '';
    row.getCell(3).alignment = { horizontal: 'center' };
    row.getCell(4).value = tx.debit > 0 ? Number(tx.debit) : null;
    row.getCell(4).numFmt = '#,##0';
    row.getCell(5).value = tx.credit > 0 ? Number(tx.credit) : null;
    row.getCell(5).numFmt = '#,##0';
    for (let c = 1; c <= 5; c++) row.getCell(c).border = thinBorder;
  });

  const totRow = wsJurnal.getRow(5 + transactions.length);
  totRow.getCell(2).value = 'TOTAL';
  totRow.getCell(2).font = { bold: true };
  totRow.getCell(4).value = {
    formula: `SUM(D5:D${4 + transactions.length})`,
    result: transactions.reduce((s, x) => s + (Number(x.debit) || 0), 0)
  };
  totRow.getCell(4).numFmt = 'Rp #,##0';
  totRow.getCell(4).font = { bold: true };
  totRow.getCell(5).value = {
    formula: `SUM(E5:E${4 + transactions.length})`,
    result: transactions.reduce((s, x) => s + (Number(x.credit) || 0), 0)
  };
  totRow.getCell(5).numFmt = 'Rp #,##0';
  totRow.getCell(5).font = { bold: true };
  for (let c = 1; c <= 5; c++) {
    totRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.totalFill } };
    totRow.getCell(c).border = doubleBottomBorder;
  }
  autoFitColumns(wsJurnal);

  // SHEET 2: BUKU BESAR (5 Kolom: Tanggal, Keterangan, Debit, Kredit, Saldo Running)
  const wsBuku = wb.addWorksheet('2. Buku Besar', { views: [{ showGridLines: true }] });
  wsBuku.mergeCells('A1:E1');
  wsBuku.getCell('A1').value = `${businessName} - BUKU BESAR (T-ACCOUNT)`;
  wsBuku.getCell('A1').font = { size: 14, bold: true, color: { argb: t.headerFont } };
  wsBuku.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.headerFill } };
  wsBuku.getCell('A1').alignment = { horizontal: 'center' };

  let bRow = 3;
  Object.keys(ledgerData).forEach((accCode) => {
    const acc = ledgerData[accCode];
    // Account Header Banner
    wsBuku.mergeCells(`A${bRow}:E${bRow}`);
    const hCell = wsBuku.getCell(`A${bRow}`);
    hCell.value = `Akun: ${accCode} - ${acc.name}`;
    hCell.font = { bold: true, size: 11, color: { argb: t.secondaryFont } };
    hCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.secondaryFill } };
    bRow++;

    // Subheader
    ['Tanggal', 'Keterangan', 'Debit', 'Kredit', 'Saldo'].forEach((sh, idx) => {
      const c = wsBuku.getRow(bRow).getCell(idx + 1);
      c.value = sh;
      c.font = { bold: true };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.primaryFill } };
      c.alignment = { horizontal: 'center' };
      c.border = thinBorder;
    });
    bRow++;

    // Entries
    let runningBalance = 0;
    (acc.entries || []).forEach((entry) => {
      const isDebitNormal = !['201', '202', '301', '401', '402'].includes(accCode);
      if (isDebitNormal) {
        runningBalance += (entry.debit || 0) - (entry.credit || 0);
      } else {
        runningBalance += (entry.credit || 0) - (entry.debit || 0);
      }

      const r = wsBuku.getRow(bRow);
      r.getCell(1).value = entry.date || '';
      r.getCell(1).alignment = { horizontal: 'center' };
      r.getCell(2).value = entry.keterangan || '';
      r.getCell(3).value = entry.debit > 0 ? entry.debit : null;
      r.getCell(3).numFmt = '#,##0';
      r.getCell(4).value = entry.credit > 0 ? entry.credit : null;
      r.getCell(4).numFmt = '#,##0';
      r.getCell(5).value = runningBalance;
      r.getCell(5).numFmt = '#,##0';
      r.getCell(5).font = { bold: true };

      for (let col = 1; col <= 5; col++) r.getCell(col).border = thinBorder;
      bRow++;
    });

    bRow += 2; // Spacing between accounts
  });
  autoFitColumns(wsBuku);

  // SHEET 3: NERACA SALDO
  const wsNeraca = wb.addWorksheet('3. Neraca Saldo', { views: [{ showGridLines: true }] });
  wsNeraca.mergeCells('A1:D1');
  wsNeraca.getCell('A1').value = `${businessName} - NERACA SALDO`;
  wsNeraca.getCell('A1').font = { size: 14, bold: true, color: { argb: t.headerFont } };
  wsNeraca.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.headerFill } };
  wsNeraca.getCell('A1').alignment = { horizontal: 'center' };

  wsNeraca.mergeCells('A2:D2');
  wsNeraca.getCell('A2').value = period;
  wsNeraca.getCell('A2').alignment = { horizontal: 'center' };

  ['No. Akun', 'Nama Akun', 'Debit', 'Kredit'].forEach((h, i) => {
    const c = wsNeraca.getRow(4).getCell(i + 1);
    c.value = h;
    c.font = { bold: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.primaryFill } };
    c.alignment = { horizontal: 'center' };
    c.border = thinBorder;
  });

  neracaList.forEach((n, i) => {
    const r = wsNeraca.getRow(5 + i);
    r.getCell(1).value = n.code || '';
    r.getCell(1).alignment = { horizontal: 'center' };
    r.getCell(2).value = n.name || '';
    r.getCell(3).value = n.debit > 0 ? Number(n.debit) : null;
    r.getCell(3).numFmt = '#,##0';
    r.getCell(4).value = n.credit > 0 ? Number(n.credit) : null;
    r.getCell(4).numFmt = '#,##0';
    for (let c = 1; c <= 4; c++) r.getCell(c).border = thinBorder;
  });

  const totNeraca = wsNeraca.getRow(5 + neracaList.length);
  totNeraca.getCell(2).value = 'TOTAL';
  totNeraca.getCell(2).font = { bold: true };
  totNeraca.getCell(3).value = {
    formula: `SUM(C5:C${4 + neracaList.length})`,
    result: neracaList.reduce((s, x) => s + (Number(x.debit) || 0), 0)
  };
  totNeraca.getCell(3).numFmt = 'Rp #,##0';
  totNeraca.getCell(3).font = { bold: true };
  totNeraca.getCell(4).value = {
    formula: `SUM(D5:D${4 + neracaList.length})`,
    result: neracaList.reduce((s, x) => s + (Number(x.credit) || 0), 0)
  };
  totNeraca.getCell(4).numFmt = 'Rp #,##0';
  totNeraca.getCell(4).font = { bold: true };
  for (let c = 1; c <= 4; c++) {
    totNeraca.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.accentFill } };
    totNeraca.getCell(c).border = doubleBottomBorder;
  }
  autoFitColumns(wsNeraca);

  // SHEET 4: LAPORAN LABA RUGI
  const wsLaba = wb.addWorksheet('4. Laba Rugi', { views: [{ showGridLines: true }] });
  wsLaba.mergeCells('A1:B1');
  wsLaba.getCell('A1').value = `${businessName} - LAPORAN LABA RUGI`;
  wsLaba.getCell('A1').font = { size: 14, bold: true, color: { argb: t.headerFont } };
  wsLaba.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.headerFill } };
  wsLaba.getCell('A1').alignment = { horizontal: 'center' };

  wsLaba.mergeCells('A2:B2');
  wsLaba.getCell('A2').value = period;
  wsLaba.getCell('A2').alignment = { horizontal: 'center' };

  let lRow = 4;
  // Pendapatan Section
  wsLaba.getCell(`A${lRow}`).value = 'PENDAPATAN USAHA';
  wsLaba.getCell(`A${lRow}`).font = { bold: true, color: { argb: t.primaryFont } };
  wsLaba.getCell(`A${lRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.secondaryFill } };
  wsLaba.getCell(`B${lRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.secondaryFill } };
  lRow++;

  let totRev = 0;
  (labaRugiData.revenues || []).forEach((rev) => {
    wsLaba.getCell(`A${lRow}`).value = `  ${rev.name}`;
    wsLaba.getCell(`B${lRow}`).value = Number(rev.amount);
    wsLaba.getCell(`B${lRow}`).numFmt = 'Rp #,##0';
    wsLaba.getCell(`A${lRow}`).border = thinBorder;
    wsLaba.getCell(`B${lRow}`).border = thinBorder;
    totRev += Number(rev.amount);
    lRow++;
  });

  wsLaba.getCell(`A${lRow}`).value = 'Total Pendapatan';
  wsLaba.getCell(`A${lRow}`).font = { bold: true };
  wsLaba.getCell(`B${lRow}`).value = totRev;
  wsLaba.getCell(`B${lRow}`).numFmt = 'Rp #,##0';
  wsLaba.getCell(`B${lRow}`).font = { bold: true };
  wsLaba.getCell(`A${lRow}`).border = thinBorder;
  wsLaba.getCell(`B${lRow}`).border = thinBorder;
  lRow += 2;

  // Beban Section
  wsLaba.getCell(`A${lRow}`).value = 'BEBAN OPERASIONAL';
  wsLaba.getCell(`A${lRow}`).font = { bold: true, color: { argb: t.primaryFont } };
  wsLaba.getCell(`A${lRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.secondaryFill } };
  wsLaba.getCell(`B${lRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.secondaryFill } };
  lRow++;

  let totExp = 0;
  (labaRugiData.expenses || []).forEach((exp) => {
    wsLaba.getCell(`A${lRow}`).value = `  ${exp.name}`;
    wsLaba.getCell(`B${lRow}`).value = Number(exp.amount);
    wsLaba.getCell(`B${lRow}`).numFmt = 'Rp #,##0';
    wsLaba.getCell(`A${lRow}`).border = thinBorder;
    wsLaba.getCell(`B${lRow}`).border = thinBorder;
    totExp += Number(exp.amount);
    lRow++;
  });

  wsLaba.getCell(`A${lRow}`).value = 'Total Beban Operasional';
  wsLaba.getCell(`A${lRow}`).font = { bold: true };
  wsLaba.getCell(`B${lRow}`).value = totExp;
  wsLaba.getCell(`B${lRow}`).numFmt = 'Rp #,##0';
  wsLaba.getCell(`B${lRow}`).font = { bold: true };
  wsLaba.getCell(`A${lRow}`).border = thinBorder;
  wsLaba.getCell(`B${lRow}`).border = thinBorder;
  lRow += 2;

  // Laba Bersih
  const net = totRev - totExp;
  wsLaba.getCell(`A${lRow}`).value = 'LABA BERSIH (NET INCOME)';
  wsLaba.getCell(`A${lRow}`).font = { size: 12, bold: true };
  wsLaba.getCell(`B${lRow}`).value = net;
  wsLaba.getCell(`B${lRow}`).numFmt = 'Rp #,##0';
  wsLaba.getCell(`B${lRow}`).font = { size: 12, bold: true };
  wsLaba.getCell(`A${lRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.totalFill } };
  wsLaba.getCell(`B${lRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: t.totalFill } };
  wsLaba.getCell(`A${lRow}`).border = doubleBottomBorder;
  wsLaba.getCell(`B${lRow}`).border = doubleBottomBorder;

  wsLaba.getColumn(1).width = 40;
  wsLaba.getColumn(2).width = 25;

  await saveWorkbook(wb, filename);
}

// 3. GENERATE SLIP GAJI & REKAP PAYROLL PPh 21 TER 2024
export async function exportPayrollExcel({
  companyName = 'PT Sahabat Sejahtera',
  period = 'Agustus 2026',
  employees = [],
  filename = 'Rekap_Payroll_PPh21_TER.xlsx'
}) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Rekap Payroll Karyawan', { views: [{ showGridLines: true }] });

  ws.mergeCells('A1:J1');
  ws.getCell('A1').value = `${companyName} - DAFTAR REKAP GAJI & PPh 21 TER`;
  ws.getCell('A1').font = { size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8357EB' } };
  ws.getCell('A1').alignment = { horizontal: 'center' };

  ws.mergeCells('A2:J2');
  ws.getCell('A2').value = `Periode: ${period} • Skema Tarif Efektif Rata-Rata (PP 58/2023)`;
  ws.getCell('A2').alignment = { horizontal: 'center' };

  const headers = [
    'No', 'Nama Karyawan', 'Jabatan', 'PTKP', 'Kategori TER',
    'Gaji Pokok', 'Tunjangan', 'Potongan BPJS', 'PPh 21 TER', 'Take Home Pay'
  ];

  headers.forEach((h, i) => {
    const c = ws.getRow(4).getCell(i + 1);
    c.value = h;
    c.font = { bold: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8D7FF' } };
    c.alignment = { horizontal: 'center' };
    c.border = thinBorder;
  });

  employees.forEach((emp, idx) => {
    const row = ws.getRow(5 + idx);
    row.getCell(1).value = idx + 1;
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(2).value = emp.name;
    row.getCell(3).value = emp.role;
    row.getCell(4).value = emp.ptkp;
    row.getCell(4).alignment = { horizontal: 'center' };
    row.getCell(5).value = `TER ${emp.terCategory} (${emp.terRate}%)`;
    row.getCell(5).alignment = { horizontal: 'center' };

    row.getCell(6).value = emp.baseSalary;
    row.getCell(6).numFmt = '#,##0';

    row.getCell(7).value = emp.allowance;
    row.getCell(7).numFmt = '#,##0';

    row.getCell(8).value = emp.bpjs;
    row.getCell(8).numFmt = '#,##0';

    row.getCell(9).value = emp.pph21;
    row.getCell(9).numFmt = '#,##0';

    row.getCell(10).value = emp.takeHomePay;
    row.getCell(10).numFmt = 'Rp #,##0';
    row.getCell(10).font = { bold: true };

    for (let c = 1; c <= 10; c++) row.getCell(c).border = thinBorder;
  });

  const totRow = ws.getRow(5 + employees.length);
  totRow.getCell(3).value = 'TOTAL PAYROLL';
  totRow.getCell(3).font = { bold: true };
  totRow.getCell(6).value = { formula: `SUM(F5:F${4 + employees.length})` };
  totRow.getCell(6).numFmt = 'Rp #,##0';
  totRow.getCell(7).value = { formula: `SUM(G5:G${4 + employees.length})` };
  totRow.getCell(7).numFmt = 'Rp #,##0';
  totRow.getCell(9).value = { formula: `SUM(I5:I${4 + employees.length})` };
  totRow.getCell(9).numFmt = 'Rp #,##0';
  totRow.getCell(10).value = { formula: `SUM(J5:J${4 + employees.length})` };
  totRow.getCell(10).numFmt = 'Rp #,##0';
  totRow.getCell(10).font = { bold: true };

  for (let c = 1; c <= 10; c++) {
    totRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD1E8' } };
    totRow.getCell(c).border = doubleBottomBorder;
  }

  autoFitColumns(ws);
  await saveWorkbook(wb, filename);
}

// 4. GENERATE KWITANSI RESMI EXCEL
export async function exportReceiptExcel({
  receiptNo = 'KW-2026/08/001',
  date = '18 Agustus 2026',
  payer = 'Bobby Chandra',
  amount = 15000000,
  purpose = 'Pembayaran 1 Unit Mesin Espresso dan Pelatihan Barista',
  receiver = 'CV Berkah Sentosa',
  filename = 'Kwitansi_Resmi.xlsx'
}) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Kwitansi', { views: [{ showGridLines: true }] });

  ws.mergeCells('A1:F1');
  ws.getCell('A1').value = 'KWITANSI TANDA TERIMA PEMBAYARAN';
  ws.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF659F' } };
  ws.getCell('A1').alignment = { horizontal: 'center' };

  ws.getCell('A3').value = 'Nomor Kwitansi:';
  ws.getCell('B3').value = receiptNo;
  ws.getCell('B3').font = { bold: true };

  ws.getCell('E3').value = 'Tanggal:';
  ws.getCell('F3').value = date;

  ws.getCell('A5').value = 'Sudah Terima Dari:';
  ws.mergeCells('B5:F5');
  ws.getCell('B5').value = payer;
  ws.getCell('B5').font = { bold: true, size: 12 };

  ws.getCell('A7').value = 'Banyaknya Uang:';
  ws.mergeCells('B7:F7');
  ws.getCell('B7').value = amount;
  ws.getCell('B7').numFmt = 'Rp #,##0';
  ws.getCell('B7').font = { bold: true, size: 14, color: { argb: 'FF179C78' } };

  ws.getCell('A9').value = 'Terbilang:';
  ws.mergeCells('B9:F9');
  ws.getCell('B9').value = `${amount.toLocaleString('id-ID')} Rupiah`;
  ws.getCell('B9').font = { italic: true };

  ws.getCell('A11').value = 'Untuk Pembayaran:';
  ws.mergeCells('B11:F11');
  ws.getCell('B11').value = purpose;

  ws.getCell('E14').value = 'Penerima:';
  ws.getCell('E17').value = receiver;
  ws.getCell('E17').font = { bold: true, underline: true };

  ws.getColumn(1).width = 20;
  ws.getColumn(2).width = 18;
  ws.getColumn(3).width = 18;
  ws.getColumn(4).width = 18;
  ws.getColumn(5).width = 18;
  ws.getColumn(6).width = 22;

  await saveWorkbook(wb, filename);
}
