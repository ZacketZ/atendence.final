import {
  Faculty,
  FacultySearchParams,
  PaginatedResponse,
  ApiResponse,
  BatchImportResult,
} from "@/types/management";

// 模拟数据 - 教职工列表
const mockFaculties: Faculty[] = [
  {
    id: 1,
    employeeId: "T001",
    name: "张老师",
    department: "计算机学院",
    position: "教授",
    phone: "13800138001",
    email: "zhang@example.com",
    role: "teacher",
    attendancePermission: "view_own_class",
    status: "active",
    accountEnabled: true,
    createdAt: "2023-01-15",
    updatedAt: "2024-03-20",
  },
  {
    id: 2,
    employeeId: "T002",
    name: "李老师",
    department: "计算机学院",
    position: "副教授",
    phone: "13800138002",
    email: "li@example.com",
    role: "teacher",
    attendancePermission: "modify_own_class",
    status: "active",
    accountEnabled: true,
    createdAt: "2023-02-10",
    updatedAt: "2024-03-18",
  },
  {
    id: 3,
    employeeId: "C001",
    name: "王辅导员",
    department: "学生工作处",
    position: "辅导员",
    phone: "13800138003",
    email: "wang@example.com",
    role: "counselor",
    attendancePermission: "view_all_classes",
    status: "active",
    accountEnabled: true,
    createdAt: "2023-03-05",
    updatedAt: "2024-03-15",
  },
  {
    id: 4,
    employeeId: "A001",
    name: "赵管理员",
    department: "教务处",
    position: "院系管理员",
    phone: "13800138004",
    email: "zhao@example.com",
    role: "department_admin",
    attendancePermission: "modify_all_classes",
    status: "active",
    accountEnabled: true,
    createdAt: "2023-04-12",
    updatedAt: "2024-03-10",
  },
  {
    id: 5,
    employeeId: "S001",
    name: "刘系统管理员",
    department: "信息技术中心",
    position: "系统管理员",
    phone: "13800138005",
    email: "liu@example.com",
    role: "system_admin",
    attendancePermission: "modify_all_classes",
    status: "active",
    accountEnabled: true,
    createdAt: "2023-05-20",
    updatedAt: "2024-03-05",
  },
  {
    id: 6,
    employeeId: "T003",
    name: "陈老师",
    department: "外国语学院",
    position: "讲师",
    phone: "13800138006",
    email: "chen@example.com",
    role: "teacher",
    attendancePermission: "view_own_class",
    status: "leave",
    accountEnabled: true,
    createdAt: "2023-06-15",
    updatedAt: "2024-02-28",
  },
  {
    id: 7,
    employeeId: "E001",
    name: "周外聘教师",
    department: "艺术学院",
    position: "外聘教师",
    phone: "13800138007",
    email: "zhou@example.com",
    role: "teacher",
    attendancePermission: "none",
    status: "external",
    accountEnabled: true,
    createdAt: "2023-07-10",
    updatedAt: "2024-02-20",
  },
  {
    id: 8,
    employeeId: "T004",
    name: "吴老师",
    department: "数学学院",
    position: "教授",
    phone: "13800138008",
    email: "wu@example.com",
    role: "teacher",
    attendancePermission: "modify_own_class",
    status: "resigned",
    accountEnabled: false,
    createdAt: "2023-08-05",
    updatedAt: "2024-02-15",
  },
];

// 获取教职工列表
export const getFaculties = async (
  params: FacultySearchParams = {},
): Promise<PaginatedResponse<Faculty>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockFaculties];

      // 应用筛选条件
      if (params.employeeId) {
        filtered = filtered.filter((f) =>
          f.employeeId.toLowerCase().includes(params.employeeId!.toLowerCase()),
        );
      }
      if (params.name) {
        filtered = filtered.filter((f) =>
          f.name.toLowerCase().includes(params.name!.toLowerCase()),
        );
      }
      if (params.department) {
        filtered = filtered.filter((f) =>
          f.department.toLowerCase().includes(params.department!.toLowerCase()),
        );
      }
      if (params.position) {
        filtered = filtered.filter((f) =>
          f.position.toLowerCase().includes(params.position!.toLowerCase()),
        );
      }
      if (params.role) {
        filtered = filtered.filter((f) => f.role === params.role);
      }
      if (params.status) {
        filtered = filtered.filter((f) => f.status === params.status);
      }

      // 分页
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = filtered.slice(start, end);

      resolve({
        data: paginatedData,
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      });
    }, 500);
  });
};

// 获取单个教职工信息
export const getFaculty = async (id: number): Promise<Faculty> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const faculty = mockFaculties.find((f) => f.id === id);
      if (faculty) {
        resolve(faculty);
      } else {
        reject(new Error("教职工不存在"));
      }
    }, 300);
  });
};

// 创建教职工
export const createFaculty = async (
  faculty: Omit<Faculty, "id" | "createdAt" | "updatedAt">,
): Promise<ApiResponse<Faculty>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newFaculty: Faculty = {
        ...faculty,
        id: mockFaculties.length + 1,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      mockFaculties.push(newFaculty);

      resolve({
        code: 200,
        message: "创建成功",
        data: newFaculty,
        timestamp: new Date().toISOString(),
      });
    }, 500);
  });
};

// 更新教职工信息
export const updateFaculty = async (
  id: number,
  updates: Partial<Faculty>,
): Promise<ApiResponse<Faculty>> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockFaculties.findIndex((f) => f.id === id);
      if (index === -1) {
        reject(new Error("教职工不存在"));
        return;
      }

      const updatedFaculty = {
        ...mockFaculties[index],
        ...updates,
        updatedAt: new Date().toISOString().split("T")[0],
      };
      mockFaculties[index] = updatedFaculty;

      resolve({
        code: 200,
        message: "更新成功",
        data: updatedFaculty,
        timestamp: new Date().toISOString(),
      });
    }, 500);
  });
};

// 删除教职工
export const deleteFaculty = async (id: number): Promise<ApiResponse<void>> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockFaculties.findIndex((f) => f.id === id);
      if (index === -1) {
        reject(new Error("教职工不存在"));
        return;
      }

      mockFaculties.splice(index, 1);

      resolve({
        code: 200,
        message: "删除成功",
        data: undefined,
        timestamp: new Date().toISOString(),
      });
    }, 500);
  });
};

// 批量导入教职工
export const importFaculties = async (
  file: File,
): Promise<ApiResponse<BatchImportResult>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟导入处理
      console.log("导入文件:", file.name);

      resolve({
        code: 200,
        message: "导入成功",
        data: {
          total: 10,
          success: 8,
          failed: 2,
          errors: [
            { row: 3, field: "employeeId", message: "工号已存在" },
            { row: 7, field: "email", message: "邮箱格式不正确" },
          ],
        },
        timestamp: new Date().toISOString(),
      });
    }, 1000);
  });
};

// 导出教职工数据
export const exportFaculties = async (
  params: FacultySearchParams = {},
): Promise<Blob> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟导出数据
      const data = mockFaculties
        .map(
          (f) =>
            `${f.employeeId},${f.name},${f.department},${f.position},${f.phone},${f.email},${f.role},${f.status}`,
        )
        .join("\n");
      const blob = new Blob([data], { type: "text/csv" });
      resolve(blob);
    }, 800);
  });
};

// 获取角色权限配置
export const getRolePermissions = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        teacher: {
          attendance: { view: "own_class", modify: "own_class" },
          management: {
            faculty: false,
            student: false,
            schedule: false,
            attendance: true,
          },
        },
        counselor: {
          attendance: { view: "all_classes", modify: "none" },
          management: {
            faculty: false,
            student: true,
            schedule: false,
            attendance: false,
          },
        },
        department_admin: {
          attendance: { view: "all_classes", modify: "all_classes" },
          management: {
            faculty: true,
            student: true,
            schedule: true,
            attendance: true,
          },
        },
        system_admin: {
          attendance: { view: "all_classes", modify: "all_classes" },
          management: {
            faculty: true,
            student: true,
            schedule: true,
            attendance: true,
          },
        },
      });
    }, 300);
  });
};

// 更新教职工状态
export const updateFacultyStatus = async (
  id: number,
  status: "active" | "leave" | "external" | "resigned",
  accountEnabled: boolean,
): Promise<ApiResponse<Faculty>> => {
  return updateFaculty(id, { status, accountEnabled });
};

// 重置教职工密码
export const resetFacultyPassword = async (
  employeeId: string,
  sendEmail: boolean = true,
): Promise<ApiResponse<void>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`重置教职工 ${employeeId} 的密码，发送邮件: ${sendEmail}`);
      resolve({
        code: 200,
        message: "密码重置成功",
        data: undefined,
        timestamp: new Date().toISOString(),
      });
    }, 500);
  });
};
