// Kalkulator PPh 21 Skema TER (Tarif Efektif Rata-Rata) PP 58/2023 & PMK 168/2023

export const PTKP_LIST = [
  { code: 'TK/0', name: 'Tidak Kawin - Tanpa Tanggungan', terCategory: 'A' },
  { code: 'TK/1', name: 'Tidak Kawin - 1 Tanggungan', terCategory: 'A' },
  { code: 'TK/2', name: 'Tidak Kawin - 2 Tanggungan', terCategory: 'B' },
  { code: 'TK/3', name: 'Tidak Kawin - 3 Tanggungan', terCategory: 'B' },
  { code: 'K/0', name: 'Kawin - Tanpa Tanggungan', terCategory: 'A' },
  { code: 'K/1', name: 'Kawin - 1 Tanggungan', terCategory: 'B' },
  { code: 'K/2', name: 'Kawin - 2 Tanggungan', terCategory: 'B' },
  { code: 'K/3', name: 'Kawin - 3 Tanggungan', terCategory: 'C' },
];

// Bracket TER A (Bulanan)
const TER_A_BRACKETS = [
  { max: 5400000, rate: 0 },
  { max: 5650000, rate: 0.25 },
  { max: 5950000, rate: 0.5 },
  { max: 6300000, rate: 0.75 },
  { max: 6750000, rate: 1.0 },
  { max: 7500000, rate: 1.25 },
  { max: 8550000, rate: 1.5 },
  { max: 9650000, rate: 1.75 },
  { max: 10050000, rate: 2.0 },
  { max: 10500000, rate: 2.25 },
  { max: 11000000, rate: 2.5 },
  { max: 12000000, rate: 3.0 },
  { max: 13000000, rate: 4.0 },
  { max: 14500000, rate: 5.0 },
  { max: 16000000, rate: 6.0 },
  { max: 17500000, rate: 7.0 },
  { max: 19500000, rate: 8.0 },
  { max: 21500000, rate: 9.0 },
  { max: 24000000, rate: 10.0 },
  { max: 27000000, rate: 11.0 },
  { max: 30000000, rate: 12.0 },
  { max: Infinity, rate: 15.0 },
];

// Bracket TER B (Bulanan)
const TER_B_BRACKETS = [
  { max: 6200000, rate: 0 },
  { max: 6500000, rate: 0.25 },
  { max: 6850000, rate: 0.5 },
  { max: 7300000, rate: 0.75 },
  { max: 9200000, rate: 1.0 },
  { max: 10750000, rate: 1.5 },
  { max: 12500000, rate: 2.0 },
  { max: 14000000, rate: 3.0 },
  { max: 16000000, rate: 4.0 },
  { max: 18000000, rate: 5.0 },
  { max: 21000000, rate: 7.0 },
  { max: 24000000, rate: 9.0 },
  { max: 28000000, rate: 11.0 },
  { max: 32000000, rate: 13.0 },
  { max: Infinity, rate: 16.0 },
];

// Bracket TER C (Bulanan)
const TER_C_BRACKETS = [
  { max: 6600000, rate: 0 },
  { max: 6950000, rate: 0.25 },
  { max: 7350000, rate: 0.5 },
  { max: 7800000, rate: 0.75 },
  { max: 8850000, rate: 1.0 },
  { max: 9800000, rate: 1.25 },
  { max: 10950000, rate: 1.5 },
  { max: 11200000, rate: 1.75 },
  { max: 12050000, rate: 2.0 },
  { max: 12950000, rate: 3.0 },
  { max: 14150000, rate: 4.0 },
  { max: 16000000, rate: 5.0 },
  { max: Infinity, rate: 14.0 },
];

export function getTerCategory(ptkpCode) {
  const item = PTKP_LIST.find((p) => p.code === ptkpCode);
  return item ? item.terCategory : 'A';
}

export function calculatePPh21Ter(brutoMonthly, ptkpCode) {
  const category = getTerCategory(ptkpCode);
  let brackets = TER_A_BRACKETS;
  if (category === 'B') brackets = TER_B_BRACKETS;
  if (category === 'C') brackets = TER_C_BRACKETS;

  const bracket = brackets.find((b) => brutoMonthly <= b.max) || brackets[brackets.length - 1];
  const rate = bracket.rate;
  const pph21Amount = Math.round(brutoMonthly * (rate / 100));

  return {
    category,
    rate,
    pph21: pph21Amount,
  };
}
