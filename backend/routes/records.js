const express = require("express");
const { authenticateToken, requireRole } = require("../middleware/auth");
const recordService = require("../services/RecordService");

const router = express.Router();

// 学生打卡
router.post(
  "/",
  authenticateToken,
  requireRole("student"),
  async (req, res) => {
    try {
      const {
        activity_id,
        check_time,
        gps_longitude,
        gps_latitude,
        liveness_result,
        device_info,
      } = req.body;
      const user_id = req.user.id;
      const result = await recordService.createRecord(
        user_id,
        activity_id,
        check_time,
        gps_longitude,
        gps_latitude,
        liveness_result,
        device_info,
      );
      res.status(201).json(result);
    } catch (error) {
      console.error("Check-in error:", error);
      if (error.message === "Activity not found") {
        return res.status(404).json({ error: error.message });
      } else if (
        error.message === "Activity is not active" ||
        error.message === "You have already checked in for this activity"
      ) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// 获取学生的打卡记录
router.get(
  "/student",
  authenticateToken,
  requireRole("student"),
  async (req, res) => {
    try {
      const user_id = req.user.id;
      const records = await recordService.getStudentRecords(user_id);
      res.json(records);
    } catch (error) {
      console.error("Get student records error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// 获取活动的打卡记录（教师权限）
router.get(
  "/activity/:id",
  authenticateToken,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const records = await recordService.getActivityRecords(id);
      res.json(records);
    } catch (error) {
      console.error("Get activity records error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// 获取所有考勤记录（管理员端，支持分页和筛选）
router.get("/", authenticateToken, requireRole("teacher"), async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      status,
      startDate,
      endDate,
      className,
      studentName,
      studentId,
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    let whereClauses = [];
    let params = [];

    if (status && status !== "all") {
      if (status === "abnormal") {
        whereClauses.push("r.final_status IN ('late', 'absent', 'abnormal')");
      } else {
        whereClauses.push("r.final_status = ?");
        params.push(status);
      }
    }
    if (startDate) {
      whereClauses.push("r.check_time >= ?");
      params.push(startDate);
    }
    if (endDate) {
      whereClauses.push("r.check_time <= ?");
      params.push(endDate + " 23:59:59");
    }
    if (studentName) {
      whereClauses.push("u.name LIKE ?");
      params.push(`%${studentName}%`);
    }
    if (studentId) {
      whereClauses.push("u.student_id LIKE ?");
      params.push(`%${studentId}%`);
    }

    const whereSQL =
      whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

    // 查询总数
    const [countResult] = await require("../config/db").pool.query(
      `SELECT COUNT(*) as total FROM attendance_records r JOIN users u ON r.user_id = u.id ${whereSQL}`,
      params,
    );
    const total = countResult[0].total;

    // 查询分页数据
    const [records] = await require("../config/db").pool.query(
      `SELECT r.*, u.student_id, u.name as student_name FROM attendance_records r JOIN users u ON r.user_id = u.id ${whereSQL} ORDER BY r.check_time DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    res.json({
      records: records.map((r) => ({
        id: r.id,
        studentId: r.student_id,
        studentName: r.student_name,
        className: r.className || "",
        courseName: r.courseName || "",
        date: r.check_time
          ? typeof r.check_time === "string"
            ? r.check_time.split(" ")[0]
            : r.check_time instanceof Date
              ? r.check_time.toISOString().split("T")[0]
              : ""
          : "",
        checkinTime: r.check_time,
        status: r.final_status,
        location: `${r.gps_longitude}, ${r.gps_latitude}`,
        teacher: r.teacher_name || "",
        remark: r.remark || "",
      })),
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error("Get records error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 修改考勤状态（管理员端）
router.post(
  "/modify",
  authenticateToken,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const { recordId, newStatus, reason } = req.body;
      if (!recordId || !newStatus || !reason) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      await require("../config/db").pool.query(
        "UPDATE attendance_records SET final_status = ?, remark = ? WHERE id = ?",
        [newStatus, reason, recordId],
      );
      res.json({ message: "Attendance status modified successfully" });
    } catch (error) {
      console.error("Modify attendance status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// 导出考勤数据（管理员端）
router.post(
  "/export",
  authenticateToken,
  requireRole("teacher"),
  async (req, res) => {
    try {
      // 导出功能暂未完整实现，返回模拟数据
      res.json({ url: "" });
    } catch (error) {
      console.error("Export attendance data error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

module.exports = router;
