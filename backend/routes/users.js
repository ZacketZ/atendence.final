const express = require('express');
const bcrypt = require('bcrypt');
const { pool: db } = require('../config/db');
const { authenticateToken, requireRole, requireAdmin } = require('../middleware/auth');
const userService = require('../services/UserService');

const router = express.Router();

// 获取所有学生信息（教师权限）
router.get('/students', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const students = await userService.getStudents();
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取所有教师信息（管理员权限）
router.get('/teachers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [teachers] = await db.query('SELECT id, username, name FROM users WHERE role IN (?, ?)', ['teacher', 'admin']);
    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取单个用户信息
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 添加学生（教师权限）
router.post('/students', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const { username, student_id, name } = req.body;
    const result = await userService.addStudent(username, student_id, name);
    res.status(201).json(result);
  } catch (error) {
    console.error('Add student error:', error);
    if (error.message === 'Username already exists' || error.message === 'Student ID already exists') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 添加教师（管理员权限）
router.post('/teachers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, name } = req.body;
    
    // 检查用户名是否已存在
    const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash('123456', 10);

    // 创建教师用户
    await db.query(
      'INSERT INTO users (username, password_hash, role, name) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, 'teacher', name]
    );

    res.status(201).json({ message: 'Teacher added successfully' });
  } catch (error) {
    console.error('Add teacher error:', error);
    if (error.message === 'Username already exists') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新学生信息（教师权限）
router.put('/students/:id', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, name, status } = req.body;
    const result = await userService.updateStudent(id, student_id, name, status);
    res.json(result);
  } catch (error) {
    console.error('Update student error:', error);
    if (error.message === 'Student not found') {
      return res.status(404).json({ error: error.message });
    } else if (error.message === 'Student ID already exists') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新教师信息（管理员权限）
router.put('/teachers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // 检查教师是否存在
    const [existingUsers] = await db.query('SELECT * FROM users WHERE id = ? AND role = ?', [id, 'teacher']);
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // 更新教师信息
    await db.query(
      'UPDATE users SET name = ? WHERE id = ?',
      [name, id]
    );

    res.json({ message: 'Teacher updated successfully' });
  } catch (error) {
    console.error('Update teacher error:', error);
    if (error.message === 'Teacher not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除学生（教师权限）
router.delete('/students/:id', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteStudent(id);
    res.json(result);
  } catch (error) {
    console.error('Delete student error:', error);
    if (error.message === 'Student not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除教师（管理员权限）
router.delete('/teachers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // 检查教师是否存在
    const [existingUsers] = await db.query('SELECT * FROM users WHERE id = ? AND role = ?', [id, 'teacher']);
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // 删除教师
    await db.query('DELETE FROM users WHERE id = ?', [id]);

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Delete teacher error:', error);
    if (error.message === 'Teacher not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 检查学号是否存在
router.post('/check-student-id', async (req, res) => {
  try {
    const { student_id } = req.body;
    const result = await userService.checkStudentId(student_id);
    res.json(result);
  } catch (error) {
    console.error('Check student ID error:', error);
    if (error.message === 'Student ID is required') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
