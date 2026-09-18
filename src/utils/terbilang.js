// Terbilang Bahasa Indonesia
export function terbilang(n) {
  const bilangan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  const num = Math.floor(Math.abs(Number(n) || 0));

  if (num === 0) return 'Nol Rupiah';

  function convert(x) {
    if (x < 12) return bilangan[x];
    if (x < 20) return convert(x - 10) + ' Belas';
    if (x < 100) return convert(Math.floor(x / 10)) + ' Puluh ' + convert(x % 10);
    if (x < 200) return 'Seratus ' + convert(x - 100);
    if (x < 1000) return convert(Math.floor(x / 100)) + ' Ratus ' + convert(x % 100);
    if (x < 2000) return 'Seribu ' + convert(x - 1000);
    if (x < 1000000) return convert(Math.floor(x / 1000)) + ' Ribu ' + convert(x % 1000);
    if (x < 1000000000) return convert(Math.floor(x / 1000000)) + ' Juta ' + convert(x % 1000000);
    if (x < 1000000000000) return convert(Math.floor(x / 1000000000)) + ' Miliar ' + convert(x % 1000000000);
    return convert(Math.floor(x / 1000000000000)) + ' Triliun ' + convert(x % 1000000000000);
  }

  return (convert(num) + ' Rupiah').replace(/\s+/g, ' ').trim();
}

export function formatRupiah(num) {
  const val = Number(num) || 0;
  return 'Rp ' + val.toLocaleString('id-ID');
}
