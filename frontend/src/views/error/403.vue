<template>
  <div class="forbidden">
    <div class="content">
      <div class="error-code">403</div>
      <h1>访问受限</h1>
      <p>抱歉，您没有权限访问此页面</p>
      <div class="actions">
        <el-button type="primary" @click="goBack">返回上一页</el-button>
        <el-button @click="goHome">回到首页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const goBack = () => {
  router.back()
}

const goHome = () => {
  const role = userStore.userInfo?.role || 'student'
  router.push(`/${role}/dashboard`)
}
</script>

<style lang="scss" scoped>
.forbidden {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;

  .content {
    text-align: center;
    padding: 40px;

    .error-code {
      font-size: 120px;
      font-weight: bold;
      color: #E6A23C;
      margin-bottom: 20px;
      line-height: 1;
    }

    h1 {
      font-size: 32px;
      color: #303133;
      margin-bottom: 16px;
    }

    p {
      font-size: 16px;
      color: #606266;
      margin-bottom: 32px;
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 12px;
    }
  }
}
</style>
