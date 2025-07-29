const User = require('../../models/User');

class UserFactory {
  static async create(overrides = {}) {
    const defaultData = {
      email: `user${Date.now()}${Math.random().toString(36).substr(2, 9)}@example.com`,
      password: 'password123',
      name: 'Test User'
    };

    return await User.create({ ...defaultData, ...overrides });
  }

  static async createMultiple(count, overrides = {}) {
    const users = [];
    for (let i = 0; i < count; i++) {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substr(2, 9);
      users.push(await this.create({
        email: `user${i}_${timestamp}_${randomString}@example.com`,
        name: `Test User ${i + 1}`,
        ...overrides
      }));
    }
    return users;
  }

  static getValidUserData(overrides = {}) {
    return {
      email: `user${Date.now()}${Math.random().toString(36).substr(2, 9)}@example.com`,
      password: 'password123',
      name: 'Test User',
      ...overrides
    };
  }
}

module.exports = UserFactory;