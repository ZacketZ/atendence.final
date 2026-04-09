<template>
  <div class="staff-home">
    <header class="header">
      <h1>考勤签到系统 - 考勤员首页</h1>
      <button @click="logout" class="logout-btn">退出登录</button>
    </header>
    <main class="content">
      <div class="welcome-card">
        <h2>欢迎, {{ userStore.userInfo?.username }}</h2>
        <p class="role">角色：考勤员</p>
      </div>
      <div class="actions">
        <div class="action-card primary">
          <h3>开始考勤</h3>
          <p>进行日常考勤签到工作</p>
          <button @click="startAttendance">立即开始</button>
        </div>
        <div class="action-card">
          <h3>查看记录</h3>
          <p>查看历史考勤记录</p>
          <button>查看详情</button>
        </div>
      </div>
      <div class="recent-section">
        <h3>今日签到情况</h3>
        <div class="record-list">
          <div class="record-item">
            <span class="name">张三</span>
            <span class="time">08:25</span>
            <span class="status success">正常</span>
          </div>
          <div class="record-item">
            <span class="name">李四</span>
            <span class="time">08:32</span>
            <span class="status success">正常</span>
          </div>
          <div class="record-item">
            <span class="name">王五</span>
            <span class="time">--</span>
            <span class="status warning">迟到</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const logout = () => {
  userStore.clearUser()
  router.push('/login')
}

const startAttendance = () => {
  alert('开始考勤功能待开发')
}
</script>

<style scoped>
.staff-home {
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

.actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.action-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.action-card.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-card h3 {
  color: #333;
  margin-bottom: 8px;
  font-size: 20px;
}

.action-card.primary h3 {
  color: white;
}

.action-card p {
  color: #666;
  margin-bottom: 20px;
}

.action-card.primary p {
  color: rgba(255, 255, 255, 0.9);
}

.action-card button {
  padding: 10px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.action-card.primary button {
  background: white;
  color: #667eea;
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

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.record-item .name {
  color: #333;
  font-weight: 500;
}

.record-item .time {
  color: #666;
}

.record-item .status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.record-item .status.success {
  background: #c6f6d5;
  color: #276749;
}

.record-item .status.warning {
  background: #feebc8;
  color: #c05621;
}
</style>
