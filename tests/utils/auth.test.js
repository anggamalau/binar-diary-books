const { hashPassword, comparePassword, generateToken, verifyToken } = require('../../utils/auth');

// Mock bcryptjs and jsonwebtoken
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('hashPassword', () => {
    test('should hash password with correct salt rounds', async () => {
      const password = 'testPassword123';
      const hashedPassword = 'hashed_password';

      bcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(hashedPassword);
    });

    test('should throw error when bcrypt fails', async () => {
      const password = 'testPassword123';
      const error = new Error('Hashing failed');

      bcrypt.hash.mockRejectedValue(error);

      await expect(hashPassword(password)).rejects.toThrow('Hashing failed');
    });

    test('should handle empty password', async () => {
      const password = '';
      const hashedPassword = 'hashed_empty';

      bcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    test('should return true for matching password', async () => {
      const password = 'testPassword123';
      const hashedPassword = 'hashed_password';

      bcrypt.compare.mockResolvedValue(true);

      const result = await comparePassword(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    test('should return false for non-matching password', async () => {
      const password = 'testPassword123';
      const hashedPassword = 'hashed_password';

      bcrypt.compare.mockResolvedValue(false);

      const result = await comparePassword(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });

    test('should throw error when bcrypt compare fails', async () => {
      const password = 'testPassword123';
      const hashedPassword = 'hashed_password';
      const error = new Error('Compare failed');

      bcrypt.compare.mockRejectedValue(error);

      await expect(comparePassword(password, hashedPassword)).rejects.toThrow('Compare failed');
    });

    test('should handle empty inputs', async () => {
      bcrypt.compare.mockResolvedValue(false);

      const result = await comparePassword('', '');

      expect(bcrypt.compare).toHaveBeenCalledWith('', '');
      expect(result).toBe(false);
    });
  });

  describe('generateToken', () => {
    test('should generate token with correct payload and options', () => {
      const userId = 123;
      const mockToken = 'mock.jwt.token';

      jwt.sign.mockReturnValue(mockToken);

      const result = generateToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId },
        'test-secret',
        { expiresIn: '7d' }
      );
      expect(result).toBe(mockToken);
    });

    test('should generate token with string userId', () => {
      const userId = '456';
      const mockToken = 'mock.jwt.token';

      jwt.sign.mockReturnValue(mockToken);

      const result = generateToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId },
        'test-secret',
        { expiresIn: '7d' }
      );
      expect(result).toBe(mockToken);
    });

    test('should use JWT_SECRET from environment', () => {
      process.env.JWT_SECRET = 'different-secret';
      const userId = 789;
      const mockToken = 'mock.jwt.token';

      jwt.sign.mockReturnValue(mockToken);

      const result = generateToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId },
        'different-secret',
        { expiresIn: '7d' }
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyToken', () => {
    test('should return decoded payload for valid token', () => {
      const token = 'valid.jwt.token';
      const decodedPayload = { userId: 123, exp: 1234567890 };

      jwt.verify.mockReturnValue(decodedPayload);

      const result = verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret');
      expect(result).toEqual(decodedPayload);
    });

    test('should return null for invalid token', () => {
      const token = 'invalid.jwt.token';

      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret');
      expect(result).toBeNull();
    });

    test('should return null for expired token', () => {
      const token = 'expired.jwt.token';

      jwt.verify.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      const result = verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret');
      expect(result).toBeNull();
    });

    test('should return null for malformed token', () => {
      const token = 'malformed.token';

      jwt.verify.mockImplementation(() => {
        const error = new Error('Malformed token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      const result = verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret');
      expect(result).toBeNull();
    });

    test('should use JWT_SECRET from environment', () => {
      process.env.JWT_SECRET = 'another-secret';
      const token = 'test.jwt.token';
      const decodedPayload = { userId: 456 };

      jwt.verify.mockReturnValue(decodedPayload);

      const result = verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, 'another-secret');
      expect(result).toEqual(decodedPayload);
    });

    test('should handle empty token', () => {
      const token = '';

      jwt.verify.mockImplementation(() => {
        throw new Error('Empty token');
      });

      const result = verifyToken(token);

      expect(result).toBeNull();
    });

    test('should handle null token', () => {
      const token = null;

      jwt.verify.mockImplementation(() => {
        throw new Error('Null token');
      });

      const result = verifyToken(token);

      expect(result).toBeNull();
    });
  });

  describe('integration scenarios', () => {
    test('should work with real bcrypt and jwt flow simulation', async () => {
      // Reset mocks to simulate real behavior
      jest.clearAllMocks();

      const password = 'testPassword123';
      const userId = 789;
      const hashedPassword = 'hashed_test_password';
      const mockToken = 'integration.test.token';
      const mockPayload = { userId: 789, exp: 1234567890 };

      // Mock hash operation
      bcrypt.hash.mockResolvedValue(hashedPassword);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(mockToken);
      jwt.verify.mockReturnValue(mockPayload);

      // Test full flow
      const hashed = await hashPassword(password);
      expect(hashed).toBe(hashedPassword);

      const isValid = await comparePassword(password, hashed);
      expect(isValid).toBe(true);

      const token = generateToken(userId);
      expect(token).toBe(mockToken);

      const verified = verifyToken(token);
      expect(verified).toEqual(mockPayload);
    });
  });
});
