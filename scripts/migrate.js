const database = require('../config/database');

const migrations = [
  {
    version: 1,
    description: 'Create users table',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
  },
  {
    version: 2,
    description: 'Create migration_history table',
    sql: `
      CREATE TABLE IF NOT EXISTS migration_history (
        version INTEGER PRIMARY KEY,
        description TEXT NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
  },
  {
    version: 3,
    description: 'Create diary_entries table',
    sql: `
      CREATE TABLE IF NOT EXISTS diary_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        entry_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `
  },
  {
    version: 4,
    description: 'Create index on diary_entries for user_id and entry_date',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_diary_entries_user_date 
      ON diary_entries (user_id, entry_date)
    `
  },
  {
    version: 5,
    description: 'Add tags column to diary_entries table',
    sql: `
      ALTER TABLE diary_entries ADD COLUMN tags TEXT
    `
  }
];

async function runMigrations() {
  try {
    await database.connect();

    await database.run(`
      CREATE TABLE IF NOT EXISTS migration_history (
        version INTEGER PRIMARY KEY,
        description TEXT NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const migration of migrations) {
      const existing = await database.get(
        'SELECT version FROM migration_history WHERE version = ?',
        [migration.version]
      );

      if (!existing) {
        console.log(`Running migration ${migration.version}: ${migration.description}`);
        await database.run(migration.sql);
        await database.run(
          'INSERT INTO migration_history (version, description) VALUES (?, ?)',
          [migration.version, migration.description]
        );
        console.log(`Migration ${migration.version} completed`);
      } else {
        console.log(`Migration ${migration.version} already executed`);
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    database.close();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
