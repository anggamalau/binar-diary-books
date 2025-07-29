const database = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/auth');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.password = data.password;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findByEmail(email) {
    try {
      const row = await database.get(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return row ? new User(row) : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const row = await database.get(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return row ? new User(row) : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const hashedPassword = await hashPassword(userData.password);
      const result = await database.run(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [userData.email, hashedPassword, userData.name]
      );
      
      const newUser = await User.findById(result.id);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async validatePassword(password) {
    return await comparePassword(password, this.password);
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;