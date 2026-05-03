<template>
  <div class="admin-home">
    <header class="header">
      <h1>考勤签到系统 - 管理员首页</h1>
      <button @click="logout" class="logout-btn">退出登录</button>
    </header>
    <main class="content">
      <div class="welcome-card">
        <h2>欢迎, {{ userStore.userInfo?.username }}</h2>
        <p class="role">角色：管理员</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>总人数</h3>
          <p class="stat-value">{{ dashboardData.todayStats.total }}</p>
        </div>
        <div class="stat-card">
          <h3>今日出勤</h3>
          <p class="stat-value">{{ dashboardData.todayStats.checkedIn }}</p>
        </div>
        <div class="stat-card">
          <h3>今日缺勤</h3>
          <p class="stat-value">{{ dashboardData.todayStats.pending }}</p>
        </div>
        <div class="stat-card">
          <h3>出勤率</h3>
          <p class="stat-value">{{ attendanceRate }}%</p>
        </div>
      </div>
      <div class="action-area">
        <h3>快捷操作</h3>
        <div class="buttons">
          <button @click="router.push('/admin/attendance')">考勤记录</button>
          <button @click="router.push('/admin/statistics')">统计报表</button>
          <button @click="router.push('/admin/schedule')">课表管理</button>
          <button>数据导出</button>
        </div>
      </div>
      <div
        class="recent-section"
        v-if="dashboardData.recentActivities.length > 0"
      >
        <h3>最近活动</h3>
        <div class="activity-list">
          <div
            v-for="(item, index) in dashboardData.recentActivities"
            :key="index"
            class="activity-item"
          >
            <span class="time">{{ item.time }}</span>
            <span class="user">{{ item.user }}</span>
            <span class="action" :class="item.status">{{ item.action }}</span>
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

interface DashboardStats {
  todayStats: {
    total: number;
    checkedIn: number;
    pending: number;
  };
  recentActivities: Array<{
    time: string;
    user: string;
    action: string;
    status: string;
  }>;
}

const dashboardData = ref<DashboardStats>({
  todayStats: { total: 0, checkedIn: 0, pending: 0 },
  recentActivities: [],
});

const attendanceRate = computed(() => {
  const total = dashboardData.value.todayStats.total;
  if (total === 0) return 0;
  return Math.round((dashboardData.value.todayStats.checkedIn / total) * 100);
});

const fetchDashboardData = async () => {
  try {
    const data = await request.get<DashboardStats>("/dashboard/stats");
    dashboardData.value = data;
  } catch (error) {
    console.error("获取仪表盘数据失败:", error);
  }
};

const logout = () => {
  userStore.clearUser();
  router.push("/login");
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.admin-home {
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
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
}

.stat-value {
  color: #333;
  font-size: 32px;
  font-weight: bold;
}

.action-area {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.action-area h3 {
  color: #333;
  margin-bottom: 20px;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.buttons button {
  padding: 14px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.buttons button:hover {
  opacity: 0.9;
}

.recent-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.recent-section h3 {
  color: #333;
  margin-bottom: 20px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.activity-item .time {
  color: #666;
  font-size: 13px;
  min-width: 140px;
}

.activity-item .user {
  color: #333;
  font-weight: 500;
  flex: 1;
  margin-left: 16px;
}

.activity-item .action {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.activity-item .action.success {
  background: #c6f6d5;
  color: #276749;
}

.activity-item .action.danger {
  background: #fed7d7;
  color: #c53030;
}
</style>
