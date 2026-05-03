const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const appealService = require('../services/AppealService');

const router = express.Router();

// 学生提交申诉/请假
router.post('/', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const { activity_id, type, reason } = req.body;
    const user_id = req.user.id;
    const result = await appealService.createAppeal(user_id, activity_id, type, reason);
    res.status(201).json(result);
  } catch (error) {
    console.error('Submit appeal error:', error);
    if (error.message === 'Activity not found') {
      return res.status(404).json({ error: error.message });
    } else if (error.message === 'You have already submitted this type of application for this activity') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取学生的申诉/请假记录
router.get('/student', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const user_id = req.user.id;
    const appeals = await appealService.getStudentAppeals(user_id);
    res.json(appeals);
  } catch (error) {
    console.error('Get student appeals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取所有待审核的申诉/请假（教师权限）
router.get('/pending', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const appeals = await appealService.getPendingAppeals();
    res.json(appeals);
  } catch (error) {
    console.error('Get pending appeals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 审核申诉/请假（教师权限）
router.put('/:id', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_comment } = req.body;
    const result = await appealService.reviewAppeal(id, status, admin_comment);
    res.json(result);
  } catch (error) {
    console.error('Review appeal error:', error);
    if (error.message === 'Appeal not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
