const jwt = require('jsonwebtoken');
const User = require('../../models/User');

class AuthHelper {
  static async createAuthenticatedUser(userData = {}) {
    const defaultUserData = {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      name: 'Test User'
    };

    const user = await User.create({ ...defaultUserData, ...userData });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    return { user, token };
  }

  static getAuthHeaders(token) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  static generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  }
}

module.exports = AuthHelper;