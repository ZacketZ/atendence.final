<template>
  <div class="not-found">
    <div class="content">
      <div class="error-code">404</div>
      <h1>页面未找到</h1>
      <p>抱歉，您访问的页面不存在</p>
      <el-button type="primary" @click="goHome">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.not-found {
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
      color: #409EFF;
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
  }
}
</style>