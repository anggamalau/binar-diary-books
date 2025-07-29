const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const DiaryEntry = require('../models/DiaryEntry');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Search entries
router.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    if (!searchTerm.trim()) {
      return res.render('entries/search', {
        title: 'Search Entries',
        user: req.user,
        entries: [],
        searchTerm: '',
        currentPage: 1,
        hasMore: false
      });
    }

    const entries = await DiaryEntry.searchByUser(req.user.id, searchTerm, limit + 1, offset);
    const hasMore = entries.length > limit;

    if (hasMore) {
      entries.pop();
    }

    res.render('entries/search', {
      title: 'Search Results',
      user: req.user,
      entries: entries,
      searchTerm: searchTerm,
      currentPage: page,
      hasMore: hasMore
    });
  } catch (error) {
    console.error('Error searching entries:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to search entries',
      error: {}
    });
  }
});

// View entries by tag
router.get('/tag/:tag', async (req, res) => {
  try {
    const tag = decodeURIComponent(req.params.tag);
    const entries = await DiaryEntry.findByUserAndTag(req.user.id, tag);

    res.render('entries/view-tag', {
      title: `Entries tagged: ${tag}`,
      user: req.user,
      entries: entries,
      tag: tag
    });
  } catch (error) {
    console.error('Error viewing entries by tag:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load entries',
      error: {}
    });
  }
});

// View entries for a specific date
router.get('/date/:date', async (req, res) => {
  try {
    const date = req.params.date;

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.redirect('/dashboard');
    }

    const entries = await DiaryEntry.findByUserAndDate(req.user.id, date);

    res.render('entries/view-date', {
      title: 'Diary Entries',
      user: req.user,
      entries: entries,
      date: date,
      formattedDate: formatDateForDisplay(date),
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Error viewing entries:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load diary entries',
      error: {}
    });
  }
});

// Create new entry form
router.get('/new/:date', (req, res) => {
  const date = req.params.date;

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.redirect('/dashboard');
  }

  res.render('entries/create', {
    title: 'New Diary Entry',
    user: req.user,
    date: date,
    formattedDate: formatDateForDisplay(date)
  });
});

// Create new entry (POST)
router.post('/create', [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('entry_date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('entries/create', {
        title: 'New Diary Entry',
        user: req.user,
        date: req.body.entry_date,
        formattedDate: formatDateForDisplay(req.body.entry_date),
        error: errors.array()[0].msg,
        formData: req.body
      });
    }

    const entry = await DiaryEntry.create({
      user_id: req.user.id,
      title: req.body.title,
      content: req.body.content,
      entry_date: req.body.entry_date,
      tags: DiaryEntry.formatTagsForStorage(req.body.tags)
    });

    res.redirect(`/entries/date/${req.body.entry_date}?success=Entry created successfully`);
  } catch (error) {
    console.error('Error creating entry:', error);
    res.render('entries/create', {
      title: 'New Diary Entry',
      user: req.user,
      date: req.body.entry_date,
      formattedDate: formatDateForDisplay(req.body.entry_date),
      error: 'Failed to create entry. Please try again.',
      formData: req.body
    });
  }
});

// View single entry
router.get('/:id', async (req, res) => {
  try {
    const entry = await DiaryEntry.findById(req.params.id);

    if (!entry || entry.user_id !== req.user.id) {
      return res.status(404).render('error', {
        title: '404 Not Found',
        message: 'Diary entry not found',
        error: {}
      });
    }

    res.render('entries/view', {
      title: 'Diary Entry',
      user: req.user,
      entry: entry,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Error viewing entry:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load diary entry',
      error: {}
    });
  }
});

// Edit entry form
router.get('/:id/edit', async (req, res) => {
  try {
    const entry = await DiaryEntry.findById(req.params.id);

    if (!entry || entry.user_id !== req.user.id) {
      return res.status(404).render('error', {
        title: '404 Not Found',
        message: 'Diary entry not found',
        error: {}
      });
    }

    res.render('entries/edit', {
      title: 'Edit Diary Entry',
      user: req.user,
      entry: entry
    });
  } catch (error) {
    console.error('Error loading entry for edit:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load diary entry',
      error: {}
    });
  }
});

// Update entry (POST)
router.post('/:id/update', [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required')
], async (req, res) => {
  try {
    const entry = await DiaryEntry.findById(req.params.id);

    if (!entry || entry.user_id !== req.user.id) {
      return res.status(404).render('error', {
        title: '404 Not Found',
        message: 'Diary entry not found',
        error: {}
      });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('entries/edit', {
        title: 'Edit Diary Entry',
        user: req.user,
        entry: entry,
        error: errors.array()[0].msg,
        formData: req.body
      });
    }

    await entry.update({
      title: req.body.title,
      content: req.body.content,
      tags: DiaryEntry.formatTagsForStorage(req.body.tags)
    });

    res.redirect(`/entries/${entry.id}?success=Entry updated successfully`);
  } catch (error) {
    console.error('Error updating entry:', error);
    const entry = await DiaryEntry.findById(req.params.id);
    res.render('entries/edit', {
      title: 'Edit Diary Entry',
      user: req.user,
      entry: entry,
      error: 'Failed to update entry. Please try again.',
      formData: req.body
    });
  }
});

// Delete entry (POST)
router.post('/:id/delete', async (req, res) => {
  try {
    const entry = await DiaryEntry.findById(req.params.id);

    if (!entry || entry.user_id !== req.user.id) {
      return res.status(404).render('error', {
        title: '404 Not Found',
        message: 'Diary entry not found',
        error: {}
      });
    }

    const entryDate = entry.entry_date;
    await entry.delete();

    res.redirect(`/entries/date/${entryDate}?success=Entry deleted successfully`);
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.redirect(`/entries/${req.params.id}?error=Failed to delete entry`);
  }
});

function formatDateForDisplay(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

module.exports = router;
