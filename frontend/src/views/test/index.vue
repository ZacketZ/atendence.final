<template>
  <div class="test-container">
    <h1>路由测试与调试页面</h1>
    <p>用于测试路由跳转和解决循环跳转问题</p>

    <div class="user-info">
      <h2>当前用户状态</h2>
      <div v-if="userStore.userInfo">
        <p><strong>用户名:</strong> {{ userStore.userInfo.username }}</p>
        <p><strong>角色:</strong> {{ userStore.userInfo.role }}</p>
        <p><strong>ID:</strong> {{ userStore.userInfo.id }}</p>
        <el-button type="warning" @click="clearUser">清除用户信息</el-button>
      </div>
      <div v-else>
        <p>未登录</p>
      </div>
    </div>

    <div class="quick-login">
      <h2>快速登录测试</h2>
      <div class="login-buttons">
        <el-button type="primary" @click="loginAs('admin')"
          >以管理员身份登录</el-button
        >
        <el-button type="success" @click="loginAs('staff')"
          >以考勤员身份登录</el-button
        >
        <el-button type="info" @click="loginAs('student')"
          >以学生身份登录</el-button
        >
      </div>
    </div>

    <div class="test-links">
      <h2>测试链接</h2>
      <div class="link-buttons">
        <el-button @click="goTo('/login')">登录页面</el-button>
        <el-button @click="goTo('/admin/dashboard')">管理员仪表板</el-button>
        <el-button @click="goTo('/admin/attendance')">考勤管理</el-button>
        <el-button @click="goTo('/admin/statistics')">统计报表</el-button>
        <el-button @click="goTo('/student/dashboard')">学生仪表板</el-button>
        <el-button @click="goTo('/student/profile')">学生个人信息</el-button>
      </div>
    </div>

    <div class="debug-section">
      <h2>调试工具</h2>
      <div class="debug-buttons">
        <el-button @click="checkLocalStorage">检查LocalStorage</el-button>
        <el-button type="danger" @click="clearLocalStorage"
          >清除LocalStorage</el-button
        >
        <el-button @click="reloadPage">刷新页面</el-button>
      </div>

      <div v-if="debugInfo" class="debug-output">
        <h3>调试信息</h3>
        <pre>{{ debugInfo }}</pre>
      </div>
    </div>

    <div class="instructions">
      <h2>解决循环跳转问题的步骤</h2>
      <ol>
        <li>点击"清除LocalStorage"按钮</li>
        <li>点击"刷新页面"按钮</li>
        <li>点击"以管理员身份登录"按钮</li>
        <li>点击"考勤管理"按钮测试跳转</li>
      </ol>
      <p>如果还有问题，请检查浏览器控制台的日志信息。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import { ElMessage } from "element-plus";

const router = useRouter();
const userStore = useUserStore();
const debugInfo = ref<string>("");

const loginAs = async (role: "admin" | "staff" | "student") => {
  try {
    // 模拟登录
    const mockUser = {
      token: `${role}-${Date.now()}`,
      user: {
        id: role === "admin" ? 1 : role === "staff" ? 2 : 3,
        username: role,
        role: role,
      },
    };

    userStore.setUser(mockUser);
    ElMessage.success(`已登录为${role}`);

    // 跳转到对应角色的首页
    const homePath = `/${role}/dashboard`;
    router.push(homePath);
  } catch (error) {
    console.error("登录失败:", error);
    ElMessage.error("登录失败");
  }
};

const clearUser = () => {
  userStore.clearUser();
  ElMessage.success("用户信息已清除");
};

const goTo = (path: string) => {
  router.push(path);
};

const checkLocalStorage = () => {
  const userInfo = localStorage.getItem("userInfo");
  debugInfo.value = `LocalStorage userInfo: ${userInfo || "空"}`;
  ElMessage.info("已检查LocalStorage，查看下方调试信息");
};

const clearLocalStorage = () => {
  localStorage.clear();
  debugInfo.value = "LocalStorage 已清除";
  ElMessage.success("LocalStorage 已清除");
};

const reloadPage = () => {
  window.location.reload();
};
</script>

<style scoped>
.test-container {
  padding: 30px;
  max-width: 900px;
  margin: 0 auto;
  background-color: #f5f7fa;
  min-height: 100vh;
}

h1 {
  color: #303133;
  margin-bottom: 10px;
  text-align: center;
}

h2 {
  color: #409eff;
  margin-bottom: 15px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 5px;
}

.user-info,
.quick-login,
.test-links,
.debug-section,
.instructions {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.login-buttons,
.link-buttons,
.debug-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.debug-output {
  margin-top: 20px;
  padding: 15px;
  background-color: #2c3e50;
  border-radius: 4px;
}

.debug-output pre {
  color: #ecf0f1;
  font-family: "Courier New", monospace;
  font-size: 14px;
  overflow: auto;
  margin: 0;
}

.instructions ol {
  margin-left: 20px;
  line-height: 1.8;
}

.instructions li {
  margin-bottom: 8px;
}

.instructions p {
  margin-top: 15px;
  color: #606266;
  font-style: italic;
}
</style>
