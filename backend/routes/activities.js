const express = require('express');
const { pool: db } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const activityService = require('../services/ActivityService');

const router = express.Router();

// 创建考勤活动（教师权限）
router.post('/', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const { title, longitude, latitude, radius, start_time, end_time, qr_refresh_interval } = req.body;
    const teacher_id = req.user.id;
    const result = await activityService.createActivity(teacher_id, title, longitude, latitude, radius, start_time, end_time, qr_refresh_interval);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取教师的所有考勤活动
router.get('/teacher', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const teacher_id = req.user.id;
    // 管理员可以查看所有活动，教师只能查看自己的活动
    let activities;
    if (req.user.role === 'admin') {
      const [allActivities] = await db.query('SELECT * FROM attendance_activities ORDER BY created_at DESC');
      activities = allActivities;
    } else {
      activities = await activityService.getTeacherActivities(teacher_id);
    }
    res.json(activities);
  } catch (error) {
    console.error('Get teacher activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取单个考勤活动详情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await activityService.getActivityById(id);
    res.json(activity);
  } catch (error) {
    console.error('Get activity error:', error);
    if (error.message === 'Activity not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新考勤活动（教师权限）
router.put('/:id', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, longitude, latitude, radius, start_time, end_time, qr_refresh_interval } = req.body;
    const teacher_id = req.user.id;
    
    // 管理员可以更新所有活动，教师只能更新自己的活动
    if (req.user.role === 'admin') {
      // 直接更新，不需要验证所有权
      await db.query(
        'UPDATE attendance_activities SET title = ?, longitude = ?, latitude = ?, radius = ?, start_time = ?, end_time = ?, qr_refresh_interval = ? WHERE id = ?',
        [title, longitude, latitude, radius, start_time, end_time, qr_refresh_interval || 30, id]
      );
      res.json({ message: 'Activity updated successfully' });
    } else {
      const result = await activityService.updateActivity(id, teacher_id, title, longitude, latitude, radius, start_time, end_time, qr_refresh_interval);
      res.json(result);
    }
  } catch (error) {
    console.error('Update activity error:', error);
    if (error.message === 'Activity not found or not authorized') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除考勤活动（教师权限）
router.delete('/:id', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const teacher_id = req.user.id;
    
    // 管理员可以删除所有活动，教师只能删除自己的活动
    if (req.user.role === 'admin') {
      // 直接删除，不需要验证所有权
      await db.query('DELETE FROM attendance_activities WHERE id = ?', [id]);
      res.json({ message: 'Activity deleted successfully' });
    } else {
      const result = await activityService.deleteActivity(id, teacher_id);
      res.json(result);
    }
  } catch (error) {
    console.error('Delete activity error:', error);
    if (error.message === 'Activity not found or not authorized') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取当前活跃的考勤活动（学生端使用）
router.get('/active/current', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const activities = await activityService.getCurrentActivities();
    res.json(activities);
  } catch (error) {
    console.error('Get current activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
