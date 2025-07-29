const database = require('../config/database');

// Test environment setup
process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test-jwt-secret';

// Global test setup
beforeAll(async () => {
  // Connect to in-memory database
  await database.connect();

  // Create tables for testing
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
});

// Global test cleanup
afterAll(async () => {
  if (database.db) {
    await database.close();
  }
});

// Clean database before each test
beforeEach(async () => {
  if (database.db) {
    await database.run('DELETE FROM diary_entries');
    await database.run('DELETE FROM users');
  }
});
