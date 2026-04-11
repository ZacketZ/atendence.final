<template>
  <div class="settings-container">
    <div class="settings-header">
      <h2>账号设置</h2>
      <p>管理您的账号安全和通知偏好</p>
    </div>

    <div class="settings-content">
      <!-- 修改密码卡片 -->
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">修改密码</span>
          </div>
        </template>

        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-width="120px"
          label-position="left"
        >
          <el-form-item label="原密码" prop="oldPassword">
            <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="请输入原密码"
              show-password
            />
          </el-form-item>

          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password
            />
            <div class="password-tips">密码长度8-20位，必须包含字母和数字</div>
          </el-form-item>

          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="changingPassword"
              @click="handleChangePassword"
            >
              修改密码
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 通知偏好卡片 -->
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">通知偏好</span>
            <el-button
              type="primary"
              size="small"
              :loading="savingPreferences"
              @click="saveNotificationPreferences"
            >
              保存设置
            </el-button>
          </div>
        </template>

        <div class="notification-settings">
          <div class="notification-item">
            <div class="notification-info">
              <h4>签到提醒</h4>
              <p>上课前10分钟推送签到提醒</p>
            </div>
            <el-switch
              v-model="notificationPreferences.checkinReminder"
              active-color="#13ce66"
            />
          </div>

          <div class="notification-item">
            <div class="notification-info">
              <h4>审批结果通知</h4>
              <p>请假申请审批通过或驳回时通知</p>
            </div>
            <el-switch
              v-model="notificationPreferences.approvalNotification"
              active-color="#13ce66"
            />
          </div>

          <div class="notification-item">
            <div class="notification-info">
              <h4>考勤异常提醒</h4>
              <p>考勤记录出现异常时通知</p>
            </div>
            <el-switch
              v-model="notificationPreferences.attendanceAlert"
              active-color="#13ce66"
            />
          </div>
        </div>
      </el-card>

      <!-- 账号操作卡片 -->
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">账号操作</span>
          </div>
        </template>

        <div class="account-actions">
          <div class="action-item">
            <div class="action-info">
              <h4>退出登录</h4>
              <p>退出当前账号，返回登录页面</p>
            </div>
            <el-button type="danger" plain @click="handleLogout">
              退出登录
            </el-button>
          </div>

          <div class="action-item">
            <div class="action-info">
              <h4>切换账号</h4>
              <p>清除当前账号信息，返回登录页面</p>
            </div>
            <el-button @click="handleSwitchAccount"> 切换账号 </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import { useUserStore } from "@/store/user";
import {
  changePassword,
  getNotificationPreferences,
  updateNotificationPreferences,
  logout,
} from "@/api/user";

// 路由
const router = useRouter();

// 用户状态
const userStore = useUserStore();

// 表单引用
const passwordFormRef = ref<FormInstance>();

// 修改密码表单
const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// 修改密码验证规则
const passwordRules = {
  oldPassword: [{ required: true, message: "请输入原密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 8, max: 20, message: "密码长度8-20位", trigger: "blur" },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,20}$/,
      message: "密码必须包含字母和数字",
      trigger: "blur",
    },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

// 通知偏好
const notificationPreferences = reactive({
  checkinReminder: true,
  approvalNotification: true,
  attendanceAlert: true,
});

// 加载状态
const changingPassword = ref(false);
const savingPreferences = ref(false);

// 加载通知偏好
const loadNotificationPreferences = async () => {
  try {
    const preferences = await getNotificationPreferences();
    notificationPreferences.checkinReminder = preferences.checkinReminder;
    notificationPreferences.approvalNotification =
      preferences.approvalNotification;
    notificationPreferences.attendanceAlert = preferences.attendanceAlert;
  } catch (error) {
    ElMessage.error("加载通知偏好失败：" + (error as Error).message);
  }
};

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return;

  try {
    await passwordFormRef.value.validate();

    changingPassword.value = true;
    await changePassword(passwordForm.oldPassword, passwordForm.newPassword);

    ElMessage.success("密码修改成功，请重新登录");

    // 清空表单
    passwordForm.oldPassword = "";
    passwordForm.newPassword = "";
    passwordForm.confirmPassword = "";

    // 退出登录
    setTimeout(() => {
      handleLogout();
    }, 1500);
  } catch (error) {
    ElMessage.error("密码修改失败：" + (error as Error).message);
  } finally {
    changingPassword.value = false;
  }
};

// 保存通知偏好
const saveNotificationPreferences = async () => {
  try {
    savingPreferences.value = true;
    await updateNotificationPreferences(notificationPreferences);
    ElMessage.success("通知偏好已保存");
  } catch (error) {
    ElMessage.error("保存失败：" + (error as Error).message);
  } finally {
    savingPreferences.value = false;
  }
};

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm("确定要退出登录吗？", "退出登录", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      logout();
      userStore.clearUser();
      router.push("/login");
      ElMessage.success("已退出登录");
    })
    .catch(() => {
      // 用户取消
    });
};

// 切换账号
const handleSwitchAccount = () => {
  ElMessageBox.confirm(
    "切换账号将清除当前账号信息，确定要继续吗？",
    "切换账号",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "info",
    },
  )
    .then(() => {
      userStore.clearUser();
      router.push("/login");
      ElMessage.success("已清除账号信息，请重新登录");
    })
    .catch(() => {
      // 用户取消
    });
};

// 生命周期
onMounted(() => {
  loadNotificationPreferences();
});
</script>

<style scoped lang="scss">
.settings-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.settings-header {
  margin-bottom: 24px;

  h2 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 24px;
  }

  p {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .card-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }
}

.password-tips {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.notification-settings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;

  .notification-info {
    h4 {
      margin: 0 0 4px 0;
      color: #303133;
      font-size: 14px;
      font-weight: 500;
    }

    p {
      margin: 0;
      color: #909399;
      font-size: 12px;
    }
  }
}

.account-actions {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;

  .action-info {
    h4 {
      margin: 0 0 4px 0;
      color: #303133;
      font-size: 14px;
      font-weight: 500;
    }

    p {
      margin: 0;
      color: #909399;
      font-size: 12px;
    }
  }
}
</style>
