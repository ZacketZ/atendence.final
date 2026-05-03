<template>
  <div class="student-home">
    <header class="header">
      <h1>考勤签到系统 - 学生首页</h1>
      <button @click="logout" class="logout-btn">退出登录</button>
    </header>
    <main class="content">
      <div class="welcome-card">
        <h2>欢迎, {{ userStore.userInfo?.username }}</h2>
        <p class="role">角色：学生</p>
      </div>
      <div class="checkin-card">
        <h3>今日签到</h3>
        <p v-if="!todayRecord" class="status-text">未签到</p>
        <p
          v-else
          class="status-text"
          :class="todayRecord.final_status === 'normal' ? 'success' : 'warning'"
        >
          {{
            todayRecord.final_status === "normal" ? "已签到" : "已签到（异常）"
          }}
        </p>
        <button v-if="!todayRecord" @click="goCheckin">立即签到</button>
        <p v-if="todayRecord" class="checkin-time">
          签到时间：{{ formatTime(todayRecord.check_time) }}
        </p>
      </div>
      <div class="stats-card">
        <h3>本月考勤统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">正常</span>
            <span class="stat-value success">{{ monthlyStats.normal }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">迟到</span>
            <span class="stat-value warning">{{ monthlyStats.late }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">缺勤</span>
            <span class="stat-value danger">{{ monthlyStats.absent }}</span>
          </div>
        </div>
      </div>
      <div class="history-card">
        <h3>近期记录</h3>
        <div class="history-list">
          <div v-if="recentRecords.length === 0" class="empty-tip">
            暂无打卡记录
          </div>
          <div
            v-for="(item, index) in recentRecords"
            :key="index"
            class="history-item"
          >
            <span class="date">{{ formatDate(item.check_time) }}</span>
            <span class="time">{{ formatTime(item.check_time) }}</span>
            <span
              class="status"
              :class="item.final_status === 'normal' ? 'success' : 'warning'"
            >
              {{ item.final_status === "normal" ? "正常" : "迟到" }}
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import { request } from "@/utils/request";

const router = useRouter();
const userStore = useUserStore();

interface RecordItem {
  id: number;
  activity_id: number;
  user_id: number;
  check_time: string;
  gps_longitude: number;
  gps_latitude: number;
  liveness_result: string;
  final_status: string;
  device_info: string | null;
  created_at: string;
  title: string;
}

const records = ref<RecordItem[]>([]);

const todayRecord = computed(() => {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  return records.value.find((r) => r.check_time.startsWith(todayStr)) || null;
});

const recentRecords = computed(() => {
  return records.value.slice(0, 10);
});

const monthlyStats = computed(() => {
  const now = new Date();
  const monthStr = now.toISOString().slice(0, 7);
  const monthRecords = records.value.filter((r) =>
    r.check_time.startsWith(monthStr),
  );
  return {
    normal: monthRecords.filter((r) => r.final_status === "normal").length,
    late: monthRecords.filter((r) => r.final_status === "abnormal").length,
    absent: 0,
  };
});

const formatDate = (dt: string) => {
  if (!dt) return "";
  return dt.split("T")[0];
};

const formatTime = (dt: string) => {
  if (!dt) return "";
  const parts = dt.split("T")[1]?.split(".")[0]?.split(":");
  if (!parts) return "";
  return `${parts[0]}:${parts[1]}`;
};

const fetchRecords = async () => {
  try {
    const data = await request.get<RecordItem[]>("/records/student");
    records.value = data;
  } catch (error) {
    console.error("获取打卡记录失败:", error);
  }
};

const goCheckin = () => {
  router.push("/student/checkin");
};

const logout = () => {
  userStore.clearUser();
  router.push("/login");
};

onMounted(() => {
  fetchRecords();
});
</script>

<style scoped>
.student-home {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header h1 {
  color: #333;
  font-size: 24px;
}

.logout-btn {
  padding: 8px 20px;
  background: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.content {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.welcome-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.welcome-card h2 {
  color: #333;
  margin-bottom: 8px;
}

.role {
  color: #666;
  font-size: 14px;
}

.checkin-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  color: white;
  margin-bottom: 20px;
}

.checkin-card h3 {
  font-size: 24px;
  margin-bottom: 16px;
}

.checkin-card .status-text {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 24px;
}

.checkin-card .status-text.success {
  color: #c6f6d5;
}

.checkin-card .status-text.warning {
  color: #feebc8;
}

.checkin-card button {
  padding: 16px 48px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.checkin-card button:hover {
  transform: scale(1.05);
}

.checkin-time {
  margin-top: 20px;
  font-size: 18px;
  opacity: 0.9;
}

.stats-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stats-card h3 {
  color: #333;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.stat-label {
  display: block;
  color: #666;
  margin-bottom: 8px;
  font-size: 14px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
}

.stat-value.success {
  color: #48bb78;
}

.stat-value.warning {
  color: #ed8936;
}

.stat-value.danger {
  color: #f56565;
}

.history-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.history-card h3 {
  color: #333;
  margin-bottom: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-tip {
  text-align: center;
  color: #999;
  padding: 20px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.history-item .date {
  color: #333;
  font-weight: 500;
}

.history-item .time {
  color: #666;
}

.history-item .status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.history-item .status.success {
  background: #c6f6d5;
  color: #276749;
}

.history-item .status.warning {
  background: #feebc8;
  color: #c05621;
}
</style>
