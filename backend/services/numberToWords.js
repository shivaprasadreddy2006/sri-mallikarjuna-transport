/**
 * Converts a numeric amount to Indian Currency words
 * Format: "Twenty nine thousand five hundred only"
 */

const ones = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const tens = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function twoDigitsToWords(n) {
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return tens[t] + (o > 0 ? ' ' + ones[o] : '');
}

function threeDigitsToWords(n) {
  const h = Math.floor(n / 100);
  const rem = n % 100;
  let result = '';
  if (h > 0) {
    result += ones[h] + ' Hundred';
    if (rem > 0) result += ' ';
  }
  if (rem > 0) {
    result += twoDigitsToWords(rem);
  }
  return result;
}

function numberToIndianWords(amount) {
  if (amount === 0 || isNaN(amount)) return 'Zero only';

  const num = Math.round(Number(amount));
  if (num < 0) return 'Minus ' + numberToIndianWords(Math.abs(num));

  // Indian numbering: Crores (10,000,000), Lakhs (100,000), Thousands (1,000), Hundreds (100)
  const crore = Math.floor(num / 10000000);
  const remCrore = num % 10000000;

  const lakh = Math.floor(remCrore / 100000);
  const remLakh = remCrore % 100000;

  const thousand = Math.floor(remLakh / 1000);
  const remThousand = remLakh % 1000;

  const parts = [];

  if (crore > 0) {
    parts.push(twoDigitsToWords(crore) + ' Crore');
  }
  if (lakh > 0) {
    parts.push(twoDigitsToWords(lakh) + ' Lakh');
  }
  if (thousand > 0) {
    parts.push(twoDigitsToWords(thousand) + ' Thousand');
  }
  if (remThousand > 0) {
    parts.push(threeDigitsToWords(remThousand));
  }

  const text = parts.join(' ').trim();
  // Capitalize properly and append "only"
  if (!text) return 'Zero only';
  return text.charAt(0).toUpperCase() + text.slice(1) + ' only';
}

module.exports = {
  numberToIndianWords,
};
