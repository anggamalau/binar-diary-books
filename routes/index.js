const express = require('express');
const { authMiddleware, guestOnly } = require('../middleware/auth');
const database = require('../config/database');
const { getCalendarData, parseMonthYear, getNavigationData } = require('../utils/calendar');
const DiaryEntry = require('../models/DiaryEntry');

const router = express.Router();

router.get('/', guestOnly, (req, res) => {
  res.render('index', {
    title: 'Welcome'
  });
});

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const calendarData = getCalendarData(currentYear, currentMonth);
    const navigationData = getNavigationData(currentYear, currentMonth);

    // Get entry counts for the current month
    const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-31`;
    const entryCounts = await DiaryEntry.getEntryCounts(req.user.id, startDate, endDate);

    res.render('dashboard', {
      title: 'Dashboard',
      user: req.user,
      calendar: calendarData,
      navigation: navigationData,
      currentDate: { year: currentYear, month: currentMonth },
      entryCounts: entryCounts
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load dashboard',
      error: {}
    });
  }
});

router.get('/calendar/:year/:month', authMiddleware, async (req, res) => {
  try {
    const parsed = parseMonthYear(req.params.month, req.params.year);

    if (!parsed) {
      return res.redirect('/dashboard');
    }

    const { month, year } = parsed;
    const calendarData = getCalendarData(year, month);
    const navigationData = getNavigationData(year, month);

    // Get entry counts for the selected month
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;
    const entryCounts = await DiaryEntry.getEntryCounts(req.user.id, startDate, endDate);

    res.render('dashboard', {
      title: 'Dashboard',
      user: req.user,
      calendar: calendarData,
      navigation: navigationData,
      currentDate: { year, month },
      entryCounts: entryCounts
    });
  } catch (error) {
    console.error('Error loading calendar:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load calendar',
      error: {}
    });
  }
});

module.exports = router;
