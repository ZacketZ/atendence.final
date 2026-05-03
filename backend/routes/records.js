const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const recordService = require('../services/RecordService');

const router = express.Router();

// 学生打卡
router.post('/', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const { activity_id, check_time, gps_longitude, gps_latitude, liveness_result, device_info } = req.body;
    const user_id = req.user.id;
    const result = await recordService.createRecord(user_id, activity_id, check_time, gps_longitude, gps_latitude, liveness_result, device_info);
    res.status(201).json(result);
  } catch (error) {
    console.error('Check-in error:', error);
    if (error.message === 'Activity not found') {
      return res.status(404).json({ error: error.message });
    } else if (error.message === 'Activity is not active' || error.message === 'You have already checked in for this activity') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取学生的打卡记录
router.get('/student', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const user_id = req.user.id;
    const records = await recordService.getStudentRecords(user_id);
    res.json(records);
  } catch (error) {
    console.error('Get student records error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取活动的打卡记录（教师权限）
router.get('/activity/:id', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const records = await recordService.getActivityRecords(id);
    res.json(records);
  } catch (error) {
    console.error('Get activity records error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
