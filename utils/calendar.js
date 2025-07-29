const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getCalendarData(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const weeks = [];
  let currentWeek = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    currentWeek.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push({
      day: day,
      date: new Date(year, month, day),
      isToday: isToday(year, month, day),
      dateString: formatDateString(year, month, day)
    });

    // If we've filled a week (7 days), start a new week
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill the last week with empty cells if needed
  while (currentWeek.length > 0 && currentWeek.length < 7) {
    currentWeek.push(null);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return {
    year,
    month,
    monthName: monthNames[month],
    weeks,
    firstDay,
    lastDay,
    daysInMonth
  };
}

function isToday(year, month, day) {
  const today = new Date();
  return today.getFullYear() === year &&
         today.getMonth() === month &&
         today.getDate() === day;
}

function formatDateString(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseMonthYear(monthStr, yearStr) {
  const month = parseInt(monthStr);
  const year = parseInt(yearStr);

  // Validate month and year
  if (isNaN(month) || month < 0 || month > 11) {
    return null;
  }

  if (isNaN(year) || year < 1900 || year > 2100) {
    return null;
  }

  return { month, year };
}

function getNavigationData(year, month) {
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;

  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  return {
    prev: { month: prevMonth, year: prevYear },
    next: { month: nextMonth, year: nextYear }
  };
}

module.exports = {
  monthNames,
  dayNames,
  getCalendarData,
  isToday,
  formatDateString,
  parseMonthYear,
  getNavigationData
};
