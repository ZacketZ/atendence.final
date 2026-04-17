<template>
  <div class="role-management">
    <div class="header">
      <h1>角色权限管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleAddRole">
          <el-icon><Plus /></el-icon> 添加角色
        </el-button>
      </div>
    </div>

    <!-- 角色列表 -->
    <el-card class="role-list-card">
      <div class="role-list">
        <div
          v-for="role in roleList"
          :key="role.role"
          class="role-item"
          :class="{ 'role-item-active': currentRole?.role === role.role }"
          @click="handleSelectRole(role)"
        >
          <div class="role-header">
            <h3>{{ getRoleLabel(role.role) }}</h3>
            <el-tag :type="getRoleTagType(role.role)" size="small">
              {{ role.role }}
            </el-tag>
          </div>
          <div class="role-description">
            {{ getRoleDescription(role.role) }}
          </div>
          <div class="role-actions">
            <el-button
              type="primary"
              size="small"
              @click.stop="handleEditRole(role)"
            >
              编辑
            </el-button>
            <el-button
              v-if="role.role !== 'system_admin'"
              type="danger"
              size="small"
              @click.stop="handleDeleteRole(role)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 权限配置 -->
    <el-card v-if="currentRole" class="permission-card">
      <template #header>
        <div class="permission-header">
          <h3>{{ getRoleLabel(currentRole.role) }} 权限配置</h3>
          <el-button type="primary" @click="handleSavePermissions">
            保存权限
          </el-button>
        </div>
      </template>

      <div class="permission-content">
        <!-- 考勤权限 -->
        <div class="permission-section">
          <h4>考勤权限</h4>
          <div class="permission-options">
            <el-form label-width="120px">
              <el-form-item label="查看权限">
                <el-select
                  v-model="currentRole.permissions.attendance.view"
                  placeholder="请选择查看权限"
                >
                  <el-option label="无权限" value="none" />
                  <el-option label="查看所带班级" value="own_class" />
                  <el-option label="查看所有班级" value="all_classes" />
                </el-select>
              </el-form-item>
              <el-form-item label="修改权限">
                <el-select
                  v-model="currentRole.permissions.attendance.modify"
                  placeholder="请选择修改权限"
                >
                  <el-option label="无权限" value="none" />
                  <el-option label="修改所带班级" value="own_class" />
                  <el-option label="修改所有班级" value="all_classes" />
                </el-select>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- 管理权限 -->
        <div class="permission-section">
          <h4>管理权限</h4>
          <div class="permission-options">
            <el-form label-width="120px">
              <el-form-item label="教职工管理">
                <el-switch
                  v-model="currentRole.permissions.management.faculty"
                  :active-value="true"
                  :inactive-value="false"
                />
                <span class="switch-label">
                  {{
                    currentRole.permissions.management.faculty
                      ? "有权限"
                      : "无权限"
                  }}
                </span>
              </el-form-item>
              <el-form-item label="学生管理">
                <el-switch
                  v-model="currentRole.permissions.management.student"
                  :active-value="true"
                  :inactive-value="false"
                />
                <span class="switch-label">
                  {{
                    currentRole.permissions.management.student
                      ? "有权限"
                      : "无权限"
                  }}
                </span>
              </el-form-item>
              <el-form-item label="课表管理">
                <el-switch
                  v-model="currentRole.permissions.management.schedule"
                  :active-value="true"
                  :inactive-value="false"
                />
                <span class="switch-label">
                  {{
                    currentRole.permissions.management.schedule
                      ? "有权限"
                      : "无权限"
                  }}
                </span>
              </el-form-item>
              <el-form-item label="考勤管理">
                <el-switch
                  v-model="currentRole.permissions.management.attendance"
                  :active-value="true"
                  :inactive-value="false"
                />
                <span class="switch-label">
                  {{
                    currentRole.permissions.management.attendance
                      ? "有权限"
                      : "无权限"
                  }}
                </span>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- 权限说明 -->
        <div class="permission-description">
          <el-alert type="info" :closable="false">
            <template #title>
              <strong>权限说明：</strong>
            </template>
            <div class="alert-content">
              <p>1. 考勤权限控制用户对考勤数据的查看和修改能力</p>
              <p>2. 管理权限控制用户对各个管理模块的访问权限</p>
              <p>3. 系统管理员拥有所有权限，不可修改</p>
              <p>4. 修改权限后需要保存才能生效</p>
            </div>
          </el-alert>
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑角色对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="roleDialogTitle"
      width="500px"
    >
      <el-form
        ref="roleFormRef"
        :model="roleFormData"
        :rules="roleFormRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="role">
          <el-select
            v-model="roleFormData.role"
            placeholder="请选择角色名称"
            :disabled="isEditRoleMode"
          >
            <el-option label="教师" value="teacher" />
            <el-option label="辅导员" value="counselor" />
            <el-option label="院系管理员" value="department_admin" />
            <el-option label="系统管理员" value="system_admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="roleFormData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleRoleSubmit"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import type { RolePermission } from "@/types/management";

// 数据
const roleList = ref<RolePermission[]>([
  {
    role: "teacher",
    permissions: {
      attendance: {
        view: "own_class",
        modify: "none",
      },
      management: {
        faculty: false,
        student: false,
        schedule: false,
        attendance: true,
      },
    },
  },
  {
    role: "counselor",
    permissions: {
      attendance: {
        view: "all_classes",
        modify: "own_class",
      },
      management: {
        faculty: false,
        student: true,
        schedule: false,
        attendance: true,
      },
    },
  },
  {
    role: "department_admin",
    permissions: {
      attendance: {
        view: "all_classes",
        modify: "all_classes",
      },
      management: {
        faculty: true,
        student: true,
        schedule: true,
        attendance: true,
      },
    },
  },
  {
    role: "system_admin",
    permissions: {
      attendance: {
        view: "all_classes",
        modify: "all_classes",
      },
      management: {
        faculty: true,
        student: true,
        schedule: true,
        attendance: true,
      },
    },
  },
]);

const currentRole = ref<RolePermission | null>(null);
const roleDialogVisible = ref(false);
const isEditRoleMode = ref(false);
const roleFormRef = ref<FormInstance>();

// 表单数据
const roleFormData = reactive({
  role: "",
  description: "",
});

// 表单验证规则
const roleFormRules = {
  role: [{ required: true, message: "请选择角色名称", trigger: "change" }],
  description: [{ required: true, message: "请输入角色描述", trigger: "blur" }],
};

// 计算属性
const roleDialogTitle = computed(() => {
  return isEditRoleMode.value ? "编辑角色" : "添加角色";
});

// 方法
const handleSelectRole = (role: RolePermission) => {
  currentRole.value = { ...role };
};

const handleAddRole = () => {
  isEditRoleMode.value = false;
  Object.assign(roleFormData, {
    role: "",
    description: "",
  });
  roleDialogVisible.value = true;
};

const handleEditRole = (role: RolePermission) => {
  isEditRoleMode.value = true;
  Object.assign(roleFormData, {
    role: role.role,
    description: getRoleDescription(role.role),
  });
  roleDialogVisible.value = true;
};

const handleDeleteRole = async (role: RolePermission) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${getRoleLabel(role.role)}" 吗？`,
      "确认删除",
      {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      },
    );

    const index = roleList.value.findIndex((r) => r.role === role.role);
    if (index !== -1) {
      roleList.value.splice(index, 1);
      if (currentRole.value?.role === role.role) {
        currentRole.value = null;
      }
      ElMessage.success("删除成功");
    }
  } catch (error) {
    console.error("删除失败:", error);
  }
};

const handleRoleSubmit = async () => {
  if (!roleFormRef.value) return;

  try {
    await roleFormRef.value.validate();

    if (isEditRoleMode.value) {
      // 编辑模式
      const role = roleList.value.find((r) => r.role === roleFormData.role);
      if (role) {
        // 更新角色描述
        ElMessage.success("角色更新成功");
      }
    } else {
      // 添加模式
      const newRole: RolePermission = {
        role: roleFormData.role as any,
        permissions: {
          attendance: {
            view: "none",
            modify: "none",
          },
          management: {
            faculty: false,
            student: false,
            schedule: false,
            attendance: false,
          },
        },
      };
      roleList.value.push(newRole);
      ElMessage.success("角色添加成功");
    }

    roleDialogVisible.value = false;
  } catch (error) {
    console.error("表单提交失败:", error);
  }
};

const handleSavePermissions = async () => {
  if (!currentRole.value) return;

  try {
    // 更新角色权限
    const index = roleList.value.findIndex(
      (r) => r.role === currentRole.value!.role,
    );
    if (index !== -1) {
      roleList.value[index] = { ...currentRole.value };
    }

    ElMessage.success("权限保存成功");
  } catch (error) {
    console.error("保存权限失败:", error);
    ElMessage.error("保存权限失败");
  }
};

// 辅助函数
const getRoleLabel = (role: string) => {
  const map: Record<string, string> = {
    teacher: "教师",
    counselor: "辅导员",
    department_admin: "院系管理员",
    system_admin: "系统管理员",
  };
  return map[role] || role;
};

const getRoleTagType = (role: string) => {
  const map: Record<string, string> = {
    teacher: "primary",
    counselor: "success",
    department_admin: "warning",
    system_admin: "danger",
  };
  return map[role] || "";
};

const getRoleDescription = (role: string) => {
  const map: Record<string, string> = {
    teacher: "负责教学工作的教师，可以查看所带班级的考勤数据",
    counselor: "负责学生工作的辅导员，可以查看所有班级考勤，修改所带班级考勤",
    department_admin: "院系管理员，拥有院系内所有管理权限",
    system_admin: "系统管理员，拥有系统所有权限",
  };
  return map[role] || "";
};

// 生命周期
onMounted(() => {
  if (roleList.value.length > 0) {
    currentRole.value = { ...roleList.value[0] };
  }
});
</script>

<style scoped>
.role-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.role-list-card {
  margin-bottom: 20px;
}

.role-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.role-item {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.role-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.role-item-active {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.role-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.role-description {
  margin-bottom: 15px;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.role-actions {
  display: flex;
  gap: 10px;
}

.permission-card {
  margin-bottom: 20px;
}

.permission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.permission-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.permission-content {
  padding: 10px 0;
}

.permission-section {
  margin-bottom: 30px;
}

.permission-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.permission-options {
  padding-left: 20px;
}

.switch-label {
  margin-left: 10px;
  font-size: 14px;
  color: #606266;
}

.permission-description {
  margin-top: 30px;
}

.alert-content {
  font-size: 14px;
  line-height: 1.6;
}

.alert-content p {
  margin: 5px 0;
}
</style>
