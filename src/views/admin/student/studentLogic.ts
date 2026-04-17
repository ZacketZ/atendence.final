import { ref, reactive, computed } from "vue";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  exportStudents,
  updateStudentStatus,
} from "@/api/student";
import type { Student, StudentSearchParams } from "@/types/management";

// 数据
export const loading = ref(false);
export const studentList = ref<Student[]>([]);
export const selectedRows = ref<Student[]>([]);
export const dialogVisible = ref(false);
export const importDialogVisible = ref(false);
export const isEditMode = ref(false);
export const formRef = ref<FormInstance>();

// 搜索表单
export const searchForm = reactive<StudentSearchParams>({
  studentId: "",
  name: "",
  class: "",
  major: "",
  enrollmentYear: undefined,
  status: undefined,
});

// 分页
export const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

// 表单数据
export const formData = reactive({
  studentId: "",
  name: "",
  class: "",
  major: "",
  enrollmentYear: new Date().getFullYear(),
  phone: "",
  email: "",
  status: "enrolled" as const,
  accountEnabled: true,
});

// 表单验证规则
export const formRules = {
  studentId: [{ required: true, message: "请输入学号", trigger: "blur" }],
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  class: [{ required: true, message: "请输入班级", trigger: "blur" }],
  major: [{ required: true, message: "请输入专业", trigger: "blur" }],
  enrollmentYear: [
    { required: true, message: "请输入入学年份", trigger: "blur" },
    { type: "number", message: "入学年份必须为数字", trigger: "blur" },
  ],
  phone: [{ required: true, message: "请输入联系方式", trigger: "blur" }],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" },
  ],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

// 计算属性
export const dialogTitle = computed(() => {
  return isEditMode.value ? "编辑学生" : "添加学生";
});

// 方法
export const fetchStudents = async () => {
  loading.value = true;
  try {
    const params: StudentSearchParams = {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
    const response = await getStudents(params);
    studentList.value = response.data;
    pagination.total = response.total;
  } catch (error) {
    console.error("获取学生列表失败:", error);
    ElMessage.error("获取学生列表失败");
  } finally {
    loading.value = false;
  }
};

export const handleSearch = () => {
  pagination.page = 1;
  fetchStudents();
};

export const handleReset = () => {
  Object.assign(searchForm, {
    studentId: "",
    name: "",
    class: "",
    major: "",
    enrollmentYear: undefined,
    status: undefined,
  });
  pagination.page = 1;
  fetchStudents();
};

export const handleAddStudent = () => {
  isEditMode.value = false;
  Object.assign(formData, {
    studentId: "",
    name: "",
    class: "",
    major: "",
    enrollmentYear: new Date().getFullYear(),
    phone: "",
    email: "",
    status: "enrolled",
    accountEnabled: true,
  });
  dialogVisible.value = true;
};

export const handleEdit = (row: Student) => {
  isEditMode.value = true;
  Object.assign(formData, { ...row });
  dialogVisible.value = true;
};

export const handleDelete = async (row: Student) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除学生 "${row.name}" 吗？`,
      "确认删除",
      {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      },
    );

    await deleteStudent(row.id);
    ElMessage.success("删除成功");
    fetchStudents();
  } catch (error) {
    console.error("删除失败:", error);
  }
};

export const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    if (isEditMode.value) {
      // 编辑模式
      const student = studentList.value.find(
        (s) => s.studentId === formData.studentId,
      );
      if (student) {
        await updateStudent(student.id, formData);
        ElMessage.success("更新成功");
      }
    } else {
      // 添加模式
      await createStudent(formData);
      ElMessage.success("添加成功");
    }

    dialogVisible.value = false;
    fetchStudents();
  } catch (error) {
    console.error("表单提交失败:", error);
  }
};

export const handleDialogClose = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

export const handleImport = () => {
  importDialogVisible.value = true;
};

export const handleExport = async () => {
  try {
    const blob = await exportStudents(searchForm);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `学生数据_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    ElMessage.success("导出成功");
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("导出失败");
  }
};

export const handleImportSuccess = () => {
  fetchStudents();
};

export const handleToggleAccount = async (row: Student) => {
  try {
    await updateStudentStatus(row.id, row.status, row.accountEnabled);
    ElMessage.success("账号状态更新成功");
  } catch (error) {
    console.error("更新账号状态失败:", error);
    ElMessage.error("更新账号状态失败");
    // 恢复原状态
    row.accountEnabled = !row.accountEnabled;
  }
};

export const handleSelectionChange = (selection: Student[]) => {
  selectedRows.value = selection;
};

export const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchStudents();
};

export const handleCurrentChange = (page: number) => {
  pagination.page = page;
  fetchStudents();
};

// 辅助函数
export const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    enrolled: "在校",
    suspended: "休学",
    graduated: "毕业",
    withdrawn: "退学",
  };
  return map[status] || status;
};

export const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    enrolled: "success",
    suspended: "warning",
    graduated: "info",
    withdrawn: "danger",
  };
  return map[status] || "";
};
