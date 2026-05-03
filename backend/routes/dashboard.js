const express = require("express");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { pool: db } = require("../config/db");

const router = express.Router();

// 获取管理员仪表盘数据
router.get(
  "/stats",
  authenticateToken,
  requireRole("teacher"),
  async (req, res) => {
    try {
      // 北京时间（UTC+8）计算
      const now = new Date();
      const beijingOffset = 8 * 60 * 60 * 1000;
      const beijingNow = new Date(now.getTime() + beijingOffset);
      const todayStr = beijingNow.toISOString().split("T")[0];

      // 今日总人数 = 学生总数
      const [totalStudents] = await db.query(
        `SELECT COUNT(*) as count FROM users WHERE role = 'student'`,
      );

      // 今日已签到人数 = 今日有打卡记录的学生数（按北京时间）
      const [checkedIn] = await db.query(
        `SELECT COUNT(DISTINCT r.user_id) as count
         FROM attendance_records r
         WHERE DATE(CONVERT_TZ(r.check_time, '+00:00', '+08:00')) = ?`,
        [todayStr],
      );

      // 今日待签到 = 总学生数 - 已签到
      const total = totalStudents[0].count;
      const checkedInCount = checkedIn[0].count;
      const pending = total - checkedInCount;

      // 最近活动 - 最新的打卡记录
      const [recentRecords] = await db.query(
        `SELECT r.check_time, u.name as user_name, u.student_id,
                a.title as activity_title, r.final_status
         FROM attendance_records r
         JOIN users u ON r.user_id = u.id
         JOIN attendance_activities a ON r.activity_id = a.id
         ORDER BY r.check_time DESC
         LIMIT 10`,
      );

      const beijingFormat = (dt) => {
        if (!dt) return "";
        const d = dt instanceof Date ? dt : new Date(dt);
        const bj = new Date(d.getTime() + beijingOffset);
        const dateStr = bj.toISOString().split("T")[0];
        const timeStr = bj.toISOString().split("T")[1].split(".")[0];
        return `${dateStr} ${timeStr}`;
      };

      const activities = recentRecords.map((r) => ({
        time: beijingFormat(r.check_time),
        user: r.user_name || r.student_id || "未知",
        action:
          r.final_status === "normal"
            ? `完成签到 - ${r.activity_title}`
            : `异常签到 - ${r.activity_title}`,
        status: r.final_status === "normal" ? "success" : "danger",
      }));

      res.json({
        todayStats: {
          total,
          checkedIn: checkedInCount,
          pending: pending > 0 ? pending : 0,
        },
        recentActivities: activities,
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

module.exports = router;
