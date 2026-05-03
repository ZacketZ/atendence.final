const bcrypt = require('bcrypt');
const { pool: db } = require('../config/db');

class UserService {
  // 获取所有学生信息
  async getStudents() {
    try {
      const [students] = await db.query('SELECT id, username, student_id, name, status FROM users WHERE role = ?', ['student']);
      return students;
    } catch (error) {
      throw error;
    }
  }

  // 获取单个用户信息
  async getUserById(id) {
    try {
      const [users] = await db.query('SELECT id, username, student_id, name, status FROM users WHERE id = ?', [id]);
      if (users.length === 0) {
        throw new Error('User not found');
      }
      return users[0];
    } catch (error) {
      throw error;
    }
  }

  // 添加学生
  async addStudent(username, student_id, name) {
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

      // 创建学生用户
      await db.query(
        'INSERT INTO users (username, password_hash, role, student_id, name, status) VALUES (?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, 'student', student_id, name, 1]
      );

      return { message: 'Student added successfully' };
    } catch (error) {
      throw error;
    }
  }

  // 更新学生信息
  async updateStudent(id, student_id, name, status) {
    try {
      // 检查学生是否存在
      const [existingUsers] = await db.query('SELECT * FROM users WHERE id = ? AND role = ?', [id, 'student']);
      if (existingUsers.length === 0) {
        throw new Error('Student not found');
      }

      // 检查学号是否已被其他学生使用
      if (student_id) {
        const [existingStudents] = await db.query('SELECT * FROM users WHERE student_id = ? AND id != ?', [student_id, id]);
        if (existingStudents.length > 0) {
          throw new Error('Student ID already exists');
        }
      }

      // 更新学生信息
      const statusValue = status === 'active' ? 1 : 0;
      await db.query(
        'UPDATE users SET student_id = ?, name = ?, status = ? WHERE id = ?',
        [student_id, name, statusValue, id]
      );

      return { message: 'Student updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  // 删除学生
  async deleteStudent(id) {
    try {
      // 检查学生是否存在
      const [existingUsers] = await db.query('SELECT * FROM users WHERE id = ? AND role = ?', [id, 'student']);
      if (existingUsers.length === 0) {
        throw new Error('Student not found');
      }

      // 删除学生
      await db.query('DELETE FROM users WHERE id = ?', [id]);

      return { message: 'Student deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // 检查学号是否存在
  async checkStudentId(student_id) {
    try {
      if (!student_id) {
        throw new Error('Student ID is required');
      }

      const [students] = await db.query('SELECT id, name FROM users WHERE student_id = ? AND role = ?', [student_id, 'student']);
      
      if (students.length > 0) {
        return { exists: true, student: students[0] };
      } else {
        return { exists: false };
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
