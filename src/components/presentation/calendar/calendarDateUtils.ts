export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  return day === 0 ? 6 : day - 1;
}

export function formatDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getStartOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  // We want Monday as start of week
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDay(date1: Date, date2: Date) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

export function generateDaysForView(currentDate: Date, viewType: 'week' | 'month') {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  if (viewType === 'week') {
    const startOfWeek = getStartOfWeek(currentDate);
    return Array.from({ length: 7 }).map((_, i) => addDays(startOfWeek, i));
  }

  if (viewType === 'month') {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days: Date[] = [];
    
    // Previous month padding
    for (let i = 0; i < firstDay; i++) {
      const prevDate = new Date(year, month, 0 - (firstDay - i - 1));
      days.push(prevDate);
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Next month padding to complete week rows (up to 42 cells)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  }

  return [];
}
