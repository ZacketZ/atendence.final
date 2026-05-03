const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'attendance_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
  timezone: '+08:00',
});

pool.on('connection', (connection) => {
  console.log('[DB] 连接池创建新连接');
  connection.on('error', (err) => {
    console.error('[DB] 连接级错误:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.warn('[DB] 连接丢失，连接池将自动重建');
    }
  });
});

pool.on('acquire', (connection) => {
  console.log(`[DB] 获取连接 threadId=${connection.threadId}`);
});

pool.on('release', (connection) => {
  console.log(`[DB] 释放连接 threadId=${connection.threadId}`);
});

pool.on('enqueue', () => {
  console.warn('[DB] 等待可用连接（连接池已满）');
});

const promisePool = pool.promise();

/**
 * @description 测试数据库连接是否正常
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  const maxRetries = 5;
  const retryDelay = 3000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const conn = await promisePool.getConnection();
      await conn.ping();
      conn.release();
      console.log('[DB] 数据库连接成功 ✓');
      return true;
    } catch (error) {
      console.error(`[DB] 连接尝试 ${attempt}/${maxRetries} 失败: ${error.message}`);
      if (attempt < maxRetries) {
        console.log(`[DB] ${retryDelay / 1000}秒后重试...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  console.error('[DB] 数据库连接失败，请检查 MySQL 是否启动以及 .env 配置是否正确');
  return false;
}

/**
 * @description 优雅关闭连接池
 * @returns {Promise<void>}
 */
async function closePool() {
  try {
    await pool.end();
    console.log('[DB] 连接池已关闭');
  } catch (error) {
    console.error('[DB] 关闭连接池失败:', error.message);
  }
}

module.exports = {
  pool: promisePool,
  testConnection,
  closePool,
};
