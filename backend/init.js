const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const { pool: db, testConnection, closePool } = require('./config/db');

async function initAdmin() {
  const connected = await testConnection();
  if (!connected) {
    console.error('[Init] 数据库不可用，初始化终止');
    process.exit(1);
  }

  try {
    const [existingAdmins] = await db.query(
      'SELECT * FROM users WHERE username = ? AND role = ?',
      ['admin', 'admin']
    );

    if (existingAdmins.length === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);

      await db.query(
        'INSERT INTO users (username, password_hash, role, name) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 'admin', '管理员']
      );

      console.log('[Init] 管理员账号创建成功 (用户名: admin, 密码: 123456)');
    } else {
      console.log('[Init] 管理员账号已存在，跳过创建');
    }

    const [existingTeachers] = await db.query(
      'SELECT * FROM users WHERE username = ? AND role = ?',
      ['staff', 'teacher']
    );

    if (existingTeachers.length === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);

      await db.query(
        'INSERT INTO users (username, password_hash, role, name) VALUES (?, ?, ?, ?)',
        ['staff', hashedPassword, 'teacher', '教职工']
      );

      console.log('[Init] 教职工账号创建成功 (用户名: staff, 密码: 123456)');
    } else {
      console.log('[Init] 教职工账号已存在，跳过创建');
    }

    const [existingStudents] = await db.query(
      'SELECT * FROM users WHERE username = ? AND role = ?',
      ['student', 'student']
    );

    if (existingStudents.length === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);

      await db.query(
        'INSERT INTO users (username, password_hash, role, student_id, name, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['student', hashedPassword, 'student', '20230001', '张三', 1]
      );

      console.log('[Init] 学生账号创建成功 (用户名: student, 密码: 123456)');
    } else {
      console.log('[Init] 学生账号已存在，跳过创建');
    }
  } catch (error) {
    console.error('[Init] 初始化失败:', error.message);
  } finally {
    await closePool();
    process.exit(0);
  }
}

initAdmin();
