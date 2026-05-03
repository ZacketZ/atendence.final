const express = require("express");
const bcrypt = require("bcrypt");
const { pool: db } = require("../config/db");
const {
  authenticateToken,
  requireRole,
  requireAdmin,
} = require("../middleware/auth");
const userService = require("../services/UserService");

const router = express.Router();

// 获取所有学生信息（教师权限）
router.get(
  "/students",
  authenticateToken,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const students = await userService.getStudents();
      res.json(students);
    } catch (error) {
      console.error("Get students error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// 获取所有教师信息（管理员权限）
router.get("/teachers", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [teachers] = await db.query(
      "SELECT id, username, name FROM users WHERE role IN (?, ?)",
      ["teacher", "admin"],
    );
    res.json(teachers);
  } catch (error) {
    console.error("Get teachers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 获取单个用户信息（含扩展信息）
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    // 同时查询扩展信息
    const [profiles] = await db.query(
      "SELECT * FROM user_profiles WHERE user_id = ?",
      [id],
    );
    if (profiles.length > 0) {
      const p = profiles[0];
      user.phone = p.phone || "";
      user.email = p.email || "";
      user.emergency_contact = p.emergency_contact || "";
      user.emergency_phone = p.emergency_phone || "";
      user.dormitory = p.dormitory || "";
      user.avatar = p.avatar || "";
      user.enrollment_date = p.enrollment_date || "";
      user.counselor = p.counselor || "";
      user.college = p.college || "";
      user.grade = p.grade || "";
    } else {
      user.phone = "";
      user.email = "";
      user.emergency_contact = "";
      user.emergency_phone = "";
      user.dormitory = "";
      user.avatar = "";
      user.enrollment_date = "";
      user.counselor = "";
      user.college = "";
      user.grade = "";
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    if (error.message === "User not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// 添加学生（教师权限）
router.post(
  "/students",
  authenticateToken,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const { username, student_id, name } = req.body;
      const result = await userService.addStudent(username, student_id, name);
      res.status(201).json(result);
    } catch (error) {
      console.error("Add student error:", error);
      if (
        error.message === "Username already exists" ||
        error.message === "Student ID already exists"
      ) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// 添加教师（管理员权限）
router.post("/teachers", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, name } = req.body;

    // 检查用户名是否已存在
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash("123456", 10);

    // 创建教师用户
    await db.query(
      "INSERT INTO users (username, password_hash, role, name) VALUES (?, ?, ?, ?)",
      [username, hashedPassword, "teacher", name],
    );

    res.status(201).json({ message: "Teacher added successfully" });
  } catch (error) {
    console.error("Add teacher error:", error);
    if (error.message === "Username already exists") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// 更新学生信息（教师权限）
router.put(
  "/students/:id",
  authenticateToken,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { student_id, name, status } = req.body;
      const result = await userService.updateStudent(
        id,
        student_id,
        name,
        status,
      );
      res.json(result);
    } catch (error) {
      console.error("Update student error:", error);
      if (error.message === "Student not found") {
        return res.status(404).json({ error: error.message });
      } else if (error.message === "Student ID already exists") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// 更新教师信息（管理员权限）
router.put(
  "/teachers/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      // 检查教师是否存在
      const [existingUsers] = await db.query(
        "SELECT * FROM users WHERE id = ? AND role = ?",
        [id, "teacher"],
      );
      if (existingUsers.length === 0) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      // 更新教师信息
      await db.query("UPDATE users SET name = ? WHERE id = ?", [name, id]);

      res.json({ message: "Teacher updated successfully" });
    } catch (error) {
      console.error("Update teacher error:", error);
      if (error.message === "Teacher not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// 删除学生（教师权限）
router.delete(
  "/students/:id",
  authenticateToken,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await userService.deleteStudent(id);
      res.json(result);
    } catch (error) {
      console.error("Delete student error:", error);
      if (error.message === "Student not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// 删除教师（管理员权限）
router.delete(
  "/teachers/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      // 检查教师是否存在
      const [existingUsers] = await db.query(
        "SELECT * FROM users WHERE id = ? AND role = ?",
        [id, "teacher"],
      );
      if (existingUsers.length === 0) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      // 删除教师
      await db.query("DELETE FROM users WHERE id = ?", [id]);

      res.json({ message: "Teacher deleted successfully" });
    } catch (error) {
      console.error("Delete teacher error:", error);
      if (error.message === "Teacher not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// 获取通知偏好
router.get(
  "/notifications/preferences",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const [rows] = await db.query(
        "SELECT checkin_reminder, approval_notification, attendance_alert FROM user_notification_preferences WHERE user_id = ?",
        [userId],
      );
      if (rows.length > 0) {
        res.json({
          checkinReminder: !!rows[0].checkin_reminder,
          approvalNotification: !!rows[0].approval_notification,
          attendanceAlert: !!rows[0].attendance_alert,
        });
      } else {
        // 返回默认值
        res.json({
          checkinReminder: true,
          approvalNotification: true,
          attendanceAlert: true,
        });
      }
    } catch (error) {
      console.error("Get notification preferences error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// 更新通知偏好
router.put(
  "/notifications/preferences",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { checkinReminder, approvalNotification, attendanceAlert } =
        req.body;

      // 使用 INSERT ... ON DUPLICATE KEY UPDATE 实现 upsert
      await db.query(
        `INSERT INTO user_notification_preferences (user_id, checkin_reminder, approval_notification, attendance_alert)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           checkin_reminder = VALUES(checkin_reminder),
           approval_notification = VALUES(approval_notification),
           attendance_alert = VALUES(attendance_alert)`,
        [
          userId,
          checkinReminder ?? true,
          approvalNotification ?? true,
          attendanceAlert ?? true,
        ],
      );

      res.json({ message: "Notification preferences updated successfully" });
    } catch (error) {
      console.error("Update notification preferences error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// 更新用户个人信息
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      phone,
      email,
      emergencyContact,
      emergencyPhone,
      dormitory,
      avatar,
    } = req.body;

    // 使用 INSERT ... ON DUPLICATE KEY UPDATE 实现 upsert
    await db.query(
      `INSERT INTO user_profiles (user_id, phone, email, emergency_contact, emergency_phone, dormitory, avatar)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         phone = VALUES(phone),
         email = VALUES(email),
         emergency_contact = VALUES(emergency_contact),
         emergency_phone = VALUES(emergency_phone),
         dormitory = VALUES(dormitory),
         avatar = VALUES(avatar)`,
      [
        userId,
        phone || null,
        email || null,
        emergencyContact || null,
        emergencyPhone || null,
        dormitory || null,
        avatar || null,
      ],
    );

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 上传头像
router.post("/avatar", authenticateToken, async (req, res) => {
  try {
    // 头像上传功能暂未实现，返回默认头像URL
    res.json({ avatarUrl: "" });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 检查学号是否存在
router.post("/check-student-id", async (req, res) => {
  try {
    const { student_id } = req.body;
    const result = await userService.checkStudentId(student_id);
    res.json(result);
  } catch (error) {
    console.error("Check student ID error:", error);
    if (error.message === "Student ID is required") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
