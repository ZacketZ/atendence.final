const express = require("express");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { pool: db } = require("../config/db");

const router = express.Router();

// 北京时间工具函数
const beijingOffset = 8 * 60 * 60 * 1000;

function getBeijingNow() {
  return new Date(new Date().getTime() + beijingOffset);
}

function getBeijingDateStr(date) {
  const d = date || getBeijingNow();
  return d.toISOString().split("T")[0];
}

function formatBeijingDate(dt) {
  if (!dt) return "";
  const d = dt instanceof Date ? dt : new Date(dt);
  const bj = new Date(d.getTime() + beijingOffset);
  return bj.toISOString().split("T")[0];
}

function formatBeijingTime(dt) {
  if (!dt) return "";
  const d = dt instanceof Date ? dt : new Date(dt);
  const bj = new Date(d.getTime() + beijingOffset);
  return bj.toISOString().split("T")[1].split(".")[0];
}

// 获取看板数据（管理员端）
router.get(
  "/dashboard",
  authenticateToken,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const beijingNow = getBeijingNow();
      const todayStr = getBeijingDateStr(beijingNow);

      // 本周起始（北京时间周一）
      const weekStart = new Date(beijingNow);
      const dayOfWeek = weekStart.getUTCDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      weekStart.setUTCDate(weekStart.getUTCDate() - diffToMonday);
      weekStart.setUTCHours(0, 0, 0, 0);
      const weekStartDate = new Date(weekStart.getTime() - beijingOffset);
      const weekStartStr = weekStartDate.toISOString().split("T")[0];

      // 本月起始（北京时间）
      const monthStart = new Date(beijingNow);
      monthStart.setUTCDate(1);
      monthStart.setUTCHours(0, 0, 0, 0);
      const monthStartDate = new Date(monthStart.getTime() - beijingOffset);
      const monthStartStr = monthStartDate.toISOString().split("T")[0];

      // 今日迟到人数（有打卡记录且 abnormal，按学生去重，只统计学生）
      const [todayLate] = await db.query(
        `SELECT COUNT(DISTINCT r.user_id) as count FROM attendance_records r
         JOIN users u ON r.user_id = u.id
         WHERE DATE(CONVERT_TZ(r.check_time, '+00:00', '+08:00')) = ?
         AND r.final_status = 'abnormal'
         AND u.role = 'student'`,
        [todayStr],
      );

      // 今日缺勤人数 = 今日有已结束活动但未打卡的学生数
      // 先找出今日北京时间范围内已结束的活动
      const [todayEndedActivities] = await db.query(
        `SELECT a.id FROM attendance_activities a
         WHERE CONVERT_TZ(a.end_time, '+00:00', '+08:00') <= ?
         AND CONVERT_TZ(a.start_time, '+00:00', '+08:00') >= ?`,
        [todayStr + " 23:59:59", todayStr + " 00:00:00"],
      );

      let todayAbsentCount = 0;
      if (todayEndedActivities.length > 0) {
        const activityIds = todayEndedActivities.map((a) => a.id);
        // 统计这些活动中没有打卡记录的学生
        const [absentStudents] = await db.query(
          `SELECT COUNT(*) as count FROM users u
           WHERE u.role = 'student'
           AND NOT EXISTS (
             SELECT 1 FROM attendance_records r
             WHERE r.user_id = u.id
             AND r.activity_id IN (?)
             AND DATE(CONVERT_TZ(r.check_time, '+00:00', '+08:00')) = ?
           )`,
          [activityIds, todayStr],
        );
        todayAbsentCount = absentStudents[0].count;
      }

      // 本周累计异常（abnormal 记录数，只统计学生）
      const [weekAbnormal] = await db.query(
        `SELECT COUNT(*) as count FROM attendance_records r
         JOIN users u ON r.user_id = u.id
         WHERE DATE(CONVERT_TZ(r.check_time, '+00:00', '+08:00')) >= ?
         AND r.final_status = 'abnormal'
         AND u.role = 'student'`,
        [weekStartStr],
      );

      // 本月累计异常（只统计学生）
      const [monthAbnormal] = await db.query(
        `SELECT COUNT(*) as count FROM attendance_records r
         JOIN users u ON r.user_id = u.id
         WHERE DATE(CONVERT_TZ(r.check_time, '+00:00', '+08:00')) >= ?
         AND r.final_status = 'abnormal'
         AND u.role = 'student'`,
        [monthStartStr],
      );

      // 最近异常记录（只统计学生）
      const [recentAbnormal] = await db.query(
        `SELECT r.*, u.student_id, u.name as student_name
         FROM attendance_records r
         JOIN users u ON r.user_id = u.id
         WHERE r.final_status = 'abnormal'
         AND u.role = 'student'
         ORDER BY r.check_time DESC LIMIT 10`,
      );

      // 迟到最多学生 Top 5（只统计学生）
      const [topLateStudents] = await db.query(
        `SELECT u.student_id, u.name as student_name, COUNT(*) as count
         FROM attendance_records r JOIN users u ON r.user_id = u.id
         WHERE r.final_status = 'abnormal'
         AND u.role = 'student'
         GROUP BY u.id, u.student_id, u.name
         ORDER BY count DESC LIMIT 5`,
      );

      res.json({
        todayLateCount: todayLate[0].count,
        todayAbsentCount: todayAbsentCount,
        weekAbnormalCount: weekAbnormal[0].count,
        monthAbnormalCount: monthAbnormal[0].count,
        recentAbnormalRecords: recentAbnormal.map((r) => ({
          id: r.id,
          studentId: r.student_id,
          studentName: r.student_name,
          date: formatBeijingDate(r.check_time),
          checkinTime: formatBeijingTime(r.check_time),
          status: r.final_status,
          remark: r.remark || "",
        })),
        topLateStudents: topLateStudents.map((s) => ({
          studentId: s.student_id,
          studentName: s.student_name,
          count: s.count,
        })),
        topAbsentStudents: [],
      });
    } catch (error) {
      console.error("Get dashboard data error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// 获取学生考勤统计
router.get(
  "/students",
  authenticateToken,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const { startDate, endDate, className } = req.query;

      // 获取所有学生
      const [students] = await db.query(
        `SELECT id, student_id, name FROM users WHERE role = 'student'`,
      );

      // 获取所有已结束的活动（用于计算缺勤）
      const now = new Date();
      const [endedActivities] = await db.query(
        `SELECT id, title, start_time, end_time FROM attendance_activities
         WHERE end_time <= ?`,
        [now],
      );

      const result = [];
      for (const student of students) {
        // 获取该学生的打卡记录
        let recordQuery = `SELECT r.* FROM attendance_records r WHERE r.user_id = ?`;
        let recordParams = [student.id];

        if (startDate) {
          recordQuery += ` AND r.check_time >= ?`;
          recordParams.push(startDate);
        }
        if (endDate) {
          recordQuery += ` AND r.check_time <= ?`;
          recordParams.push(endDate + " 23:59:59");
        }

        const [records] = await db.query(recordQuery, recordParams);

        const totalRecords = records.length;
        const lateCount = records.filter(
          (r) => r.final_status === "abnormal",
        ).length;
        const normalCount = records.filter(
          (r) => r.final_status === "normal",
        ).length;

        // 计算缺勤：已结束活动中该学生没有打卡记录的
        let absentCount = 0;
        for (const activity of endedActivities) {
          const hasRecord = records.some((r) => r.activity_id === activity.id);
          if (!hasRecord) {
            absentCount++;
          }
        }

        const totalCourses = totalRecords + absentCount;

        result.push({
          studentId: student.student_id,
          studentName: student.name,
          className: className || "",
          totalCourses,
          lateCount,
          absentCount,
          leaveCount: 0,
          lateRate:
            totalCourses > 0 ? Math.round((lateCount / totalCourses) * 100) : 0,
          absentRate:
            totalCourses > 0
              ? Math.round((absentCount / totalCourses) * 100)
              : 0,
          totalAbnormalRate:
            totalCourses > 0
              ? Math.round(((lateCount + absentCount) / totalCourses) * 100)
              : 0,
        });
      }

      res.json(result);
    } catch (error) {
      console.error("Get student stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// 获取班级考勤统计
router.get(
  "/classes",
  authenticateToken,
  requireRole("teacher"),
  async (req, res) => {
    try {
      // 由于没有班级表，返回基于真实数据的统计
      const [students] = await db.query(
        `SELECT id, student_id, name FROM users WHERE role = 'student'`,
      );

      const now = new Date();
      const [endedActivities] = await db.query(
        `SELECT id FROM attendance_activities WHERE end_time <= ?`,
        [now],
      );

      // 获取所有学生的迟到和缺勤统计
      let totalLateCount = 0;
      let totalAbsentCount = 0;

      for (const student of students) {
        const [records] = await db.query(
          `SELECT final_status FROM attendance_records WHERE user_id = ?`,
          [student.id],
        );

        totalLateCount += records.filter(
          (r) => r.final_status === "abnormal",
        ).length;

        // 缺勤
        for (const activity of endedActivities) {
          const [hasRecord] = await db.query(
            `SELECT id FROM attendance_records WHERE user_id = ? AND activity_id = ? LIMIT 1`,
            [student.id, activity.id],
          );
          if (hasRecord.length === 0) {
            totalAbsentCount++;
          }
        }
      }

      const totalStudents = students.length;
      const avgLateRate =
        totalStudents > 0
          ? Math.round((totalLateCount / (totalStudents || 1)) * 10) / 10
          : 0;
      const avgAbsentRate =
        totalStudents > 0
          ? Math.round((totalAbsentCount / (totalStudents || 1)) * 10) / 10
          : 0;

      res.json([
        {
          className: "全部学生",
          totalStudents,
          averageLateRate: avgLateRate,
          averageAbsentRate: avgAbsentRate,
          totalLateCount,
          totalAbsentCount,
          totalLeaveCount: 0,
        },
      ]);
    } catch (error) {
      console.error("Get class stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// 获取日期趋势数据
router.get(
  "/trend",
  authenticateToken,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const beijingNow = getBeijingNow();

      // 最近7天（北京时间）
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(beijingNow);
        date.setUTCDate(date.getUTCDate() - i);
        const dateStr = getBeijingDateStr(date);

        // 该日期的迟到数（abnormal 记录）
        const [lateData] = await db.query(
          `SELECT COUNT(*) as count FROM attendance_records r
           WHERE DATE(CONVERT_TZ(r.check_time, '+00:00', '+08:00')) = ?
           AND r.final_status = 'abnormal'`,
          [dateStr],
        );

        // 该日期已结束的活动
        const [endedActs] = await db.query(
          `SELECT a.id FROM attendance_activities a
           WHERE CONVERT_TZ(a.end_time, '+00:00', '+08:00') <= ?
           AND CONVERT_TZ(a.start_time, '+00:00', '+08:00') >= ?`,
          [dateStr + " 23:59:59", dateStr + " 00:00:00"],
        );

        let absentCount = 0;
        if (endedActs.length > 0) {
          const activityIds = endedActs.map((a) => a.id);
          const [absentStudents] = await db.query(
            `SELECT COUNT(*) as count FROM users u
             WHERE u.role = 'student'
             AND NOT EXISTS (
               SELECT 1 FROM attendance_records r
               WHERE r.user_id = u.id
               AND r.activity_id IN (?)
               AND DATE(CONVERT_TZ(r.check_time, '+00:00', '+08:00')) = ?
             )`,
            [activityIds, dateStr],
          );
          absentCount = absentStudents[0].count;
        }

        result.push({
          date: dateStr,
          lateCount: lateData[0].count,
          absentCount,
          leaveCount: 0,
          totalAbnormalCount: lateData[0].count + absentCount,
        });
      }

      res.json(result);
    } catch (error) {
      console.error("Get trend data error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// 获取迟到时长分布
router.get(
  "/late-duration",
  authenticateToken,
  requireRole("teacher"),
  async (req, res) => {
    try {
      // 基于活动开始时间和打卡时间估算迟到时长（只统计学生）
      const [records] = await db.query(
        `SELECT r.check_time, a.start_time
         FROM attendance_records r
         JOIN attendance_activities a ON r.activity_id = a.id
         JOIN users u ON r.user_id = u.id
         WHERE r.final_status = 'abnormal'
         AND u.role = 'student'`,
      );

      let count0_5 = 0;
      let count5_15 = 0;
      let count15_30 = 0;
      let count30plus = 0;

      for (const r of records) {
        const checkTime = new Date(r.check_time);
        const startTime = new Date(r.start_time);
        const diffMinutes = (checkTime - startTime) / (1000 * 60);

        if (diffMinutes <= 5) count0_5++;
        else if (diffMinutes <= 15) count5_15++;
        else if (diffMinutes <= 30) count15_30++;
        else count30plus++;
      }

      const total = count0_5 + count5_15 + count15_30 + count30plus;

      res.json([
        {
          durationRange: "0-5分钟",
          count: count0_5,
          percentage: total > 0 ? Math.round((count0_5 / total) * 100) : 0,
        },
        {
          durationRange: "5-15分钟",
          count: count5_15,
          percentage: total > 0 ? Math.round((count5_15 / total) * 100) : 0,
        },
        {
          durationRange: "15-30分钟",
          count: count15_30,
          percentage: total > 0 ? Math.round((count15_30 / total) * 100) : 0,
        },
        {
          durationRange: "30分钟以上",
          count: count30plus,
          percentage: total > 0 ? Math.round((count30plus / total) * 100) : 0,
        },
      ]);
    } catch (error) {
      console.error("Get late duration stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

module.exports = router;
