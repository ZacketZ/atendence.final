<template>
  <div class="sidebar">
    <el-scrollbar height="calc(100vh - 60px)">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <!-- 管理员菜单 -->
        <template v-if="userRole === 'admin'">
          <el-sub-menu index="dashboard">
            <template #title>
              <el-icon><DataLine /></el-icon>
              <span>仪表板</span>
            </template>
            <el-menu-item index="/admin/dashboard">
              <el-icon><DataAnalysis /></el-icon>
              <span>数据概览</span>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="management">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>管理</span>
            </template>
            <el-menu-item index="/admin/attendance">
              <el-icon><List /></el-icon>
              <span>考勤管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/statistics">
              <el-icon><TrendCharts /></el-icon>
              <span>统计报表</span>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="user">
            <template #title>
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/admin/users/staff">
              <el-icon><Avatar /></el-icon>
              <span>教职工管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/users/student">
              <el-icon><UserFilled /></el-icon>
              <span>学生管理</span>
            </el-menu-item>
          </el-sub-menu>
        </template>

        <!-- 教职工菜单 -->
        <template v-else-if="userRole === 'staff'">
          <el-menu-item index="/staff/task">
            <el-icon><Document /></el-icon>
            <span>任务管理</span>
          </el-menu-item>

          <el-sub-menu index="reports">
            <template #title>
              <el-icon><PieChart /></el-icon>
              <span>报告</span>
            </template>
            <el-menu-item index="/staff/reports/attendance">
              <el-icon><TrendCharts /></el-icon>
              <span>考勤报告</span>
            </el-menu-item>
            <el-menu-item index="/staff/reports/class">
              <el-icon><DataAnalysis /></el-icon>
              <span>班级报告</span>
            </el-menu-item>
          </el-sub-menu>
        </template>

        <!-- 学生菜单 -->
        <template v-else-if="userRole === 'student'">
          <el-menu-item index="/student/checkin">
            <el-icon><List /></el-icon>
            <span>签到打卡</span>
          </el-menu-item>

          <el-menu-item index="/student/record">
            <el-icon><Document /></el-icon>
            <span>考勤记录</span>
          </el-menu-item>

          <el-menu-item index="/student/leave">
            <el-icon><Connection /></el-icon>
            <span>请假申请</span>
          </el-menu-item>

          <el-sub-menu index="my">
            <template #title>
              <el-icon><User /></el-icon>
              <span>我的</span>
            </template>
            <el-menu-item index="/student/profile">
              <el-icon><Avatar /></el-icon>
              <span>个人信息</span>
            </el-menu-item>
            <el-menu-item index="/student/settings">
              <el-icon><Setting /></el-icon>
              <span>账号设置</span>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/store/user";
import {
  DataLine,
  Setting,
  List,
  TrendCharts,
  User,
  Avatar,
  UserFilled,
  Document,
  PieChart,
  DataAnalysis,
  Connection,
} from "@element-plus/icons-vue";

const route = useRoute();
const userStore = useUserStore();

// 是否折叠侧边栏
const isCollapse = ref(false);

// 用户角色
const userRole = computed(() => userStore.userInfo?.role || "");

// 当前激活的菜单项
const activeMenu = computed(() => {
  return route.path;
});

// 监听路由变化，自动展开菜单
onMounted(() => {
  // 如果是移动端，默认折叠
  if (window.innerWidth <= 768) {
    isCollapse.value = true;
  }
});

// 响应窗口大小变化
window.addEventListener("resize", () => {
  if (window.innerWidth <= 768) {
    isCollapse.value = true;
  }
});
</script>

<style lang="scss" scoped>
.sidebar {
  width: 220px;
  height: calc(100vh - 60px);
  background-color: #304156;
  transition: width 0.3s;

  &.collapsed {
    width: 64px;
  }

  :deep(.el-menu) {
    border-right: none;
  }

  :deep(.el-menu-item) {
    &:hover {
      background-color: #263445;
    }

    &.is-active {
      background-color: #263445;
    }
  }

  :deep(.el-sub-menu__title) {
    &:hover {
      background-color: #263445;
    }
  }
}

// 移动端适配
@media screen and (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 60px;
    left: 0;
    z-index: 999;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }
}
</style>
