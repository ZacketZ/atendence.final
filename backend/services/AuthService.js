const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool: db } = require('../config/db');

class AuthService {
  // 用户登录
  async login(username, password) {
    try {
      // 查找用户
      const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      if (users.length === 0) {
        throw new Error('Invalid username or password');
      }

      const user = users[0];

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid username or password');
      }

      // 生成JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          student_id: user.student_id,
          name: user.name,
          status: user.status
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // 学生注册
  async register(username, student_id, name) {
    try {
      // 检查用户名是否已存在
      const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      if (existingUsers.length > 0) {
        throw new Error('Username already exists');
      }

      // 检查学号是否已存在
      if (student_id) {
        const [existingStudents] = await db.query('SELECT * FROM users WHERE student_id = ?', [student_id]);
        if (existingStudents.length > 0) {
          throw new Error('Student ID already exists');
        }
      }

      // 哈希密码
      const hashedPassword = await bcrypt.hash('123456', 10);

      // 创建用户
      await db.query(
        'INSERT INTO users (username, password_hash, role, student_id, name, status) VALUES (?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, 'student', student_id, name, 1]
      );

      return { message: 'User registered successfully' };
    } catch (error) {
      throw error;
    }
  }

  // 修改密码
  async changePassword(userId, oldPassword, newPassword) {
    try {
      // 查找用户
      const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
      if (users.length === 0) {
        throw new Error('User not found');
      }

      const user = users[0];

      // 验证旧密码
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Old password is incorrect');
      }

      // 验证新密码强度
      if (!this.isPasswordStrong(newPassword)) {
        throw new Error('New password must be at least 6 characters long');
      }

      // 哈希新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 更新密码
      await db.query(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [hashedPassword, userId]
      );

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw error;
    }
  }

  // 密码强度检查
  isPasswordStrong(password) {
    return password.length >= 6;
  }
}

module.exports = new AuthService();
