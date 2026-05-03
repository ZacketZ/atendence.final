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
          <p class="stat-value">120</p>
        </div>
        <div class="stat-card">
          <h3>今日出勤</h3>
          <p class="stat-value">98</p>
        </div>
        <div class="stat-card">
          <h3>今日缺勤</h3>
          <p class="stat-value">22</p>
        </div>
        <div class="stat-card">
          <h3>出勤率</h3>
          <p class="stat-value">81.7%</p>
        </div>
      </div>
      <div class="action-area">
        <h3>快捷操作</h3>
        <div class="buttons">
          <button>考勤记录</button>
          <button>人员管理</button>
          <button>考勤员管理</button>
          <button>数据导出</button>
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
</style>
