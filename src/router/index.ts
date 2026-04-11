import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/store/user";
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
    path: "/admin",
    component: () => import("@/layout/AdminLayout.vue"),
    meta: { requiresAuth: true, role: "admin" },
    children: [
      {
        path: "dashboard",
        name: "AdminDashboard",
        component: () => import("@/views/admin/dashboard/index.vue"),
        meta: { title: "管理员仪表板" },
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
        meta: { title: "教职工仪表板" },
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
        meta: { title: "学生仪表板" },
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

// 全局路由守卫
const whiteList = ["/login", "/test"]; // 白名单路由

router.beforeEach((to, _from, next) => {
  // 开始加载进度条（如果有）
  // NProgress.start()

  const userStore = useUserStore();

  // 调试信息
  console.log("路由守卫:", {
    to: to.path,
    requiresAuth: to.meta.requiresAuth,
    roleRequired: to.meta.role,
    userInfo: userStore.userInfo,
    userRole: userStore.userInfo?.role,
  });

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 考勤系统` : "考勤系统";

  // 白名单路由直接通过
  if (whiteList.includes(to.path)) {
    if (to.path === "/login" && userStore.userInfo) {
      // 已登录访问登录页，重定向到对应角色首页
      const homePath = `/${userStore.userInfo.role}/dashboard`;
      console.log("已登录访问登录页，重定向到:", homePath);
      next(homePath);
      return;
    }
    next();
    return;
  }

  // 需要认证的页面
  if (!userStore.userInfo) {
    console.log("未登录，跳转到登录页");
    ElMessage.warning("请先登录");
    next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    return;
  }

  // 角色权限检查
  if (to.meta.role) {
    const userRole = userStore.userInfo.role;
    if (userRole !== to.meta.role) {
      console.log(`角色不匹配: 用户角色=${userRole}, 需要角色=${to.meta.role}`);
      ElMessage.error("您没有权限访问此页面");
      next(`/${userRole}/dashboard`);
      return;
    }
  }

  // 动态添加路由（如果需要）
  // 可以在这里添加动态路由配置

  next();
});

router.afterEach(() => {
  // 结束加载进度条
  // NProgress.done()
});

// 路由错误处理
router.onError((error) => {
  console.error("Router error:", error);
  ElMessage.error("路由发生错误");
});

export default router;
