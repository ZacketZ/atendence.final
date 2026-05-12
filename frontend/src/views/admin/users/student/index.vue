<template>
  <div class="student-management">
    <div class="page-header">
      <h2>学生管理</h2>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>添加学生
      </el-button>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="学号">
          <el-input
            v-model="filters.studentId"
            placeholder="搜索学号"
            clearable
          />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="filters.name" placeholder="搜索姓名" clearable />
        </el-form-item>
        <el-form-item label="学院">
          <el-input
            v-model="filters.college"
            placeholder="搜索学院"
            clearable
          />
        </el-form-item>
        <el-form-item label="班级">
          <el-input
            v-model="filters.className"
            placeholder="搜索班级"
            clearable
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

    <!-- 学生列表 -->
    <el-card v-else>
      <el-table
        :data="filteredStudentList"
        stripe
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="student_id" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="college" label="学院" min-width="140" />
        <el-table-column prop="major" label="专业" min-width="120" />
        <el-table-column prop="grade" label="年级" width="80" align="center" />
        <el-table-column
          prop="class_name"
          label="班级"
          width="100"
          align="center"
        />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 1 ? 'success' : 'danger'"
              size="small"
            >
              {{ row.status === 1 ? "正常" : "禁用" }}
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
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑学生弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? '编辑学生' : '添加学生'"
      width="550px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="dialog.form"
        :rules="dialog.isEdit ? editRules : addRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="dialog.form.username"
            :disabled="dialog.isEdit"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="学号" prop="studentId">
          <el-input
            v-model="dialog.form.studentId"
            :disabled="dialog.isEdit"
            placeholder="请输入学号"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="dialog.form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="学院">
          <el-input v-model="dialog.form.college" placeholder="请输入学院" />
        </el-form-item>
        <el-form-item label="专业">
          <el-input v-model="dialog.form.major" placeholder="请输入专业" />
        </el-form-item>
        <el-form-item label="年级">
          <el-input v-model="dialog.form.grade" placeholder="请输入年级" />
        </el-form-item>
        <el-form-item label="班级">
          <el-input v-model="dialog.form.className" placeholder="请输入班级" />
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
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "@/api/user";

interface StudentUser {
  id: number;
  username: string;
  student_id: string;
  name: string;
  college?: string;
  major?: string;
  grade?: string;
  class_name?: string;
  status: number;
}

const loading = ref(false);
const studentList = ref<StudentUser[]>([]);

const filters = ref({
  studentId: "",
  name: "",
  college: "",
  className: "",
});

// 前端过滤
const filteredStudentList = computed(() => {
  return studentList.value.filter((item) => {
    const matchStudentId =
      !filters.value.studentId ||
      item.student_id?.includes(filters.value.studentId);
    const matchName =
      !filters.value.name || item.name?.includes(filters.value.name);
    const matchCollege =
      !filters.value.college || item.college?.includes(filters.value.college);
    const matchClass =
      !filters.value.className ||
      item.class_name?.includes(filters.value.className);
    return matchStudentId && matchName && matchCollege && matchClass;
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
    studentId: "",
    name: "",
    college: "",
    major: "",
    grade: "",
    className: "",
  },
});

const addRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "用户名长度在 3-20 个字符", trigger: "blur" },
  ],
  studentId: [{ required: true, message: "请输入学号", trigger: "blur" }],
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
};

const editRules = {
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
};

// 加载学生列表
async function loadData() {
  loading.value = true;
  try {
    const data = await getStudents();
    studentList.value = data as unknown as StudentUser[];
  } catch (error) {
    console.error("获取学生列表失败:", error);
    ElMessage.error("获取学生列表失败");
  } finally {
    loading.value = false;
  }
}

// 重置筛选
function resetFilters() {
  filters.value = {
    studentId: "",
    name: "",
    college: "",
    className: "",
  };
  loadData();
}

// 打开添加弹窗
function openAddDialog() {
  dialog.value = {
    visible: true,
    isEdit: false,
    submitting: false,
    form: {
      id: 0,
      username: "",
      studentId: "",
      name: "",
      college: "",
      major: "",
      grade: "",
      className: "",
    },
  };
}

// 打开编辑弹窗
function openEditDialog(row: StudentUser) {
  dialog.value = {
    visible: true,
    isEdit: true,
    submitting: false,
    form: {
      id: row.id,
      username: row.username,
      studentId: row.student_id || "",
      name: row.name || "",
      college: row.college || "",
      major: row.major || "",
      grade: row.grade || "",
      className: row.class_name || "",
    },
  };
}

// 提交表单
async function submitForm() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  dialog.value.submitting = true;
  try {
    if (dialog.value.isEdit) {
      // 编辑学生
      const { id, name, college, major, grade, className } = dialog.value.form;
      await updateStudent(id, {
        name,
        college,
        major,
        grade,
        class_name: className,
      } as any);
      ElMessage.success("学生信息已更新");
    } else {
      // 添加学生
      const { username, studentId, name } = dialog.value.form;
      await addStudent({ username, student_id: studentId, name });
      ElMessage.success("学生添加成功");
    }
    dialog.value.visible = false;
    await loadData();
  } catch (error: any) {
    console.error("操作失败:", error);
    ElMessage.error(
      error?.response?.data?.error || error?.message || "操作失败",
    );
  } finally {
    dialog.value.submitting = false;
  }
}

// 删除学生
async function handleDelete(row: StudentUser) {
  try {
    await ElMessageBox.confirm(
      `确定要删除学生「${row.name || row.username}」吗？此操作不可恢复。`,
      "确认删除",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning",
      },
    );
    await deleteStudent(row.id);
    ElMessage.success("学生已删除");
    await loadData();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error(
        error?.response?.data?.error || error?.message || "删除失败",
      );
    }
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.student-management {
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
