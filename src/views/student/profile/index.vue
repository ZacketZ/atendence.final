<template>
  <div class="profile-container">
    <div class="profile-header">
      <h2>个人信息</h2>
      <p>管理您的个人资料和账户信息</p>
    </div>

    <div class="profile-content">
      <!-- 基本信息卡片 -->
      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">基本信息</span>
            <el-button
              v-if="!isEditing"
              type="primary"
              size="small"
              @click="startEditing"
            >
              编辑
            </el-button>
            <div v-else class="edit-actions">
              <el-button size="small" @click="cancelEditing">取消</el-button>
              <el-button type="primary" size="small" @click="saveProfile">
                保存
              </el-button>
            </div>
          </div>
        </template>

        <div class="profile-form">
          <!-- 头像上传 -->
          <div class="avatar-section">
            <div class="avatar-upload">
              <el-avatar :size="100" :src="formData.avatar" class="avatar">
                {{ userInfo?.username?.charAt(0) || "U" }}
              </el-avatar>
              <div v-if="isEditing" class="avatar-actions">
                <el-upload
                  action="#"
                  :show-file-list="false"
                  :before-upload="beforeAvatarUpload"
                  :http-request="handleAvatarUpload"
                >
                  <el-button type="primary" size="small"> 更换头像 </el-button>
                </el-upload>
                <el-button
                  v-if="formData.avatar"
                  size="small"
                  @click="removeAvatar"
                >
                  移除
                </el-button>
              </div>
            </div>
          </div>

          <!-- 表单字段 -->
          <div class="form-fields">
            <el-form
              ref="profileFormRef"
              :model="formData"
              :rules="formRules"
              label-width="100px"
              label-position="left"
            >
              <!-- 只读信息 -->
              <el-form-item label="学号">
                <el-input :value="userInfo?.studentId || ''" disabled />
              </el-form-item>

              <el-form-item label="姓名">
                <el-input :value="userInfo?.name || ''" disabled />
              </el-form-item>

              <el-form-item label="班级">
                <el-input :value="userInfo?.className || ''" disabled />
              </el-form-item>

              <el-form-item label="专业">
                <el-input :value="userInfo?.major || ''" disabled />
              </el-form-item>

              <!-- 可编辑信息 -->
              <el-form-item label="手机号" prop="phone">
                <el-input
                  v-model="formData.phone"
                  :disabled="!isEditing"
                  placeholder="请输入手机号"
                />
              </el-form-item>

              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-model="formData.email"
                  :disabled="!isEditing"
                  placeholder="请输入邮箱"
                />
              </el-form-item>

              <el-form-item label="紧急联系人" prop="emergencyContact">
                <el-input
                  v-model="formData.emergencyContact"
                  :disabled="!isEditing"
                  placeholder="请输入紧急联系人姓名"
                />
              </el-form-item>

              <el-form-item label="联系人电话" prop="emergencyPhone">
                <el-input
                  v-model="formData.emergencyPhone"
                  :disabled="!isEditing"
                  placeholder="请输入紧急联系人电话"
                />
              </el-form-item>

              <el-form-item label="宿舍地址" prop="dormitory">
                <el-input
                  v-model="formData.dormitory"
                  :disabled="!isEditing"
                  placeholder="请输入宿舍地址"
                />
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-card>

      <!-- 其他信息卡片 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">其他信息</span>
          </div>
        </template>

        <div class="info-list">
          <div class="info-item">
            <span class="info-label">入学时间：</span>
            <span class="info-value">{{
              userInfo?.enrollmentDate || "未设置"
            }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">辅导员：</span>
            <span class="info-value">{{
              userInfo?.counselor || "未设置"
            }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">学院：</span>
            <span class="info-value">{{ userInfo?.college || "未设置" }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">年级：</span>
            <span class="info-value">{{ userInfo?.grade || "未设置" }}</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, type FormInstance, type UploadProps } from "element-plus";
import { getUserProfile, updateUserProfile, uploadAvatar } from "@/api/user";

interface UserProfile {
  id: number;
  username: string;
  studentId: string;
  name: string;
  className: string;
  major: string;
  phone: string;
  email: string;
  avatar?: string;
  emergencyContact: string;
  emergencyPhone: string;
  dormitory: string;
  enrollmentDate?: string;
  counselor?: string;
  college?: string;
  grade?: string;
}

// 表单引用
const profileFormRef = ref<FormInstance>();

// 用户信息
const userInfo = ref<UserProfile | null>(null);

// 编辑状态
const isEditing = ref(false);

// 表单数据
const formData = reactive({
  phone: "",
  email: "",
  emergencyContact: "",
  emergencyPhone: "",
  dormitory: "",
  avatar: "",
});

// 表单验证规则
const formRules = {
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
  emergencyContact: [
    { required: true, message: "请输入紧急联系人", trigger: "blur" },
  ],
  emergencyPhone: [
    { required: true, message: "请输入紧急联系人电话", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    },
  ],
  dormitory: [{ required: true, message: "请输入宿舍地址", trigger: "blur" }],
};

// 加载用户信息
const loadUserProfile = async () => {
  try {
    const data = await getUserProfile();
    userInfo.value = data;

    // 初始化表单数据
    formData.phone = data.phone;
    formData.email = data.email;
    formData.emergencyContact = data.emergencyContact;
    formData.emergencyPhone = data.emergencyPhone;
    formData.dormitory = data.dormitory;
    formData.avatar = data.avatar || "";
  } catch (error) {
    ElMessage.error("加载个人信息失败：" + (error as Error).message);
  }
};

// 开始编辑
const startEditing = () => {
  isEditing.value = true;
};

// 取消编辑
const cancelEditing = () => {
  isEditing.value = false;
  // 恢复原始数据
  if (userInfo.value) {
    formData.phone = userInfo.value.phone;
    formData.email = userInfo.value.email;
    formData.emergencyContact = userInfo.value.emergencyContact;
    formData.emergencyPhone = userInfo.value.emergencyPhone;
    formData.dormitory = userInfo.value.dormitory;
    formData.avatar = userInfo.value.avatar || "";
  }
};

// 保存个人信息
const saveProfile = async () => {
  if (!profileFormRef.value) return;

  try {
    await profileFormRef.value.validate();

    const updateData = {
      phone: formData.phone,
      email: formData.email,
      emergencyContact: formData.emergencyContact,
      emergencyPhone: formData.emergencyPhone,
      dormitory: formData.dormitory,
      avatar: formData.avatar,
    };

    await updateUserProfile(updateData);
    ElMessage.success("个人信息更新成功");
    isEditing.value = false;
    await loadUserProfile(); // 重新加载数据
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error("保存失败：" + error.message);
    }
  }
};

// 头像上传前的验证
const beforeAvatarUpload: UploadProps["beforeUpload"] = (rawFile) => {
  const isJPG = rawFile.type === "image/jpeg" || rawFile.type === "image/png";
  const isLt2M = rawFile.size / 1024 / 1024 < 2;

  if (!isJPG) {
    ElMessage.error("头像图片只能是 JPG/PNG 格式!");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("头像图片大小不能超过 2MB!");
    return false;
  }
  return true;
};

// 处理头像上传
const handleAvatarUpload = async (options: any) => {
  const { file } = options;
  try {
    const uploadFormData = new FormData();
    uploadFormData.append("avatar", file);

    const result = await uploadAvatar(uploadFormData);
    formData.avatar = result.avatarUrl;
    ElMessage.success("头像上传成功");
  } catch (error) {
    ElMessage.error("头像上传失败：" + (error as Error).message);
  }
};

// 移除头像
const removeAvatar = () => {
  formData.avatar = "";
  ElMessage.success("头像已移除");
};

// 生命周期
onMounted(() => {
  loadUserProfile();
});
</script>

<style scoped lang="scss">
.profile-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.profile-header {
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

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-card,
.info-card {
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

  .edit-actions {
    display: flex;
    gap: 8px;
  }
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (min-width: 768px) {
    flex-direction: row;
  }
}

.avatar-section {
  display: flex;
  justify-content: center;

  @media (min-width: 768px) {
    justify-content: flex-start;
  }
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  .avatar {
    border: 2px solid #e4e7ed;
  }

  .avatar-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;

    @media (min-width: 768px) {
      flex-direction: row;
    }
  }
}

.form-fields {
  flex: 1;

  :deep(.el-form-item) {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(.el-input) {
    max-width: 400px;
  }
}

.info-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;

  .info-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 4px;

    .info-label {
      min-width: 80px;
      color: #606266;
      font-size: 14px;
    }

    .info-value {
      flex: 1;
      color: #303133;
      font-size: 14px;
      font-weight: 500;
    }
  }
}
</style>
