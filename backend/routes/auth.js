const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const authService = require('../services/AuthService');

const router = express.Router();

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    if (error.message === 'Invalid username or password') {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 学生注册（默认密码123456）
router.post('/register', async (req, res) => {
  try {
    const { username, student_id, name } = req.body;
    const result = await authService.register(username, student_id, name);
    res.status(201).json(result);
  } catch (error) {
    console.error('Register error:', error);
    if (error.message === 'Username already exists' || error.message === 'Student ID already exists') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 修改密码
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    const result = await authService.changePassword(userId, oldPassword, newPassword);
    res.json(result);
  } catch (error) {
    console.error('Change password error:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    } else if (error.message === 'Old password is incorrect') {
      return res.status(400).json({ error: error.message });
    } else if (error.message === 'New password must be at least 6 characters long') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
