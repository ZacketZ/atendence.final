const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const { pool: db, testConnection, closePool } = require("./config/db");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const activityRoutes = require("./routes/activities");
const recordRoutes = require("./routes/records");
const appealRoutes = require("./routes/appeals");
const statisticsRoutes = require("./routes/statistics");
const dashboardRoutes = require("./routes/dashboard");
const reportRoutes = require("./routes/reports");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/appeals", appealRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Attendance System API is running" });
});

async function startServer() {
  const connected = await testConnection();
  if (!connected) {
    console.error("[Server] 数据库不可用，服务器启动终止");
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`[Server] 服务运行在 http://localhost:${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n[Server] 收到 ${signal}，正在优雅关闭...`);
    server.close(async () => {
      console.log("[Server] HTTP 服务器已关闭");
      await closePool();
      process.exit(0);
    });

    setTimeout(() => {
      console.error("[Server] 强制退出（超时）");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer();
