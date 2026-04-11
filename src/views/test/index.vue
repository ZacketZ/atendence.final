<template>
  <div class="test-container">
    <h1>路由测试页面</h1>
    <p>如果这个页面能显示，说明路由系统正常工作</p>
    <div class="test-info">
      <p>当前时间: {{ currentTime }}</p>
      <p>路由路径: {{ $route.path }}</p>
      <p>路由名称: {{ $route.name }}</p>
    </div>
    <div class="test-links">
      <el-button type="primary" @click="goToProfile"
        >跳转到个人信息页面</el-button
      >
      <el-button @click="goBack">返回上一页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const currentTime = ref("");

onMounted(() => {
  currentTime.value = new Date().toLocaleString();
});

const goToProfile = () => {
  router.push("/student/profile");
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.test-container {
  padding: 40px;
  text-align: center;
  background-color: #f5f7fa;
  min-height: 100vh;
}

h1 {
  color: #303133;
  margin-bottom: 20px;
}

p {
  color: #606266;
  margin-bottom: 10px;
}

.test-info {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin: 30px auto;
  max-width: 500px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.test-links {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>
