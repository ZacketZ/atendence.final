<template>
  <el-dialog
    v-model="dialogVisible"
    title="密码重置"
    width="500px"
    @close="handleClose"
  >
    <div class="password-reset-dialog">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="用户类型" prop="userType">
          <el-select
            v-model="formData.userType"
            placeholder="请选择用户类型"
            @change="handleUserTypeChange"
          >
            <el-option label="教职工" value="faculty" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>

        <el-form-item label="用户ID" prop="userId">
          <el-input
            v-model="formData.userId"
            placeholder="请输入工号或学号"
            :disabled="!formData.userType"
          />
        </el-form-item>

        <el-form-item label="用户姓名" prop="userName">
          <el-input
            v-model="formData.userName"
            placeholder="请输入用户姓名"
            :disabled="!formData.userType"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="formData.newPassword"
            type="password"
            placeholder="请输入新密码（留空则生成随机密码）"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="发送邮件" prop="sendEmail">
          <el-switch
            v-model="formData.sendEmail"
            :active-value="true"
            :inactive-value="false"
          />
          <span class="switch-label">
            {{ formData.sendEmail ? "发送密码到用户邮箱" : "不发送邮件" }}
          </span>
        </el-form-item>

        <div v-if="formData.sendEmail" class="email-notice">
          <el-alert type="info" :closable="false" size="small">
            <template #title> 新密码将通过邮件发送到用户的注册邮箱 </template>
          </el-alert>
        </div>
      </el-form>

      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确定重置
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { ElMessage, type FormInstance } from "element-plus";
import { resetPassword } from "@/api/management";
import type { PasswordResetRequest } from "@/types/management";

interface Props {
  modelValue: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

// 数据
const dialogVisible = ref(props.modelValue);
const loading = ref(false);
const formRef = ref<FormInstance>();

// 表单数据
const formData = reactive({
  userType: "" as "faculty" | "student" | "",
  userId: "",
  userName: "",
  newPassword: "",
  confirmPassword: "",
  sendEmail: true,
});

// 表单验证规则
const formRules = {
  userType: [{ required: true, message: "请选择用户类型", trigger: "change" }],
  userId: [{ required: true, message: "请输入用户ID", trigger: "blur" }],
  userName: [{ required: true, message: "请输入用户姓名", trigger: "blur" }],
  confirmPassword: [
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (formData.newPassword && value !== formData.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

// 方法
const handleUserTypeChange = () => {
  // 清空用户ID和姓名
  formData.userId = "";
  formData.userName = "";
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    loading.value = true;

    const request: PasswordResetRequest = {
      userId: formData.userId,
      userType: formData.userType as "faculty" | "student",
      newPassword: formData.newPassword || undefined,
      sendEmail: formData.sendEmail,
    };

    const response = await resetPassword(request);

    if (response.code === 200) {
      ElMessage.success("密码重置成功");

      // 显示重置结果
      if (formData.sendEmail) {
        ElMessage.info("新密码已发送到用户邮箱");
      } else if (formData.newPassword) {
        ElMessage.info(`新密码：${formData.newPassword}`);
      } else {
        // 如果是随机密码，这里可以显示生成的密码
        ElMessage.info("密码已重置为随机密码");
      }

      // 重置表单
      resetForm();

      // 关闭对话框
      dialogVisible.value = false;

      // 触发成功事件
      emit("success");
    } else {
      ElMessage.error(response.message || "密码重置失败");
    }
  } catch (error) {
    console.error("密码重置失败:", error);
    ElMessage.error("密码重置失败");
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  Object.assign(formData, {
    userType: "",
    userId: "",
    userName: "",
    newPassword: "",
    confirmPassword: "",
    sendEmail: true,
  });
};

const handleClose = () => {
  resetForm();
  dialogVisible.value = false;
};

// 监听props变化
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});
</script>

<style scoped>
.password-reset-dialog {
  padding: 10px 0;
}

.switch-label {
  margin-left: 10px;
  font-size: 14px;
  color: #606266;
}

.email-notice {
  margin: 10px 0 20px 100px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
