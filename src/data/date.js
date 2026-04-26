export function getTodayKey() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
}

export function formatDisplay(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Asia/Dhaka',
  });
}

export function daysUntil(dateStr) {
  const today = getTodayKey();
  const diff = new Date(dateStr).getTime() - new Date(today).getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today!';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return `${Math.abs(days)}d ago`;
  return `In ${days} days`;
}

export function formatTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Dhaka',
  });
}