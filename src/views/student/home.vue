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
        <p v-if="!hasCheckedIn" class="status-text">未签到</p>
        <p v-else class="status-text success">已签到</p>
        <button v-if="!hasCheckedIn" @click="handleCheckIn" :disabled="checkingIn">
          {{ checkingIn ? '签到中...' : '立即签到' }}
        </button>
        <p v-if="checkInTime" class="checkin-time">签到时间：{{ checkInTime }}</p>
      </div>
      <div class="stats-card">
        <h3>本月考勤统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">正常</span>
            <span class="stat-value success">18</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">迟到</span>
            <span class="stat-value warning">2</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">缺勤</span>
            <span class="stat-value danger">0</span>
          </div>
        </div>
      </div>
      <div class="history-card">
        <h3>近期记录</h3>
        <div class="history-list">
          <div class="history-item">
            <span class="date">2026-04-08</span>
            <span class="time">08:15</span>
            <span class="status success">正常</span>
          </div>
          <div class="history-item">
            <span class="date">2026-04-07</span>
            <span class="time">08:35</span>
            <span class="status warning">迟到</span>
          </div>
          <div class="history-item">
            <span class="date">2026-04-06</span>
            <span class="time">08:10</span>
            <span class="status success">正常</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const hasCheckedIn = ref(false)
const checkingIn = ref(false)
const checkInTime = ref('')

const handleCheckIn = () => {
  checkingIn.value = true
  setTimeout(() => {
    hasCheckedIn.value = true
    checkInTime.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    checkingIn.value = false
    alert('签到成功！')
  }, 1000)
}

const logout = () => {
  userStore.clearUser()
  router.push('/login')
}
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

.checkin-card button:hover:not(:disabled) {
  transform: scale(1.05);
}

.checkin-card button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
