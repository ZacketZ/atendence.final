<template>
  <div class="staff-management">
    <div class="page-header">
      <h2>教职工管理</h2>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>添加教职工
      </el-button>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="用户名">
          <el-input
            v-model="filters.username"
            placeholder="搜索用户名"
            clearable
            @input="loadData"
          />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input
            v-model="filters.name"
            placeholder="搜索姓名"
            clearable
            @input="loadData"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 教职工列表 -->
    <el-card v-else>
      <el-table
        :data="filteredStaffList"
        stripe
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="name" label="姓名" min-width="140" />
        <el-table-column prop="role" label="角色" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.role === 'admin' ? 'danger' : 'warning'"
              size="small"
            >
              {{ row.role === "admin" ? "管理员" : "教职工" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="openEditDialog(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              :disabled="row.role === 'admin'"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑教职工弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? '编辑教职工' : '添加教职工'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="dialog.form"
        :rules="dialog.isEdit ? editRules : addRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="dialog.form.username"
            :disabled="dialog.isEdit"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="dialog.form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item v-if="!dialog.isEdit" label="初始密码">
          <el-input
            :model-value="'123456'"
            disabled
            placeholder="默认密码为 123456"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="dialog.submitting"
          @click="submitForm"
        >
          {{ dialog.isEdit ? "保存" : "添加" }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import {
  getTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
} from "@/api/user";

interface StaffUser {
  id: number;
  username: string;
  name: string;
  role: string;
}

const loading = ref(false);
const staffList = ref<StaffUser[]>([]);

const filters = ref({
  username: "",
  name: "",
});

// 前端过滤
const filteredStaffList = computed(() => {
  return staffList.value.filter((item) => {
    const matchUsername =
      !filters.value.username || item.username.includes(filters.value.username);
    const matchName =
      !filters.value.name || item.name?.includes(filters.value.name);
    return matchUsername && matchName;
  });
});

const formRef = ref();

const dialog = ref({
  visible: false,
  isEdit: false,
  submitting: false,
  form: {
    id: 0,
    username: "",
    name: "",
  },
});

const addRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "用户名长度在 3-20 个字符", trigger: "blur" },
  ],
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
};

const editRules = {
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
};

// 加载教职工列表
async function loadData() {
  loading.value = true;
  try {
    const data = await getTeachers();
    staffList.value = data as unknown as StaffUser[];
  } catch (error) {
    console.error("获取教职工列表失败:", error);
    ElMessage.error("获取教职工列表失败");
  } finally {
    loading.value = false;
  }
}

// 重置筛选
function resetFilters() {
  filters.value = { username: "", name: "" };
  loadData();
}

// 打开添加弹窗
function openAddDialog() {
  dialog.value = {
    visible: true,
    isEdit: false,
    submitting: false,
    form: { id: 0, username: "", name: "" },
  };
}

// 打开编辑弹窗
function openEditDialog(row: StaffUser) {
  dialog.value = {
    visible: true,
    isEdit: true,
    submitting: false,
    form: { id: row.id, username: row.username, name: row.name || "" },
  };
}

// 提交表单
async function submitForm() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  dialog.value.submitting = true;
  try {
    if (dialog.value.isEdit) {
      // 编辑教职工 - 调用后端 PUT /users/teachers/:id
      const { id, name } = dialog.value.form;
      await updateTeacher(id, { name });
      ElMessage.success("教职工信息已更新");
    } else {
      // 添加教职工 - 调用后端 POST /users/teachers
      const { username, name } = dialog.value.form;
      await addTeacher({ username, name });
      ElMessage.success("教职工添加成功");
    }
    dialog.value.visible = false;
    await loadData();
  } catch (error: any) {
    console.error("操作失败:", error);
    ElMessage.error(error?.message || "操作失败");
  } finally {
    dialog.value.submitting = false;
  }
}

// 删除教职工
async function handleDelete(row: StaffUser) {
  try {
    await ElMessageBox.confirm(
      `确定要删除教职工「${row.name || row.username}」吗？此操作不可恢复。`,
      "确认删除",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning",
      },
    );
    await deleteTeacher(row.id);
    ElMessage.success("教职工已删除");
    await loadData();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error(error?.message || "删除失败");
    }
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.staff-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    color: #303133;
    font-size: 22px;
  }
}

.filter-card {
  margin-bottom: 20px;
}

.loading-state {
  padding: 40px 20px;
  background: #fff;
  border-radius: 8px;
}
</style>
