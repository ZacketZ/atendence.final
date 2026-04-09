<template>
  <div class="login-container">
    <div class="login-box">
      <h1>考勤签到系统</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-item">
          <label>账号</label>
          <input v-model="formData.username" type="text" placeholder="请输入账号" />
        </div>
        <div class="form-item">
          <label>密码</label>
          <input v-model="formData.password" type="password" placeholder="请输入密码" />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      <div class="test-accounts">
        <p>测试账号：</p>
        <p>管理员: admin / 123456</p>
        <p>考勤员: staff / 123456</p>
        <p>学生: student / 123456</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/user'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const formData = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!formData.username || !formData.password) {
    alert('请输入账号和密码')
    return
  }

  loading.value = true
  try {
    const res = await login(formData.username, formData.password)
    userStore.setUser(res)
    router.push(`/${res.role}/home`)
  } catch (error) {
    alert('登录失败：' + (error as Error).message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-box h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

.form-item input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-item input:focus {
  outline: none;
  border-color: #667eea;
}

button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.3s;
}

button:hover:not(:disabled) {
  opacity: 0.9;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-accounts {
  margin-top: 24px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
}

.test-accounts p {
  margin: 4px 0;
  font-size: 13px;
  color: #666;
}
</style>
