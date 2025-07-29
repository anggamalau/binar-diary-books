const {
  monthNames,
  dayNames,
  getCalendarData,
  isToday,
  formatDateString,
  parseMonthYear,
  getNavigationData
} = require('../../utils/calendar');

describe('Calendar Utilities', () => {
  beforeEach(() => {
    // Mock Date to ensure consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('monthNames and dayNames constants', () => {
    test('should have correct month names', () => {
      expect(monthNames).toHaveLength(12);
      expect(monthNames[0]).toBe('January');
      expect(monthNames[11]).toBe('December');
      expect(monthNames).toEqual([
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]);
    });

    test('should have correct day names', () => {
      expect(dayNames).toHaveLength(7);
      expect(dayNames[0]).toBe('Sun');
      expect(dayNames[6]).toBe('Sat');
      expect(dayNames).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    });
  });

  describe('getCalendarData', () => {
    test('should generate correct calendar data for January 2024', () => {
      const result = getCalendarData(2024, 0); // January is month 0
      
      expect(result.year).toBe(2024);
      expect(result.month).toBe(0);
      expect(result.monthName).toBe('January');
      expect(result.daysInMonth).toBe(31);
      expect(result.firstDay).toEqual(new Date(2024, 0, 1));
      expect(result.lastDay).toEqual(new Date(2024, 0, 31));
      expect(result.weeks).toBeInstanceOf(Array);
    });

    test('should generate correct calendar data for February 2024 (leap year)', () => {
      const result = getCalendarData(2024, 1); // February is month 1
      
      expect(result.year).toBe(2024);
      expect(result.month).toBe(1);
      expect(result.monthName).toBe('February');
      expect(result.daysInMonth).toBe(29); // Leap year
      expect(result.firstDay).toEqual(new Date(2024, 1, 1));
      expect(result.lastDay).toEqual(new Date(2024, 1, 29));
    });

    test('should generate correct calendar data for February 2023 (non-leap year)', () => {
      const result = getCalendarData(2023, 1); // February is month 1
      
      expect(result.year).toBe(2023);
      expect(result.month).toBe(1);
      expect(result.monthName).toBe('February');
      expect(result.daysInMonth).toBe(28); // Non-leap year
    });

    test('should have correct week structure', () => {
      const result = getCalendarData(2024, 0); // January 2024
      
      // Each week should have 7 elements (including nulls for empty days)
      result.weeks.forEach(week => {
        expect(week).toHaveLength(7);
      });
      
      // Should have the right number of weeks (January 2024 has 5 weeks)
      expect(result.weeks).toHaveLength(5);
    });

    test('should correctly place days in weeks', () => {
      const result = getCalendarData(2024, 0); // January 2024
      
      // January 1, 2024 is a Monday (index 1)
      const firstWeek = result.weeks[0];
      expect(firstWeek[0]).toBeNull(); // Sunday should be null
      expect(firstWeek[1]).toMatchObject({ day: 1 }); // Monday should be day 1
      
      // Check that day 15 has isToday set to true (mocked date is Jan 15, 2024)
      const dayFifteen = result.weeks.flat().find(day => day && day.day === 15);
      expect(dayFifteen.isToday).toBe(true);
    });

    test('should generate correct date strings', () => {
      const result = getCalendarData(2024, 0); // January 2024
      
      const firstDayData = result.weeks.flat().find(day => day && day.day === 1);
      expect(firstDayData.dateString).toBe('2024-01-01');
      
      const lastDayData = result.weeks.flat().find(day => day && day.day === 31);
      expect(lastDayData.dateString).toBe('2024-01-31');
    });

    test('should handle month with different starting days', () => {
      // March 2024 starts on a Friday
      const result = getCalendarData(2024, 2); // March is month 2
      const firstWeek = result.weeks[0];
      
      // Should have 5 null days at the beginning (Sun-Thu)
      expect(firstWeek.slice(0, 5).every(day => day === null)).toBe(true);
      expect(firstWeek[5]).toMatchObject({ day: 1 }); // Friday should be day 1
    });
  });

  describe('isToday', () => {
    test('should return true for current date', () => {
      // Mocked date is 2024-01-15
      const result = isToday(2024, 0, 15); // January 15, 2024
      expect(result).toBe(true);
    });

    test('should return false for different date', () => {
      const result = isToday(2024, 0, 16); // January 16, 2024
      expect(result).toBe(false);
    });

    test('should return false for different month', () => {
      const result = isToday(2024, 1, 15); // February 15, 2024
      expect(result).toBe(false);
    });

    test('should return false for different year', () => {
      const result = isToday(2023, 0, 15); // January 15, 2023
      expect(result).toBe(false);
    });

    test('should handle edge cases', () => {
      expect(isToday(2024, 0, 0)).toBe(false); // Invalid day
      expect(isToday(2024, -1, 15)).toBe(false); // Invalid month
      expect(isToday(0, 0, 15)).toBe(false); // Invalid year
    });
  });

  describe('formatDateString', () => {
    test('should format date correctly with zero padding', () => {
      expect(formatDateString(2024, 0, 1)).toBe('2024-01-01');
      expect(formatDateString(2024, 0, 15)).toBe('2024-01-15');
      expect(formatDateString(2024, 11, 31)).toBe('2024-12-31');
    });

    test('should handle single-digit months and days', () => {
      expect(formatDateString(2024, 5, 7)).toBe('2024-06-07'); // June 7
      expect(formatDateString(2024, 8, 3)).toBe('2024-09-03'); // September 3
    });

    test('should handle edge cases', () => {
      expect(formatDateString(1999, 0, 1)).toBe('1999-01-01');
      expect(formatDateString(2100, 11, 31)).toBe('2100-12-31');
    });

    test('should handle month index correctly', () => {
      // Remember: month parameter is 0-indexed
      expect(formatDateString(2024, 0, 1)).toBe('2024-01-01'); // January
      expect(formatDateString(2024, 11, 1)).toBe('2024-12-01'); // December
    });
  });

  describe('parseMonthYear', () => {
    test('should parse valid month and year strings', () => {
      const result = parseMonthYear('5', '2024');
      expect(result).toEqual({ month: 5, year: 2024 });
    });

    test('should parse string numbers correctly', () => {
      const result = parseMonthYear('0', '2023');
      expect(result).toEqual({ month: 0, year: 2023 });
    });

    test('should return null for invalid month (too high)', () => {
      const result = parseMonthYear('12', '2024');
      expect(result).toBeNull();
    });

    test('should return null for invalid month (negative)', () => {
      const result = parseMonthYear('-1', '2024');
      expect(result).toBeNull();
    });

    test('should return null for invalid year (too low)', () => {
      const result = parseMonthYear('5', '1899');
      expect(result).toBeNull();
    });

    test('should return null for invalid year (too high)', () => {
      const result = parseMonthYear('5', '2101');
      expect(result).toBeNull();
    });

    test('should return null for non-numeric month', () => {
      const result = parseMonthYear('abc', '2024');
      expect(result).toBeNull();
    });

    test('should return null for non-numeric year', () => {
      const result = parseMonthYear('5', 'xyz');
      expect(result).toBeNull();
    });

    test('should handle edge cases for valid range', () => {
      expect(parseMonthYear('0', '1900')).toEqual({ month: 0, year: 1900 });
      expect(parseMonthYear('11', '2100')).toEqual({ month: 11, year: 2100 });
    });

    test('should handle empty strings', () => {
      expect(parseMonthYear('', '2024')).toBeNull();
      expect(parseMonthYear('5', '')).toBeNull();
      expect(parseMonthYear('', '')).toBeNull();
    });
  });

  describe('getNavigationData', () => {
    test('should calculate previous and next month correctly', () => {
      const result = getNavigationData(2024, 5); // June 2024
      
      expect(result.prev).toEqual({ month: 4, year: 2024 }); // May 2024
      expect(result.next).toEqual({ month: 6, year: 2024 }); // July 2024
    });

    test('should handle year transition for January', () => {
      const result = getNavigationData(2024, 0); // January 2024
      
      expect(result.prev).toEqual({ month: 11, year: 2023 }); // December 2023
      expect(result.next).toEqual({ month: 1, year: 2024 }); // February 2024
    });

    test('should handle year transition for December', () => {
      const result = getNavigationData(2024, 11); // December 2024
      
      expect(result.prev).toEqual({ month: 10, year: 2024 }); // November 2024
      expect(result.next).toEqual({ month: 0, year: 2025 }); // January 2025
    });

    test('should handle edge years', () => {
      const result1 = getNavigationData(1900, 0); // January 1900
      expect(result1.prev).toEqual({ month: 11, year: 1899 }); // December 1899
      
      const result2 = getNavigationData(2100, 11); // December 2100
      expect(result2.next).toEqual({ month: 0, year: 2101 }); // January 2101
    });

    test('should work for all months', () => {
      for (let month = 0; month < 12; month++) {
        const result = getNavigationData(2024, month);
        
        expect(result.prev).toHaveProperty('month');
        expect(result.prev).toHaveProperty('year');
        expect(result.next).toHaveProperty('month');
        expect(result.next).toHaveProperty('year');
        
        // Validate month ranges
        expect(result.prev.month).toBeGreaterThanOrEqual(0);
        expect(result.prev.month).toBeLessThanOrEqual(11);
        expect(result.next.month).toBeGreaterThanOrEqual(0);
        expect(result.next.month).toBeLessThanOrEqual(11);
      }
    });
  });

  describe('integration scenarios', () => {
    test('should work together for calendar generation workflow', () => {
      const year = 2024;
      const month = 2; // March
      
      // Parse month/year (simulating user input)
      const parsed = parseMonthYear(month.toString(), year.toString());
      expect(parsed).toEqual({ month, year });
      
      // Generate calendar data
      const calendarData = getCalendarData(parsed.year, parsed.month);
      expect(calendarData.monthName).toBe('March');
      
      // Get navigation data
      const navigation = getNavigationData(parsed.year, parsed.month);
      expect(navigation.prev).toEqual({ month: 1, year: 2024 }); // February
      expect(navigation.next).toEqual({ month: 3, year: 2024 }); // April
      
      // Verify date formatting
      const firstDay = calendarData.weeks.flat().find(day => day && day.day === 1);
      expect(firstDay.dateString).toBe(formatDateString(year, month, 1));
    });

    test('should handle leap year calculations correctly', () => {
      // Test leap year
      const feb2024 = getCalendarData(2024, 1);
      expect(feb2024.daysInMonth).toBe(29);
      
      // Test non-leap year
      const feb2023 = getCalendarData(2023, 1);
      expect(feb2023.daysInMonth).toBe(28);
      
      // Test century year that is not a leap year
      const feb1900 = getCalendarData(1900, 1);
      expect(feb1900.daysInMonth).toBe(28);
      
      // Test century year that is a leap year
      const feb2000 = getCalendarData(2000, 1);
      expect(feb2000.daysInMonth).toBe(29);
    });
  });
});