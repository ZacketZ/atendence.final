const { pool: db } = require('../config/db');

class AppealService {
  // 学生提交申诉/请假
  async createAppeal(user_id, activity_id, type, reason) {
    try {
      // 检查活动是否存在
      const [activities] = await db.query('SELECT * FROM attendance_activities WHERE id = ?', [activity_id]);
      if (activities.length === 0) {
        throw new Error('Activity not found');
      }

      // 检查是否已经提交过相同类型的申请
      const [existingAppeals] = await db.query(
        'SELECT * FROM appeals WHERE user_id = ? AND activity_id = ? AND type = ?',
        [user_id, activity_id, type]
      );

      if (existingAppeals.length > 0) {
        throw new Error('You have already submitted this type of application for this activity');
      }

      // 创建申诉/请假记录
      await db.query(
        'INSERT INTO appeals (user_id, activity_id, type, reason, status) VALUES (?, ?, ?, ?, ?)',
        [user_id, activity_id, type, reason, 'pending']
      );

      return { message: 'Application submitted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // 获取学生的申诉/请假记录
  async getStudentAppeals(user_id) {
    try {
      const [appeals] = await db.query(
        'SELECT a.*, ac.title FROM appeals a JOIN attendance_activities ac ON a.activity_id = ac.id WHERE a.user_id = ? ORDER BY a.created_at DESC',
        [user_id]
      );
      return appeals;
    } catch (error) {
      throw error;
    }
  }

  // 获取所有待审核的申诉/请假
  async getPendingAppeals() {
    try {
      const [appeals] = await db.query(
        'SELECT a.*, ac.title, u.student_id, u.name FROM appeals a JOIN attendance_activities ac ON a.activity_id = ac.id JOIN users u ON a.user_id = u.id WHERE a.status = ? ORDER BY a.created_at DESC',
        ['pending']
      );
      return appeals;
    } catch (error) {
      throw error;
    }
  }

  // 审核申诉/请假
  async reviewAppeal(id, status, admin_comment) {
    try {
      // 检查申诉是否存在
      const [existingAppeals] = await db.query('SELECT * FROM appeals WHERE id = ?', [id]);
      if (existingAppeals.length === 0) {
        throw new Error('Appeal not found');
      }

      // 更新申诉状态
      await db.query(
        'UPDATE appeals SET status = ?, admin_comment = ? WHERE id = ?',
        [status, admin_comment, id]
      );

      return { message: 'Appeal reviewed successfully' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AppealService();
