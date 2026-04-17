import { ref, reactive, computed } from "vue";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import {
  getFaculties,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  exportFaculties,
  updateFacultyStatus,
} from "@/api/faculty";
import type { Faculty, FacultySearchParams } from "@/types/management";

// 数据
export const loading = ref(false);
export const facultyList = ref<Faculty[]>([]);
export const selectedRows = ref<Faculty[]>([]);
export const dialogVisible = ref(false);
export const importDialogVisible = ref(false);
export const isEditMode = ref(false);
export const formRef = ref<FormInstance>();

// 搜索表单
export const searchForm = reactive<FacultySearchParams>({
  employeeId: "",
  name: "",
  department: "",
  position: "",
  role: undefined,
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
  employeeId: "",
  name: "",
  department: "",
  position: "",
  phone: "",
  email: "",
  role: "teacher" as const,
  attendancePermission: "view_own_class" as const,
  status: "active" as const,
  accountEnabled: true,
});

// 表单验证规则
export const formRules = {
  employeeId: [{ required: true, message: "请输入工号", trigger: "blur" }],
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  department: [{ required: true, message: "请输入部门", trigger: "blur" }],
  position: [{ required: true, message: "请输入职位", trigger: "blur" }],
  phone: [{ required: true, message: "请输入联系方式", trigger: "blur" }],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" },
  ],
  role: [{ required: true, message: "请选择角色", trigger: "change" }],
  attendancePermission: [
    { required: true, message: "请选择考勤权限", trigger: "change" },
  ],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

// 计算属性
export const dialogTitle = computed(() => {
  return isEditMode.value ? "编辑教职工" : "添加教职工";
});

// 方法
export const fetchFaculties = async () => {
  loading.value = true;
  try {
    const params: FacultySearchParams = {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
    const response = await getFaculties(params);
    facultyList.value = response.data;
    pagination.total = response.total;
  } catch (error) {
    console.error("获取教职工列表失败:", error);
    ElMessage.error("获取教职工列表失败");
  } finally {
    loading.value = false;
  }
};

export const handleSearch = () => {
  pagination.page = 1;
  fetchFaculties();
};

export const handleReset = () => {
  Object.assign(searchForm, {
    employeeId: "",
    name: "",
    department: "",
    position: "",
    role: undefined,
    status: undefined,
  });
  pagination.page = 1;
  fetchFaculties();
};

export const handleAddFaculty = () => {
  isEditMode.value = false;
  Object.assign(formData, {
    employeeId: "",
    name: "",
    department: "",
    position: "",
    phone: "",
    email: "",
    role: "teacher",
    attendancePermission: "view_own_class",
    status: "active",
    accountEnabled: true,
  });
  dialogVisible.value = true;
};

export const handleEdit = (row: Faculty) => {
  isEditMode.value = true;
  Object.assign(formData, { ...row });
  dialogVisible.value = true;
};

export const handleDelete = async (row: Faculty) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除教职工 "${row.name}" 吗？`,
      "确认删除",
      {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      },
    );

    await deleteFaculty(row.id);
    ElMessage.success("删除成功");
    fetchFaculties();
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
      const faculty = facultyList.value.find(
        (f) => f.employeeId === formData.employeeId,
      );
      if (faculty) {
        await updateFaculty(faculty.id, formData);
        ElMessage.success("更新成功");
      }
    } else {
      // 添加模式
      await createFaculty(formData);
      ElMessage.success("添加成功");
    }

    dialogVisible.value = false;
    fetchFaculties();
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
    const blob = await exportFaculties(searchForm);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `教职工数据_${new Date().toISOString().split("T")[0]}.csv`;
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
  fetchFaculties();
};

export const handleToggleAccount = async (row: Faculty) => {
  try {
    await updateFacultyStatus(row.id, row.status, row.accountEnabled);
    ElMessage.success("账号状态更新成功");
  } catch (error) {
    console.error("更新账号状态失败:", error);
    ElMessage.error("更新账号状态失败");
    // 恢复原状态
    row.accountEnabled = !row.accountEnabled;
  }
};

export const handleSelectionChange = (selection: Faculty[]) => {
  selectedRows.value = selection;
};

export const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchFaculties();
};

export const handleCurrentChange = (page: number) => {
  pagination.page = page;
  fetchFaculties();
};

// 辅助函数
export const getRoleLabel = (role: string) => {
  const map: Record<string, string> = {
    teacher: "教师",
    counselor: "辅导员",
    department_admin: "院系管理员",
    system_admin: "系统管理员",
  };
  return map[role] || role;
};

export const getRoleTagType = (role: string) => {
  const map: Record<string, string> = {
    teacher: "",
    counselor: "success",
    department_admin: "warning",
    system_admin: "danger",
  };
  return map[role] || "";
};

export const getPermissionLabel = (permission: string) => {
  const map: Record<string, string> = {
    none: "无权限",
    view_own_class: "查看所带班级",
    view_all_classes: "查看所有班级",
    modify_own_class: "修改所带班级",
    modify_all_classes: "修改所有班级",
  };
  return map[permission] || permission;
};

export const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    active: "在职",
    leave: "请假",
    external: "外聘",
    resigned: "离职",
  };
  return map[status] || status;
};

export const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    active: "success",
    leave: "warning",
    external: "info",
    resigned: "danger",
  };
  return map[status] || "";
};
