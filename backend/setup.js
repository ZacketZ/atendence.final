const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = parseInt(process.env.DB_PORT, 10) || 3306;
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "attendance_system";

const admins = [
  { username: "admin", name: "系统管理员" },
  { username: "admin2", name: "教务管理员" },
  { username: "admin3", name: "学工管理员" },
];

const teachers = [
  { username: "teacher1", name: "张老师" },
  { username: "teacher2", name: "李老师" },
  { username: "teacher3", name: "王老师" },
  { username: "teacher4", name: "赵老师" },
  { username: "teacher5", name: "陈老师" },
];

const students = [
  { username: "student1", student_id: "20230001", name: "张三", college: "计算机学院", grade: "2023级", major: "软件工程", class_name: "软件2301", phone: "13800001001", email: "zhangsan@example.com", dormitory: "北苑1号楼301室" },
  { username: "student2", student_id: "20230002", name: "李四", college: "计算机学院", grade: "2023级", major: "计算机科学与技术", class_name: "计科2301", phone: "13800001002", email: "lisi@example.com", dormitory: "北苑1号楼302室" },
  { username: "student3", student_id: "20230003", name: "王五", college: "数学学院", grade: "2023级", major: "应用数学", class_name: "数学2301", phone: "13800001003", email: "wangwu@example.com", dormitory: "南苑2号楼101室" },
  { username: "student4", student_id: "20230004", name: "赵六", college: "物理学院", grade: "2023级", major: "物理学", class_name: "物理2301", phone: "13800001004", email: "zhaoliu@example.com", dormitory: "南苑2号楼102室" },
  { username: "student5", student_id: "20230005", name: "陈七", college: "外语学院", grade: "2023级", major: "英语", class_name: "英语2301", phone: "13800001005", email: "chenqi@example.com", dormitory: "西苑3号楼201室" },
];

async function setup() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true,
    });

    console.log("[Setup] 已连接 MySQL");

    const initSQL = fs.readFileSync(
      path.resolve(__dirname, "config", "init.sql"),
      "utf-8"
    );

    await conn.query(initSQL);
    console.log("[Setup] 数据库和表创建成功");

    await conn.changeUser({ database: DB_NAME });

    const hashedPassword = await bcrypt.hash("123456", 10);

    console.log("\n========== 创建管理员账号 ==========");
    for (const admin of admins) {
      const [existing] = await conn.query("SELECT id FROM users WHERE username = ?", [admin.username]);
      if (existing.length === 0) {
        await conn.query("INSERT INTO users (username, password_hash, role, name) VALUES (?, ?, ?, ?)", [admin.username, hashedPassword, "admin", admin.name]);
        console.log(`  ✓ 管理员: ${admin.username} / 123456 (${admin.name})`);
      } else {
        console.log(`  - 管理员 ${admin.username} 已存在，跳过`);
      }
    }

    console.log("\n========== 创建教师账号 ==========");
    for (const teacher of teachers) {
      const [existing] = await conn.query("SELECT id FROM users WHERE username = ?", [teacher.username]);
      if (existing.length === 0) {
        await conn.query("INSERT INTO users (username, password_hash, role, name) VALUES (?, ?, ?, ?)", [teacher.username, hashedPassword, "teacher", teacher.name]);
        console.log(`  ✓ 教师: ${teacher.username} / 123456 (${teacher.name})`);
      } else {
        console.log(`  - 教师 ${teacher.username} 已存在，跳过`);
      }
    }

    console.log("\n========== 创建学生账号 ==========");
    for (const student of students) {
      const [existing] = await conn.query("SELECT id FROM users WHERE username = ?", [student.username]);
      if (existing.length === 0) {
        const [result] = await conn.query(
          "INSERT INTO users (username, password_hash, role, student_id, name, status) VALUES (?, ?, ?, ?, ?, ?)",
          [student.username, hashedPassword, "student", student.student_id, student.name, 1]
        );
        const userId = result.insertId;

        await conn.query(
          "INSERT INTO user_profiles (user_id, phone, email, college, grade, major, class_name, dormitory, enrollment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [userId, student.phone, student.email, student.college, student.grade, student.major, student.class_name, student.dormitory, "2023-09-01"]
        );

        await conn.query("INSERT INTO user_notification_preferences (user_id) VALUES (?)", [userId]);

        console.log(`  ✓ 学生: ${student.username} / 123456 (${student.name}, 学号: ${student.student_id})`);
      } else {
        console.log(`  - 学生 ${student.username} 已存在，跳过`);
      }
    }

    console.log("\n========== 全部完成 ==========");
    console.log("  管理员: admin, admin2, admin3");
    console.log("  教师:   teacher1 ~ teacher5");
    console.log("  学生:   student1 ~ student5");
    console.log("  默认密码: 123456\n");
  } catch (error) {
    console.error("[Setup] 失败:", error.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
    process.exit(0);
  }
}

setup();