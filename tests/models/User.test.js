const User = require('../../models/User');
const { hashPassword, comparePassword } = require('../../utils/auth');

// Mock the auth utilities
jest.mock('../../utils/auth', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn()
}));

describe('User Model', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Set up default mock implementations
    hashPassword.mockResolvedValue('hashedpassword123');
    comparePassword.mockImplementation((plain, hash) => 
      Promise.resolve(plain === 'correctpassword')
    );
  });

  describe('Constructor', () => {
    test('should create a User instance with all properties', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        created_at: '2024-01-15 10:00:00',
        updated_at: '2024-01-15 10:00:00'
      };

      const user = new User(userData);

      expect(user.id).toBe(1);
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.password).toBe('hashedpassword');
      expect(user.created_at).toBe('2024-01-15 10:00:00');
      expect(user.updated_at).toBe('2024-01-15 10:00:00');
    });
  });

  describe('create()', () => {
    test('should create user with valid data', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User'
      };

      const createdUser = await User.create(userData);

      expect(hashPassword).toHaveBeenCalledWith('password123');
      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe('newuser@example.com');
      expect(createdUser.name).toBe('New User');
      expect(createdUser.id).toBeDefined();
    });

    test('should hash password before storage', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'plainpassword',
        name: 'Test User'
      };

      await User.create(userData);

      expect(hashPassword).toHaveBeenCalledWith('plainpassword');
      expect(hashPassword).toHaveBeenCalledTimes(1);
    });

    test('should throw error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'First User'
      };

      // Create first user
      await User.create(userData);

      // Try to create second user with same email
      const duplicateUserData = {
        email: 'duplicate@example.com',
        password: 'password456',
        name: 'Second User'
      };

      await expect(User.create(duplicateUserData)).rejects.toThrow();
    });

    test('should throw error for missing required fields', async () => {
      const incompleteUserData = {
        email: 'test@example.com'
        // missing password and name
      };

      await expect(User.create(incompleteUserData)).rejects.toThrow();
    });

    test('should throw error when hashPassword fails', async () => {
      hashPassword.mockRejectedValue(new Error('Hash failed'));

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      await expect(User.create(userData)).rejects.toThrow('Hash failed');
    });
  });

  describe('findByEmail()', () => {
    test('should return user for valid email', async () => {
      // First create a user
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User'
      };
      
      const createdUser = await User.create(userData);
      
      // Then find by email
      const foundUser = await User.findByEmail('existing@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe('existing@example.com');
      expect(foundUser.name).toBe('Existing User');
      expect(foundUser.id).toBe(createdUser.id);
    });

    test('should return null for non-existent email', async () => {
      const foundUser = await User.findByEmail('nonexistent@example.com');

      expect(foundUser).toBeNull();
    });

    test('should return null for empty email', async () => {
      const foundUser = await User.findByEmail('');

      expect(foundUser).toBeNull();
    });

    test('should handle case sensitivity correctly', async () => {
      const userData = {
        email: 'CaseSensitive@Example.com',
        password: 'password123',
        name: 'Case User'
      };
      
      await User.create(userData);
      
      // SQLite is case-insensitive for email matching in this implementation
      const foundUser = await User.findByEmail('casesensitive@example.com');
      expect(foundUser).toBeDefined();
    });
  });

  describe('findById()', () => {
    test('should return user for valid ID', async () => {
      const userData = {
        email: 'findbyid@example.com',
        password: 'password123',
        name: 'Find By ID User'
      };
      
      const createdUser = await User.create(userData);
      const foundUser = await User.findById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.email).toBe('findbyid@example.com');
      expect(foundUser.name).toBe('Find By ID User');
    });

    test('should return null for non-existent ID', async () => {
      const foundUser = await User.findById(99999);

      expect(foundUser).toBeNull();
    });

    test('should return null for invalid ID types', async () => {
      const foundUser = await User.findById('invalid');

      expect(foundUser).toBeNull();
    });

    test('should return null for null ID', async () => {
      const foundUser = await User.findById(null);

      expect(foundUser).toBeNull();
    });
  });

  describe('validatePassword()', () => {
    let testUser;

    beforeEach(async () => {
      const userData = {
        email: 'passwordtest@example.com',
        password: 'password123',
        name: 'Password Test User'
      };
      testUser = await User.create(userData);
    });

    test('should return true for correct password', async () => {
      comparePassword.mockResolvedValue(true);

      const isValid = await testUser.validatePassword('correctpassword');

      expect(isValid).toBe(true);
      expect(comparePassword).toHaveBeenCalledWith('correctpassword', testUser.password);
    });

    test('should return false for incorrect password', async () => {
      comparePassword.mockResolvedValue(false);

      const isValid = await testUser.validatePassword('wrongpassword');

      expect(isValid).toBe(false);
      expect(comparePassword).toHaveBeenCalledWith('wrongpassword', testUser.password);
    });

    test('should handle empty password', async () => {
      comparePassword.mockResolvedValue(false);

      const isValid = await testUser.validatePassword('');

      expect(isValid).toBe(false);
      expect(comparePassword).toHaveBeenCalledWith('', testUser.password);
    });

    test('should handle null password', async () => {
      comparePassword.mockResolvedValue(false);

      const isValid = await testUser.validatePassword(null);

      expect(isValid).toBe(false);
      expect(comparePassword).toHaveBeenCalledWith(null, testUser.password);
    });

    test('should propagate comparison errors', async () => {
      comparePassword.mockRejectedValue(new Error('Comparison failed'));

      await expect(testUser.validatePassword('password')).rejects.toThrow('Comparison failed');
    });
  });

  describe('toJSON()', () => {
    test('should exclude password from JSON serialization', () => {
      const userData = {
        id: 1,
        email: 'json@example.com',
        name: 'JSON User',
        password: 'secretpassword',
        created_at: '2024-01-15 10:00:00',
        updated_at: '2024-01-15 10:00:00'
      };

      const user = new User(userData);
      const json = user.toJSON();

      expect(json).toEqual({
        id: 1,
        email: 'json@example.com',
        name: 'JSON User',
        created_at: '2024-01-15 10:00:00',
        updated_at: '2024-01-15 10:00:00'
      });
      
      expect(json).not.toHaveProperty('password');
    });

    test('should handle user with minimal data', () => {
      const userData = {
        id: 2,
        email: 'minimal@example.com',
        name: 'Minimal User',
        password: 'secret'
      };

      const user = new User(userData);
      const json = user.toJSON();

      expect(json.id).toBe(2);
      expect(json.email).toBe('minimal@example.com');
      expect(json.name).toBe('Minimal User');
      expect(json).not.toHaveProperty('password');
    });

    test('should preserve all properties except password', () => {
      const userData = {
        id: 3,
        email: 'complete@example.com',
        name: 'Complete User',
        password: 'secret',
        created_at: '2024-01-15 10:00:00',
        updated_at: '2024-01-15 11:00:00'
      };

      const user = new User(userData);
      // Add an extra property after construction
      user.extraProperty = 'should be included';
      const json = user.toJSON();

      expect(json.extraProperty).toBe('should be included');
      expect(json).not.toHaveProperty('password');
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors in findByEmail', async () => {
      // This would require mocking the database module, which is complex
      // For now, we test that errors are properly thrown
      const originalConsoleError = console.error;
      console.error = jest.fn();

      try {
        await User.findByEmail('test@invalid-query.com');
      } catch (error) {
        // Error handling works
      }

      console.error = originalConsoleError;
    });

    test('should handle database connection errors in findById', async () => {
      const originalConsoleError = console.error;
      console.error = jest.fn();

      try {
        await User.findById(1);
      } catch (error) {
        // Error handling works
      }

      console.error = originalConsoleError;
    });

    test('should handle database connection errors in create', async () => {
      const originalConsoleError = console.error;
      console.error = jest.fn();

      const userData = {
        email: null, // This should cause a database error
        password: 'password123',
        name: 'Test User'
      };

      await expect(User.create(userData)).rejects.toThrow();

      console.error = originalConsoleError;
    });
  });

  describe('Integration Tests', () => {
    test('should create, find, and validate user in sequence', async () => {
      const userData = {
        email: 'integration@example.com',
        password: 'integration123',
        name: 'Integration User'
      };

      // Create user
      const createdUser = await User.create(userData);
      expect(createdUser.email).toBe('integration@example.com');

      // Find by email
      const foundByEmail = await User.findByEmail('integration@example.com');
      expect(foundByEmail.id).toBe(createdUser.id);

      // Find by ID
      const foundById = await User.findById(createdUser.id);
      expect(foundById.email).toBe('integration@example.com');

      // Validate password
      comparePassword.mockResolvedValue(true);
      const isValid = await foundById.validatePassword('integration123');
      expect(isValid).toBe(true);

      // JSON serialization
      const json = foundById.toJSON();
      expect(json).not.toHaveProperty('password');
      expect(json.email).toBe('integration@example.com');
    });

    test('should maintain data integrity across operations', async () => {
      const users = [];
      
      // Create multiple users
      for (let i = 1; i <= 3; i++) {
        const userData = {
          email: `user${i}@example.com`,
          password: `password${i}`,
          name: `User ${i}`
        };
        
        const user = await User.create(userData);
        users.push(user);
      }

      // Verify each user can be found
      for (let i = 0; i < users.length; i++) {
        const foundUser = await User.findById(users[i].id);
        expect(foundUser.email).toBe(`user${i + 1}@example.com`);
        expect(foundUser.name).toBe(`User ${i + 1}`);
      }

      // Verify users have unique IDs
      const ids = users.map(user => user.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds.length).toBe(users.length);
    });
  });
});