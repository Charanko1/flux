export const parseDateIDN = (dateString: string): Date | null => {
  if (!dateString) return null;
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) return date;

  const monthsMap: { [key: string]: string } = {
    'januari': 'January', 'februari': 'February', 'maret': 'March', 
    'april': 'April', 'mei': 'May', 'juni': 'June', 
    'juli': 'July', 'agustus': 'August', 'september': 'September', 
    'oktober': 'October', 'november': 'November', 'desember': 'December',
    'jan': 'January', 'feb': 'February', 'mar': 'March', 'apr': 'April',
    'jun': 'June', 'jul': 'July', 'agu': 'August', 'agt': 'August',
    'sep': 'September', 'sept': 'September', 'okt': 'October', 'oct': 'October',
    'nov': 'November', 'des': 'December', 'dec': 'December'
  };

  let englishDateStr = dateString.toLowerCase();
  for (const [key, value] of Object.entries(monthsMap)) {
    if (englishDateStr.includes(key)) {
      englishDateStr = englishDateStr.replace(key, value);
      break;
    }
  }
  date = new Date(englishDateStr);
  return isNaN(date.getTime()) ? null : date;
};

export const formatCurrencyHistory = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(Math.abs(amount));
};

export const getMonthYear = (dateString: string): string => {
  try {
    const date = parseDateIDN(dateString);
    if (!date) return ''; 
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  } catch (e) {
    return '';
  }
};