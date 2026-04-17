import {
  Student,
  StudentSearchParams,
  PaginatedResponse,
  ApiResponse,
  BatchImportResult,
} from "@/types/management";

// 模拟数据 - 学生列表
const mockStudents: Student[] = [
  {
    id: 1,
    studentId: "20230001",
    name: "张三",
    class: "计算机科学与技术1班",
    major: "计算机科学与技术",
    enrollmentYear: 2023,
    phone: "13800138009",
    email: "zhangsan@example.com",
    status: "enrolled",
    accountEnabled: true,
    facultyAdvisor: "王辅导员",
    college: "计算机学院",
    grade: "2023级",
    createdAt: "2023-09-01",
    updatedAt: "2024-03-20",
  },
  {
    id: 2,
    studentId: "20230002",
    name: "李四",
    class: "计算机科学与技术1班",
    major: "计算机科学与技术",
    enrollmentYear: 2023,
    phone: "13800138010",
    email: "lisi@example.com",
    status: "enrolled",
    accountEnabled: true,
    facultyAdvisor: "王辅导员",
    college: "计算机学院",
    grade: "2023级",
    createdAt: "2023-09-01",
    updatedAt: "2024-03-18",
  },
  {
    id: 3,
    studentId: "20230003",
    name: "王五",
    class: "软件工程2班",
    major: "软件工程",
    enrollmentYear: 2023,
    phone: "13800138011",
    email: "wangwu@example.com",
    status: "enrolled",
    accountEnabled: true,
    facultyAdvisor: "李辅导员",
    college: "计算机学院",
    grade: "2023级",
    createdAt: "2023-09-01",
    updatedAt: "2024-03-15",
  },
  {
    id: 4,
    studentId: "20220001",
    name: "赵六",
    class: "网络工程1班",
    major: "网络工程",
    enrollmentYear: 2022,
    phone: "13800138012",
    email: "zhaoliu@example.com",
    status: "enrolled",
    accountEnabled: true,
    facultyAdvisor: "张辅导员",
    college: "计算机学院",
    grade: "2022级",
    createdAt: "2022-09-01",
    updatedAt: "2024-03-10",
  },
  {
    id: 5,
    studentId: "20220002",
    name: "钱七",
    class: "信息安全1班",
    major: "信息安全",
    enrollmentYear: 2022,
    phone: "13800138013",
    email: "qianqi@example.com",
    status: "suspended",
    accountEnabled: false,
    facultyAdvisor: "刘辅导员",
    college: "计算机学院",
    grade: "2022级",
    createdAt: "2022-09-01",
    updatedAt: "2024-02-28",
  },
  {
    id: 6,
    studentId: "20210001",
    name: "孙八",
    class: "人工智能1班",
    major: "人工智能",
    enrollmentYear: 2021,
    phone: "13800138014",
    email: "sunba@example.com",
    status: "graduated",
    accountEnabled: false,
    facultyAdvisor: "陈辅导员",
    college: "计算机学院",
    grade: "2021级",
    createdAt: "2021-09-01",
    updatedAt: "2024-02-20",
  },
  {
    id: 7,
    studentId: "20230004",
    name: "周九",
    class: "数据科学1班",
    major: "数据科学与大数据技术",
    enrollmentYear: 2023,
    phone: "13800138015",
    email: "zhoujiu@example.com",
    status: "withdrawn",
    accountEnabled: false,
    facultyAdvisor: "赵辅导员",
    college: "计算机学院",
    grade: "2023级",
    createdAt: "2023-09-01",
    updatedAt: "2024-02-15",
  },
  {
    id: 8,
    studentId: "20230005",
    name: "吴十",
    class: "计算机科学与技术2班",
    major: "计算机科学与技术",
    enrollmentYear: 2023,
    phone: "13800138016",
    email: "wushi@example.com",
    status: "enrolled",
    accountEnabled: true,
    facultyAdvisor: "王辅导员",
    college: "计算机学院",
    grade: "2023级",
    createdAt: "2023-09-01",
    updatedAt: "2024-02-10",
  },
];

// 获取学生列表
export const getStudents = async (
  params: StudentSearchParams = {},
): Promise<PaginatedResponse<Student>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockStudents];

      // 应用筛选条件
      if (params.studentId) {
        filtered = filtered.filter((s) =>
          s.studentId.toLowerCase().includes(params.studentId!.toLowerCase()),
        );
      }
      if (params.name) {
        filtered = filtered.filter((s) =>
          s.name.toLowerCase().includes(params.name!.toLowerCase()),
        );
      }
      if (params.class) {
        filtered = filtered.filter((s) =>
          s.class.toLowerCase().includes(params.class!.toLowerCase()),
        );
      }
      if (params.major) {
        filtered = filtered.filter((s) =>
          s.major.toLowerCase().includes(params.major!.toLowerCase()),
        );
      }
      if (params.enrollmentYear) {
        filtered = filtered.filter(
          (s) => s.enrollmentYear === params.enrollmentYear,
        );
      }
      if (params.status) {
        filtered = filtered.filter((s) => s.status === params.status);
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

// 获取单个学生信息
export const getStudent = async (id: number): Promise<Student> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const student = mockStudents.find((s) => s.id === id);
      if (student) {
        resolve(student);
      } else {
        reject(new Error("学生不存在"));
      }
    }, 300);
  });
};

// 创建学生
export const createStudent = async (
  student: Omit<Student, "id" | "createdAt" | "updatedAt">,
): Promise<ApiResponse<Student>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newStudent: Student = {
        ...student,
        id: mockStudents.length + 1,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      mockStudents.push(newStudent);

      resolve({
        code: 200,
        message: "创建成功",
        data: newStudent,
        timestamp: new Date().toISOString(),
      });
    }, 500);
  });
};

// 更新学生信息
export const updateStudent = async (
  id: number,
  updates: Partial<Student>,
): Promise<ApiResponse<Student>> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockStudents.findIndex((s) => s.id === id);
      if (index === -1) {
        reject(new Error("学生不存在"));
        return;
      }

      const updatedStudent = {
        ...mockStudents[index],
        ...updates,
        updatedAt: new Date().toISOString().split("T")[0],
      };
      mockStudents[index] = updatedStudent;

      resolve({
        code: 200,
        message: "更新成功",
        data: updatedStudent,
        timestamp: new Date().toISOString(),
      });
    }, 500);
  });
};

// 删除学生
export const deleteStudent = async (id: number): Promise<ApiResponse<void>> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockStudents.findIndex((s) => s.id === id);
      if (index === -1) {
        reject(new Error("学生不存在"));
        return;
      }

      mockStudents.splice(index, 1);

      resolve({
        code: 200,
        message: "删除成功",
        data: undefined,
        timestamp: new Date().toISOString(),
      });
    }, 500);
  });
};

// 批量导入学生
export const importStudents = async (
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
          total: 15,
          success: 13,
          failed: 2,
          errors: [
            { row: 5, field: "studentId", message: "学号已存在" },
            { row: 12, field: "enrollmentYear", message: "入学年份格式不正确" },
          ],
        },
        timestamp: new Date().toISOString(),
      });
    }, 1000);
  });
};

// 导出学生数据
export const exportStudents = async (
  params: StudentSearchParams = {},
): Promise<Blob> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟导出数据
      const data = mockStudents
        .map(
          (s) =>
            `${s.studentId},${s.name},${s.class},${s.major},${s.enrollmentYear},${s.phone},${s.email},${s.status}`,
        )
        .join("\n");
      const blob = new Blob([data], { type: "text/csv" });
      resolve(blob);
    }, 800);
  });
};

// 批量调整学生班级
export const batchUpdateStudentClass = async (
  studentIds: string[],
  newClass: string,
): Promise<ApiResponse<void>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`批量调整学生 ${studentIds.join(", ")} 到班级 ${newClass}`);

      // 模拟更新
      mockStudents.forEach((student) => {
        if (studentIds.includes(student.studentId)) {
          student.class = newClass;
          student.updatedAt = new Date().toISOString().split("T")[0];
        }
      });

      resolve({
        code: 200,
        message: "批量调整成功",
        data: undefined,
        timestamp: new Date().toISOString(),
      });
    }, 800);
  });
};

// 更新学生状态
export const updateStudentStatus = async (
  id: number,
  status: "enrolled" | "suspended" | "graduated" | "withdrawn",
  accountEnabled: boolean,
): Promise<ApiResponse<Student>> => {
  return updateStudent(id, { status, accountEnabled });
};

// 重置学生密码
export const resetStudentPassword = async (
  studentId: string,
  sendEmail: boolean = true,
): Promise<ApiResponse<void>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`重置学生 ${studentId} 的密码，发送邮件: ${sendEmail}`);
      resolve({
        code: 200,
        message: "密码重置成功",
        data: undefined,
        timestamp: new Date().toISOString(),
      });
    }, 500);
  });
};

// 获取班级列表
export const getClasses = async (): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const classes = Array.from(new Set(mockStudents.map((s) => s.class)));
      resolve(classes.sort());
    }, 300);
  });
};

// 获取专业列表
export const getMajors = async (): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const majors = Array.from(new Set(mockStudents.map((s) => s.major)));
      resolve(majors.sort());
    }, 300);
  });
};
