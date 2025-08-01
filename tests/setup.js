// Mock the database module for all tests
jest.mock('../config/database');

const database = require('../config/database');

// Test environment setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';

// Global test setup
beforeAll(async () => {
  // Connect to mock database
  await database.connect();
});

// Global test cleanup
afterAll(async () => {
  // Close mock database connection
  await database.close();
});

// Clean database before each test
beforeEach(async () => {
  if (database.db) {
    await database.run('DELETE FROM diary_entries');
    await database.run('DELETE FROM users');
  }
});
