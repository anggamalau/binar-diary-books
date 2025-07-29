const database = require('../config/database');

describe('Test Setup Verification', () => {
  test('should connect to in-memory database', async () => {
    expect(database.db).toBeDefined();
  });

  test('should have users table', async () => {
    const result = await database.get(
      'SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'users\''
    );
    expect(result).toBeDefined();
    expect(result.name).toBe('users');
  });

  test('should have diary_entries table', async () => {
    const result = await database.get(
      'SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'diary_entries\''
    );
    expect(result).toBeDefined();
    expect(result.name).toBe('diary_entries');
  });

  test('should have empty tables initially', async () => {
    const userCount = await database.get('SELECT COUNT(*) as count FROM users');
    const entryCount = await database.get('SELECT COUNT(*) as count FROM diary_entries');

    expect(userCount.count).toBe(0);
    expect(entryCount.count).toBe(0);
  });
});
