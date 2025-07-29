const express = require('express');
const { authMiddleware, guestOnly } = require('../middleware/auth');
const database = require('../config/database');
const { getCalendarData, parseMonthYear, getNavigationData } = require('../utils/calendar');

const router = express.Router();

router.get('/', guestOnly, (req, res) => {
  res.render('index', {
    title: 'Welcome'
  });
});

router.get('/dashboard', authMiddleware, (req, res) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const calendarData = getCalendarData(currentYear, currentMonth);
  const navigationData = getNavigationData(currentYear, currentMonth);

  res.render('dashboard', {
    title: 'Dashboard',
    user: req.user,
    calendar: calendarData,
    navigation: navigationData,
    currentDate: { year: currentYear, month: currentMonth }
  });
});

router.get('/calendar/:year/:month', authMiddleware, (req, res) => {
  const parsed = parseMonthYear(req.params.month, req.params.year);
  
  if (!parsed) {
    return res.redirect('/dashboard');
  }

  const { month, year } = parsed;
  const calendarData = getCalendarData(year, month);
  const navigationData = getNavigationData(year, month);

  res.render('dashboard', {
    title: 'Dashboard',
    user: req.user,
    calendar: calendarData,
    navigation: navigationData,
    currentDate: { year, month }
  });
});

module.exports = router;