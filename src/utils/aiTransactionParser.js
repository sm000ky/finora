// Smart Transaction Parser (Hybrid: Local Rule Engine + Optional 9router AI Endpoint)

// Helper: parse Indonesian numbers (e.g. "60jt", "16 juta", "500rb", "190.000", "2,4 jt")
export function parseNominal(text) {
  if (!text) return 0;
  const clean = text.toLowerCase().replace(/rp\.?/g, '').trim();

  // Match "15.5 jt" or "15 juta"
  const jutaMatch = clean.match(/([\d.,]+)\s*(jt|juta)/);
  if (jutaMatch) {
    const val = parseFloat(jutaMatch[1].replace(/\./g, '').replace(',', '.'));
    return Math.round(val * 1000000);
  }

  // Match "500 rb" or "500 ribu"
  const ribuMatch = clean.match(/([\d.,]+)\s*(rb|ribu|k\b)/);
  if (ribuMatch) {
    const val = parseFloat(ribuMatch[1].replace(/\./g, '').replace(',', '.'));
    return Math.round(val * 1000);
  }

  // Pure digits with dot/comma
  const digits = clean.replace(/[^\d]/g, '');
  return parseInt(digits, 10) || 0;
}

// Built-in Smart Rule Engine (100% Offline, Instant, Zero-latency)
export function parseTextLocally(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const result = [];
  let idCounter = 1;

  lines.forEach((line) => {
    const lower = line.toLowerCase();

    // Extract Date if present
    const dateMatch = line.match(/^(\d{1,2}[-\s]?[A-Za-z]{3,9}|\d{1,2}[-\/]\d{1,2})/);
    const date = dateMatch ? dateMatch[1] : '';

    const nominal = parseNominal(line);
    if (nominal <= 0) return;

    // Rule: Modal Awal / Setor Modal
    if (lower.includes('modal') || lower.includes('investasi') || lower.includes('setor kas')) {
      result.push(
        { id: String(idCounter++), date: date || '01-Jan', account: 'Kas', ref: '101', debit: nominal, credit: 0 },
        { id: String(idCounter++), date: '', account: '    Modal Pemilik', ref: '301', debit: 0, credit: nominal }
      );
    }
    // Rule: Beli Peralatan / Mesin / Aset
    else if (lower.includes('peralatan') || lower.includes('mesin') || lower.includes('etalase') || lower.includes('laptop') || lower.includes('galon')) {
      const isGalon = lower.includes('galon');
      const accName = isGalon ? 'Peralatan Galon' : 'Peralatan Toko';
      const refCode = isGalon ? '123' : '121';
      result.push(
        { id: String(idCounter++), date: date || '02-Jan', account: accName, ref: refCode, debit: nominal, credit: 0 },
        { id: String(idCounter++), date: '', account: '    Kas', ref: '101', debit: 0, credit: nominal }
      );
    }
    // Rule: Beli Kendaraan / Motor
    else if (lower.includes('kendaraan') || lower.includes('motor') || lower.includes('mobil') || lower.includes('vario')) {
      result.push(
        { id: String(idCounter++), date: date || '03-Jan', account: 'Kendaraan', ref: '122', debit: nominal, credit: 0 },
        { id: String(idCounter++), date: '', account: '    Kas', ref: '101', debit: 0, credit: nominal }
      );
    }
    // Rule: Beli Perlengkapan
    else if (lower.includes('perlengkapan') || lower.includes('alat tulis') || lower.includes('atk') || lower.includes('tutup galon')) {
      result.push(
        { id: String(idCounter++), date: date || '05-Jan', account: 'Perlengkapan', ref: '131', debit: nominal, credit: 0 },
        { id: String(idCounter++), date: '', account: '    Kas', ref: '101', debit: 0, credit: nominal }
      );
    }
    // Rule: Omzet / Penjualan / Pendapatan Jasa
    else if (lower.includes('omzet') || lower.includes('penjualan') || lower.includes('laku') || lower.includes('terjual') || lower.includes('pendapatan')) {
      const isJasa = lower.includes('jasa') || lower.includes('desain');
      const accName = isJasa ? '    Pendapatan Jasa' : '    Pendapatan Penjualan';
      const refCode = isJasa ? '402' : '401';
      result.push(
        { id: String(idCounter++), date: date || '31-Jan', account: 'Kas', ref: '101', debit: nominal, credit: 0 },
        { id: String(idCounter++), date: '', account: accName, ref: refCode, debit: 0, credit: nominal }
      );
    }
    // Rule: Beban Air Tangki / Bahan Baku
    else if (lower.includes('air tangki') || lower.includes('bahan baku') || lower.includes('supplier')) {
      result.push(
        { id: String(idCounter++), date: date || '31-Jan', account: 'Beban Air Tangki', ref: '503', debit: nominal, credit: 0 },
        { id: String(idCounter++), date: '', account: '    Kas', ref: '101', debit: 0, credit: nominal }
      );
    }
    // Rule: Beban Listrik / PLN / Wifi / Internet
    else if (lower.includes('listrik') || lower.includes('pln') || lower.includes('wifi') || lower.includes('internet')) {
      result.push(
        { id: String(idCounter++), date: date || '31-Jan', account: 'Beban Listrik', ref: '501', debit: nominal, credit: 0 },
        { id: String(idCounter++), date: '', account: '    Kas', ref: '101', debit: 0, credit: nominal }
      );
    }
    // Rule: Beban Bensin / Transport
    else if (lower.includes('bensin') || lower.includes('transport') || lower.includes('bbm') || lower.includes('ongkir')) {
      result.push(
        { id: String(idCounter++), date: date || '31-Jan', account: 'Beban Bensin', ref: '502', debit: nominal, credit: 0 },
        { id: String(idCounter++), date: '', account: '    Kas', ref: '101', debit: 0, credit: nominal }
      );
    }
    // Rule: Prive Owner
    else if (lower.includes('prive') || lower.includes('pribadi') || lower.includes('tarik owner') || lower.includes('keperluan pribadi')) {
      result.push(
        { id: String(idCounter++), date: date || '31-Jan', account: 'Prive Owner', ref: '302', debit: nominal, credit: 0 },
        { id: String(idCounter++), date: '', account: '    Kas', ref: '101', debit: 0, credit: nominal }
      );
    }
    // Generic Expense fallback
    else {
      result.push(
        { id: String(idCounter++), date: date || '31-Jan', account: 'Beban Operasional Lain', ref: '519', debit: nominal, credit: 0 },
        { id: String(idCounter++), date: '', account: '    Kas', ref: '101', debit: 0, credit: nominal }
      );
    }
  });

  return result;
}

// AI Remote Parser (Calls local / remote OpenAI-compatible endpoint)
export async function parseWithAI(rawText, endpointUrl = 'http://localhost:20127/v1/chat/completions', apiKey = '') {
  try {
    const prompt = `Anda adalah akuntan ahli Indonesia. Ekstrak teks transaksi mentah berikut menjadi baris Jurnal Umum berpasangan (Debit dan Kredit harus BALANCE).
Format output HANYA JSON array tanpa markdown:
[
  { "date": "01-Jan", "account": "Kas", "ref": "101", "debit": 60000000, "credit": 0 },
  { "date": "", "account": "    Modal", "ref": "301", "debit": 0, "credit": 60000000 }
]
Akun kredit HARUS diawali 4 spasi ("    ").

Teks Transaksi:
${rawText}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify({
        model: 'ag/gemini-3.8-flash-high',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`AI request status ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item, idx) => ({
        id: String(idx + 1),
        date: item.date || '',
        account: item.account || '',
        ref: item.ref || '',
        debit: Number(item.debit) || 0,
        credit: Number(item.credit) || 0
      }));
    }
  } catch (err) {
    console.warn('AI parsing unavailable, falling back to smart local parser:', err.message);
  }

  // Fallback to local heuristic
  return parseTextLocally(rawText);
}
