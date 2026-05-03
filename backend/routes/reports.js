const express = require("express");
const { pool: db } = require("../config/db");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// 获取考勤报告（教职工视角 - 自己创建的所有活动考勤统计）
router.get(
  "/attendance",
  authenticateToken,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const teacherId = req.user.id;

      // 1. 该教职工创建的活动总数
      const [activityCount] = await db.query(
        `SELECT COUNT(*) as count FROM attendance_activities WHERE teacher_id = ?`,
        [teacherId],
      );

      // 2. 每个活动的考勤统计
      const [activities] = await db.query(
        `SELECT
           a.id,
           a.title,
           a.start_time,
           a.end_time,
           COUNT(DISTINCT r.user_id) as checked_in,
           SUM(CASE WHEN r.final_status = 'abnormal' THEN 1 ELSE 0 END) as abnormal_count
         FROM attendance_activities a
         LEFT JOIN attendance_records r ON a.id = r.activity_id
         WHERE a.teacher_id = ?
         GROUP BY a.id
         ORDER BY a.start_time DESC`,
        [teacherId],
      );

      // 3. 汇总统计
      let totalRecords = 0;
      let normalCount = 0;
      let abnormalCount = 0;

      const activityList = activities.map((a) => {
        const abnormal = Number(a.abnormal_count) || 0;
        const checkedIn = Number(a.checked_in) || 0;
        const normal = checkedIn - abnormal;
        totalRecords += checkedIn;
        normalCount += normal;
        abnormalCount += abnormal;

        const formatDate = (d) => {
          if (!d) return "";
          if (typeof d === "string") return d.substring(0, 10);
          return new Date(d).toISOString().substring(0, 10);
        };

        return {
          id: a.id,
          title: a.title,
          date: formatDate(a.start_time),
          startTime: a.start_time,
          endTime: a.end_time,
          checkedIn,
          abnormal,
          normal,
          rate:
            checkedIn > 0
              ? ((normal / checkedIn) * 100).toFixed(1) + "%"
              : "0%",
        };
      });

      const totalActivities =
        activityCount && activityCount[0] ? Number(activityCount[0].count) : 0;

      res.json({
        summary: {
          totalActivities: totalActivities || 0,
          totalRecords,
          normalCount,
          abnormalCount,
          attendanceRate:
            totalRecords > 0
              ? ((normalCount / totalRecords) * 100).toFixed(1) + "%"
              : "0%",
        },
        activities: activityList,
      });
    } catch (error) {
      console.error("Get attendance report error:", error.message);
      console.error("Stack:", error.stack);
      res
        .status(500)
        .json({ error: "Internal server error", detail: error.message });
    }
  },
);

// 获取班级报告（教职工视角 - 按学生维度汇总）
router.get(
  "/class",
  authenticateToken,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const teacherId = req.user.id;
      const { startDate, endDate } = req.query;

      // 构建时间筛选条件
      let dateFilter = "";
      const params = [teacherId];
      if (startDate && endDate) {
        dateFilter = " AND a.start_time >= ? AND a.end_time <= ?";
        params.push(startDate, endDate);
      } else if (startDate) {
        dateFilter = " AND a.start_time >= ?";
        params.push(startDate);
      } else if (endDate) {
        dateFilter = " AND a.end_time <= ?";
        params.push(endDate);
      }

      // 查询该教职工所有活动参与的学生考勤汇总
      const [students] = await db.query(
        `SELECT
           u.id,
           u.student_id,
           u.name,
           COUNT(DISTINCT a.id) as total_activities,
           COUNT(DISTINCT r.id) as total_records,
           SUM(CASE WHEN r.final_status = 'abnormal' THEN 1 ELSE 0 END) as abnormal_count
         FROM users u
         JOIN attendance_records r ON u.id = r.user_id
         JOIN attendance_activities a ON r.activity_id = a.id
         WHERE a.teacher_id = ? AND u.role = 'student'
         ${dateFilter}
         GROUP BY u.id, u.student_id, u.name
         ORDER BY u.student_id`,
        params,
      );

      const studentList = students.map((s) => {
        const totalRecords = Number(s.total_records) || 0;
        const abnormal = Number(s.abnormal_count) || 0;
        const normal = totalRecords - abnormal;

        return {
          id: s.id,
          studentId: s.student_id || "",
          name: s.name || "未知",
          totalActivities: Number(s.total_activities) || 0,
          totalRecords,
          normalCount: normal,
          abnormalCount: abnormal,
          rate:
            totalRecords > 0
              ? ((normal / totalRecords) * 100).toFixed(1) + "%"
              : "0%",
        };
      });

      // 汇总统计
      const totalStudents = studentList.length;
      const totalRecords = studentList.reduce(
        (sum, s) => sum + s.totalRecords,
        0,
      );
      const normalCount = studentList.reduce(
        (sum, s) => sum + s.normalCount,
        0,
      );
      const abnormalCount = studentList.reduce(
        (sum, s) => sum + s.abnormalCount,
        0,
      );

      res.json({
        summary: {
          totalStudents,
          totalRecords,
          normalCount,
          abnormalCount,
          attendanceRate:
            totalRecords > 0
              ? ((normalCount / totalRecords) * 100).toFixed(1) + "%"
              : "0%",
        },
        students: studentList,
      });
    } catch (error) {
      console.error("Get class report error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

module.exports = router;
