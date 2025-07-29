const database = require('../../config/database');

class DatabaseHelper {
  static async reset() {
    if (database.db) {
      await database.run('DELETE FROM diary_entries');
      await database.run('DELETE FROM users');
    }
  }

  static async createTestTables() {
    await database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await database.run(`
      CREATE TABLE IF NOT EXISTS diary_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        entry_date DATE NOT NULL,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    await database.run(`
      CREATE INDEX IF NOT EXISTS idx_diary_entries_user_date 
      ON diary_entries (user_id, entry_date)
    `);
  }

  static async cleanup() {
    if (database.db) {
      database.close();
    }
  }
}

module.exports = DatabaseHelper;
