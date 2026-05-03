const { pool: db } = require('../config/db');

class ActivityService {
  // 创建考勤活动
  async createActivity(teacher_id, title, longitude, latitude, radius, start_time, end_time, qr_refresh_interval) {
    try {
      // 创建活动
      await db.query(
        'INSERT INTO attendance_activities (teacher_id, title, longitude, latitude, radius, start_time, end_time, qr_refresh_interval) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [teacher_id, title, longitude, latitude, radius, start_time, end_time, qr_refresh_interval || 30]
      );

      return { message: 'Attendance activity created successfully' };
    } catch (error) {
      throw error;
    }
  }

  // 获取教师的所有考勤活动
  async getTeacherActivities(teacher_id) {
    try {
      const [activities] = await db.query('SELECT * FROM attendance_activities WHERE teacher_id = ? ORDER BY created_at DESC', [teacher_id]);
      return activities;
    } catch (error) {
      throw error;
    }
  }

  // 获取单个考勤活动详情
  async getActivityById(id) {
    try {
      const [activities] = await db.query('SELECT * FROM attendance_activities WHERE id = ?', [id]);
      if (activities.length === 0) {
        throw new Error('Activity not found');
      }
      return activities[0];
    } catch (error) {
      throw error;
    }
  }

  // 更新考勤活动
  async updateActivity(id, teacher_id, title, longitude, latitude, radius, start_time, end_time, qr_refresh_interval) {
    try {
      // 检查活动是否存在且属于该教师
      const [existingActivities] = await db.query('SELECT * FROM attendance_activities WHERE id = ? AND teacher_id = ?', [id, teacher_id]);
      if (existingActivities.length === 0) {
        throw new Error('Activity not found or not authorized');
      }

      // 更新活动
      await db.query(
        'UPDATE attendance_activities SET title = ?, longitude = ?, latitude = ?, radius = ?, start_time = ?, end_time = ?, qr_refresh_interval = ? WHERE id = ?',
        [title, longitude, latitude, radius, start_time, end_time, qr_refresh_interval || 30, id]
      );

      return { message: 'Activity updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  // 删除考勤活动
  async deleteActivity(id, teacher_id) {
    try {
      // 检查活动是否存在且属于该教师
      const [existingActivities] = await db.query('SELECT * FROM attendance_activities WHERE id = ? AND teacher_id = ?', [id, teacher_id]);
      if (existingActivities.length === 0) {
        throw new Error('Activity not found or not authorized');
      }

      // 删除活动
      await db.query('DELETE FROM attendance_activities WHERE id = ?', [id]);

      return { message: 'Activity deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // 获取当前活跃的考勤活动
  async getCurrentActivities() {
    try {
      const now = new Date();
      const [activities] = await db.query(
        'SELECT * FROM attendance_activities WHERE start_time <= ? AND end_time >= ? ORDER BY start_time DESC',
        [now, now]
      );
      return activities;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ActivityService();
