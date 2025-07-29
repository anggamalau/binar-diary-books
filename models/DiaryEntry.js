const database = require('../config/database');

class DiaryEntry {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.title = data.title;
    this.content = data.content;
    this.entry_date = data.entry_date;
    this.tags = data.tags;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(entryData) {
    try {
      const result = await database.run(
        'INSERT INTO diary_entries (user_id, title, content, entry_date, tags) VALUES (?, ?, ?, ?, ?)',
        [entryData.user_id, entryData.title, entryData.content, entryData.entry_date, entryData.tags || null]
      );
      
      const newEntry = await DiaryEntry.findById(result.id);
      return newEntry;
    } catch (error) {
      console.error('Error creating diary entry:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const row = await database.get(
        'SELECT * FROM diary_entries WHERE id = ?',
        [id]
      );
      return row ? new DiaryEntry(row) : null;
    } catch (error) {
      console.error('Error finding diary entry by ID:', error);
      throw error;
    }
  }

  static async findByUserAndDate(userId, date) {
    try {
      const rows = await database.all(
        'SELECT * FROM diary_entries WHERE user_id = ? AND entry_date = ? ORDER BY created_at ASC',
        [userId, date]
      );
      return rows.map(row => new DiaryEntry(row));
    } catch (error) {
      console.error('Error finding diary entries by user and date:', error);
      throw error;
    }
  }

  static async findByUserAndDateRange(userId, startDate, endDate) {
    try {
      const rows = await database.all(
        'SELECT * FROM diary_entries WHERE user_id = ? AND entry_date BETWEEN ? AND ? ORDER BY entry_date ASC, created_at ASC',
        [userId, startDate, endDate]
      );
      return rows.map(row => new DiaryEntry(row));
    } catch (error) {
      console.error('Error finding diary entries by date range:', error);
      throw error;
    }
  }

  static async findByUser(userId, limit = null, offset = 0) {
    try {
      let sql = 'SELECT * FROM diary_entries WHERE user_id = ? ORDER BY entry_date DESC, created_at DESC';
      const params = [userId];
      
      if (limit) {
        sql += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
      }
      
      const rows = await database.all(sql, params);
      return rows.map(row => new DiaryEntry(row));
    } catch (error) {
      console.error('Error finding diary entries by user:', error);
      throw error;
    }
  }

  static async getEntryCounts(userId, startDate, endDate) {
    try {
      const rows = await database.all(
        'SELECT entry_date, COUNT(*) as count FROM diary_entries WHERE user_id = ? AND entry_date BETWEEN ? AND ? GROUP BY entry_date',
        [userId, startDate, endDate]
      );
      
      const counts = {};
      rows.forEach(row => {
        counts[row.entry_date] = row.count;
      });
      
      return counts;
    } catch (error) {
      console.error('Error getting entry counts:', error);
      throw error;
    }
  }

  async update(updateData) {
    try {
      const result = await database.run(
        'UPDATE diary_entries SET title = ?, content = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        [updateData.title, updateData.content, updateData.tags || null, this.id, this.user_id]
      );
      
      if (result.changes === 0) {
        throw new Error('Entry not found or unauthorized');
      }
      
      // Refresh the instance with updated data
      const updatedEntry = await DiaryEntry.findById(this.id);
      Object.assign(this, updatedEntry);
      
      return this;
    } catch (error) {
      console.error('Error updating diary entry:', error);
      throw error;
    }
  }

  async delete() {
    try {
      const result = await database.run(
        'DELETE FROM diary_entries WHERE id = ? AND user_id = ?',
        [this.id, this.user_id]
      );
      
      if (result.changes === 0) {
        throw new Error('Entry not found or unauthorized');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting diary entry:', error);
      throw error;
    }
  }

  static async findByUserAndTag(userId, tag) {
    try {
      const rows = await database.all(
        `SELECT * FROM diary_entries 
         WHERE user_id = ? AND 
         (',' || tags || ',') LIKE ? 
         ORDER BY entry_date DESC, created_at DESC`,
        [userId, `%,${tag},%`]
      );
      return rows.map(row => new DiaryEntry(row));
    } catch (error) {
      console.error('Error finding diary entries by tag:', error);
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      title: this.title,
      content: this.content,
      entry_date: this.entry_date,
      tags: this.tags,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  getFormattedDate() {
    const date = new Date(this.entry_date + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getFormattedCreatedAt() {
    const date = new Date(this.created_at);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTagsArray() {
    if (!this.tags || this.tags.trim() === '') {
      return [];
    }
    return this.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }

  static formatTagsForStorage(tagsString) {
    if (!tagsString || tagsString.trim() === '') {
      return null;
    }
    // Split by comma, trim each tag, remove empty ones, and join back
    const tags = tagsString.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .join(',');
    return tags || null;
  }
}

module.exports = DiaryEntry;