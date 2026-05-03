import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/store/user";
import { getToken } from "@/utils/auth";
import { ROLE_HOME_MAP, WHITE_LIST } from "@/constants";
import { ElMessage } from "element-plus";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: { requiresAuth: false, title: "登录" },
  },
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/403",
    name: "Forbidden",
    component: () => import("@/views/error/403.vue"),
    meta: { requiresAuth: false, title: "访问受限" },
  },
  {
    path: "/admin",
    component: () => import("@/layout/AdminLayout.vue"),
    meta: { requiresAuth: true, role: "admin" },
    children: [
      {
        path: "dashboard",
        name: "AdminDashboard",
        component: () => import("@/views/admin/dashboard/index.vue"),
        meta: { title: "管理员仪表板", keepAlive: true },
      },
      {
        path: "schedule",
        name: "AdminSchedule",
        component: () => import("@/views/admin/schedule/index.vue"),
        meta: { title: "课表管理" },
      },
      {
        path: "attendance",
        name: "AdminAttendance",
        component: () => import("@/views/admin/attendance/index.vue"),
        meta: { title: "考勤管理" },
      },
      {
        path: "statistics",
        name: "AdminStatistics",
        component: () => import("@/views/admin/statistics/index.vue"),
        meta: { title: "统计报表" },
      },
    ],
  },
  {
    path: "/staff",
    component: () => import("@/layout/StaffLayout.vue"),
    meta: { requiresAuth: true, role: "staff" },
    children: [
      {
        path: "dashboard",
        name: "StaffDashboard",
        component: () => import("@/views/staff/task/index.vue"),
        meta: { title: "教职工仪表板", keepAlive: true },
      },
      {
        path: "task",
        name: "StaffTask",
        component: () => import("@/views/staff/task/index.vue"),
        meta: { title: "任务管理" },
      },
      {
        path: "checkin",
        name: "StaffCheckin",
        component: () => import("@/views/staff/checkin/index.vue"),
        meta: { title: "签到管理" },
      },
      {
        path: "monitor",
        name: "StaffMonitor",
        component: () => import("@/views/staff/monitor/index.vue"),
        meta: { title: "课堂监控" },
      },
    ],
  },
  {
    path: "/student",
    component: () => import("@/layout/StudentLayout.vue"),
    meta: { requiresAuth: true, role: "student" },
    children: [
      {
        path: "dashboard",
        name: "StudentDashboard",
        component: () => import("@/views/student/checkin/index.vue"),
        meta: { title: "学生仪表板", keepAlive: true },
      },
      {
        path: "checkin",
        name: "StudentCheckin",
        component: () => import("@/views/student/checkin/index.vue"),
        meta: { title: "签到打卡" },
      },
      {
        path: "record",
        name: "StudentRecord",
        component: () => import("@/views/student/record/index.vue"),
        meta: { title: "考勤记录" },
      },
      {
        path: "leave",
        name: "StudentLeave",
        component: () => import("@/views/student/leave/index.vue"),
        meta: { title: "请假申请" },
      },
      {
        path: "schedule",
        name: "StudentSchedule",
        component: () => import("@/views/student/schedule/index.vue"),
        meta: { title: "课程表" },
      },
      {
        path: "profile",
        name: "StudentProfile",
        component: () => import("@/views/student/profile/index.vue"),
        meta: { title: "个人信息" },
      },
      {
        path: "settings",
        name: "StudentSettings",
        component: () => import("@/views/student/settings/index.vue"),
        meta: { title: "账号设置" },
      },
    ],
  },
  {
    path: "/test",
    name: "TestPage",
    component: () => import("@/views/test/index.vue"),
    meta: { requiresAuth: false, title: "路由测试" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/error/404.vue"),
    meta: { requiresAuth: false, title: "页面未找到" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore();
  const token = getToken();

  document.title = to.meta.title ? `${to.meta.title} - 考勤系统` : "考勤系统";

  if (WHITE_LIST.includes(to.path)) {
    if (to.path === "/login" && userStore.userInfo && token) {
      next(ROLE_HOME_MAP[userStore.userInfo.role] || "/login");
      return;
    }
    next();
    return;
  }

  if (!token || !userStore.userInfo) {
    ElMessage.warning("请先登录");
    next({
      path: "/login",
      query: { redirect: encodeURIComponent(to.fullPath) },
    });
    return;
  }

  if (to.meta.role) {
    const userRole = userStore.userInfo.role;
    if (userRole !== to.meta.role) {
      ElMessage.error("您没有权限访问此页面");
      next("/403");
      return;
    }
  }

  if (to.meta.permissions && to.meta.permissions.length > 0) {
    // 预留：细粒度权限检查
    next();
    return;
  }

  next();
});

router.afterEach(() => {});

router.onError((error) => {
  console.error("[Router Error]", error);
  if (error.message.includes("Failed to fetch dynamically imported module")) {
    ElMessage.error("页面加载失败，请刷新重试");
  }
});

export default router;
