import type {
  AttendanceRecord,
  AttendanceQueryParams,
  AttendanceModificationRequest,
  StudentAttendanceStats,
  ClassAttendanceStats,
  DateTrendData,
  LateDurationStats,
  DashboardData,
  ExportOptions,
} from "@/types/attendance";

// 模拟获取考勤记录
export const getAttendanceRecords = async (
  params: AttendanceQueryParams,
): Promise<{
  records: AttendanceRecord[];
  total: number;
  page: number;
  pageSize: number;
}> => {
  // 模拟数据
  const mockRecords: AttendanceRecord[] = [
    {
      id: 1,
      studentId: "20230001",
      studentName: "张三",
      className: "计算机科学与技术1班",
      courseId: 101,
      courseName: "高等数学",
      checkinTime: "2024-01-15 08:30:00",
      status: "normal",
      location: "教学楼A-301",
      teacher: "张老师",
      date: "2024-01-15",
    },
    {
      id: 2,
      studentId: "20230002",
      studentName: "李四",
      className: "计算机科学与技术1班",
      courseId: 101,
      courseName: "高等数学",
      checkinTime: "2024-01-15 08:45:00",
      status: "late",
      location: "教学楼A-301",
      teacher: "张老师",
      date: "2024-01-15",
      remark: "迟到15分钟",
    },
    {
      id: 3,
      studentId: "20230003",
      studentName: "王五",
      className: "计算机科学与技术1班",
      courseId: 101,
      courseName: "高等数学",
      checkinTime: "",
      status: "absent",
      location: "教学楼A-301",
      teacher: "张老师",
      date: "2024-01-15",
      remark: "未签到",
    },
    {
      id: 4,
      studentId: "20230004",
      studentName: "赵六",
      className: "计算机科学与技术2班",
      courseId: 102,
      courseName: "大学英语",
      checkinTime: "2024-01-15 10:00:00",
      status: "normal",
      location: "教学楼B-205",
      teacher: "李老师",
      date: "2024-01-15",
    },
    {
      id: 5,
      studentId: "20230005",
      studentName: "钱七",
      className: "计算机科学与技术2班",
      courseId: 102,
      courseName: "大学英语",
      checkinTime: "2024-01-15 10:20:00",
      status: "late",
      location: "教学楼B-205",
      teacher: "李老师",
      date: "2024-01-15",
      remark: "迟到20分钟",
    },
    {
      id: 6,
      studentId: "20230001",
      studentName: "张三",
      className: "计算机科学与技术1班",
      courseId: 103,
      courseName: "计算机基础",
      checkinTime: "2024-01-16 14:00:00",
      status: "normal",
      location: "实验楼C-101",
      teacher: "王老师",
      date: "2024-01-16",
    },
    {
      id: 7,
      studentId: "20230002",
      studentName: "李四",
      className: "计算机科学与技术1班",
      courseId: 103,
      courseName: "计算机基础",
      checkinTime: "",
      status: "leave",
      location: "实验楼C-101",
      teacher: "王老师",
      date: "2024-01-16",
      remark: "病假",
    },
    {
      id: 8,
      studentId: "20230006",
      studentName: "孙八",
      className: "软件工程1班",
      courseId: 104,
      courseName: "数据结构",
      checkinTime: "2024-01-16 16:00:00",
      status: "normal",
      location: "实验楼D-302",
      teacher: "陈老师",
      date: "2024-01-16",
    },
    {
      id: 9,
      studentId: "20230007",
      studentName: "周九",
      className: "软件工程1班",
      courseId: 104,
      courseName: "数据结构",
      checkinTime: "2024-01-16 16:15:00",
      status: "late",
      location: "实验楼D-302",
      teacher: "陈老师",
      date: "2024-01-16",
      remark: "迟到15分钟",
    },
    {
      id: 10,
      studentId: "20230008",
      studentName: "吴十",
      className: "软件工程1班",
      courseId: 104,
      courseName: "数据结构",
      checkinTime: "",
      status: "absent",
      location: "实验楼D-302",
      teacher: "陈老师",
      date: "2024-01-16",
      remark: "未签到",
    },
  ];

  // 模拟筛选逻辑
  let filteredRecords = [...mockRecords];

  if (params.startDate) {
    filteredRecords = filteredRecords.filter(
      (record) => record.date >= params.startDate!,
    );
  }

  if (params.endDate) {
    filteredRecords = filteredRecords.filter(
      (record) => record.date <= params.endDate!,
    );
  }

  if (params.className) {
    filteredRecords = filteredRecords.filter((record) =>
      record.className.includes(params.className!),
    );
  }

  if (params.studentName) {
    filteredRecords = filteredRecords.filter((record) =>
      record.studentName.includes(params.studentName!),
    );
  }

  if (params.studentId) {
    filteredRecords = filteredRecords.filter((record) =>
      record.studentId.includes(params.studentId!),
    );
  }

  if (params.status) {
    if (params.status === "abnormal") {
      // 只看异常：包括迟到、缺勤、请假
      filteredRecords = filteredRecords.filter((record) =>
        ["late", "absent", "leave"].includes(record.status),
      );
    } else if (params.status !== "all") {
      // 特定状态筛选
      filteredRecords = filteredRecords.filter(
        (record) => record.status === params.status,
      );
    }
    // 如果 status === "all"，不进行筛选
  }

  // 模拟分页
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  return {
    records: paginatedRecords,
    total: filteredRecords.length,
    page,
    pageSize,
  };
};

// 模拟修改考勤状态
export const modifyAttendanceStatus = async (
  request: AttendanceModificationRequest,
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("修改考勤状态:", request);
      resolve();
    }, 500);
  });
};

// 模拟获取学生考勤统计
export const getStudentAttendanceStats = async (params: {
  startDate?: string;
  endDate?: string;
  className?: string;
}): Promise<StudentAttendanceStats[]> => {
  // 模拟数据
  const mockStats = [
    {
      studentId: "20230002",
      studentName: "李四",
      className: "计算机科学与技术1班",
      totalCourses: 20,
      lateCount: 5,
      absentCount: 2,
      leaveCount: 1,
      lateRate: 25, // 5/20
      absentRate: 10, // 2/20
      totalAbnormalRate: 40, // (5+2+1)/20
    },
    {
      studentId: "20230005",
      studentName: "钱七",
      className: "计算机科学与技术2班",
      totalCourses: 20,
      lateCount: 8,
      absentCount: 1,
      leaveCount: 0,
      lateRate: 40,
      absentRate: 5,
      totalAbnormalRate: 45,
    },
    {
      studentId: "20230003",
      studentName: "王五",
      className: "计算机科学与技术1班",
      totalCourses: 20,
      lateCount: 3,
      absentCount: 4,
      leaveCount: 0,
      lateRate: 15,
      absentRate: 20,
      totalAbnormalRate: 35,
    },
    {
      studentId: "20230009",
      studentName: "郑十一",
      className: "软件工程1班",
      totalCourses: 20,
      lateCount: 10,
      absentCount: 3,
      leaveCount: 1,
      lateRate: 50,
      absentRate: 15,
      totalAbnormalRate: 70,
    },
    {
      studentId: "20230008",
      studentName: "吴十",
      className: "软件工程1班",
      totalCourses: 20,
      lateCount: 2,
      absentCount: 6,
      leaveCount: 0,
      lateRate: 10,
      absentRate: 30,
      totalAbnormalRate: 40,
    },
  ];

  // 模拟筛选逻辑
  let filteredStats = [...mockStats];

  if (params.className) {
    filteredStats = filteredStats.filter(
      (stat) => stat.className === params.className,
    );
  }

  // 在实际项目中，这里会根据 startDate 和 endDate 进行筛选
  // 由于是模拟数据，我们只返回筛选后的结果
  return filteredStats;
};

// 模拟获取班级考勤统计
export const getClassAttendanceStats = async (): Promise<
  ClassAttendanceStats[]
> => {
  return [
    {
      className: "计算机科学与技术1班",
      totalStudents: 30,
      averageLateRate: 15,
      averageAbsentRate: 8,
      totalLateCount: 45,
      totalAbsentCount: 24,
      totalLeaveCount: 6,
    },
    {
      className: "计算机科学与技术2班",
      totalStudents: 28,
      averageLateRate: 20,
      averageAbsentRate: 5,
      totalLateCount: 56,
      totalAbsentCount: 14,
      totalLeaveCount: 3,
    },
    {
      className: "软件工程1班",
      totalStudents: 32,
      averageLateRate: 25,
      averageAbsentRate: 12,
      totalLateCount: 80,
      totalAbsentCount: 38,
      totalLeaveCount: 8,
    },
    {
      className: "软件工程2班",
      totalStudents: 30,
      averageLateRate: 18,
      averageAbsentRate: 7,
      totalLateCount: 54,
      totalAbsentCount: 21,
      totalLeaveCount: 5,
    },
  ];
};

// 模拟获取日期趋势数据
export const getDateTrendData = async (): Promise<DateTrendData[]> => {
  // 模拟生成日期趋势数据
  const dates = [
    "2024-01-15",
    "2024-01-16",
    "2024-01-17",
    "2024-01-18",
    "2024-01-19",
  ];
  return dates
    .map((date) => ({
      date,
      lateCount: Math.floor(Math.random() * 10) + 1,
      absentCount: Math.floor(Math.random() * 5) + 1,
      leaveCount: Math.floor(Math.random() * 3),
      totalAbnormalCount: 0, // 将在下面计算
    }))
    .map((item) => ({
      ...item,
      totalAbnormalCount: item.lateCount + item.absentCount + item.leaveCount,
    }));
};

// 模拟获取迟到时长分布
export const getLateDurationStats = async (): Promise<LateDurationStats[]> => {
  return [
    {
      durationRange: "0-5分钟",
      count: 15,
      percentage: 30,
    },
    {
      durationRange: "5-15分钟",
      count: 25,
      percentage: 50,
    },
    {
      durationRange: "15分钟以上",
      count: 10,
      percentage: 20,
    },
  ];
};

// 模拟获取看板数据
export const getDashboardData = async (): Promise<DashboardData> => {
  const today = new Date().toISOString().split("T")[0];

  return {
    todayLateCount: 8,
    todayAbsentCount: 3,
    weekAbnormalCount: 45,
    monthAbnormalCount: 180,
    recentAbnormalRecords: [
      {
        id: 2,
        studentId: "20230002",
        studentName: "李四",
        className: "计算机科学与技术1班",
        courseId: 101,
        courseName: "高等数学",
        checkinTime: "2024-01-15 08:45:00",
        status: "late",
        location: "教学楼A-301",
        teacher: "张老师",
        date: today,
        remark: "迟到15分钟",
      },
      {
        id: 3,
        studentId: "20230003",
        studentName: "王五",
        className: "计算机科学与技术1班",
        courseId: 101,
        courseName: "高等数学",
        checkinTime: "",
        status: "absent",
        location: "教学楼A-301",
        teacher: "张老师",
        date: today,
        remark: "未签到",
      },
      {
        id: 5,
        studentId: "20230005",
        studentName: "钱七",
        className: "计算机科学与技术2班",
        courseId: 102,
        courseName: "大学英语",
        checkinTime: "2024-01-15 10:20:00",
        status: "late",
        location: "教学楼B-205",
        teacher: "李老师",
        date: today,
        remark: "迟到20分钟",
      },
    ],
    topLateStudents: [
      {
        studentId: "20230009",
        studentName: "郑十一",
        className: "软件工程1班",
        totalCourses: 20,
        lateCount: 10,
        absentCount: 3,
        leaveCount: 1,
        lateRate: 50,
        absentRate: 15,
        totalAbnormalRate: 70,
      },
      {
        studentId: "20230005",
        studentName: "钱七",
        className: "计算机科学与技术2班",
        totalCourses: 20,
        lateCount: 8,
        absentCount: 1,
        leaveCount: 0,
        lateRate: 40,
        absentRate: 5,
        totalAbnormalRate: 45,
      },
    ],
    topAbsentStudents: [
      {
        studentId: "20230008",
        studentName: "吴十",
        className: "软件工程1班",
        totalCourses: 20,
        lateCount: 2,
        absentCount: 6,
        leaveCount: 0,
        lateRate: 10,
        absentRate: 30,
        totalAbnormalRate: 40,
      },
      {
        studentId: "20230003",
        studentName: "王五",
        className: "计算机科学与技术1班",
        totalCourses: 20,
        lateCount: 3,
        absentCount: 4,
        leaveCount: 0,
        lateRate: 15,
        absentRate: 20,
        totalAbnormalRate: 35,
      },
    ],
  };
};

// 模拟导出考勤数据
export const exportAttendanceData = async (
  params: AttendanceQueryParams,
  options: ExportOptions,
): Promise<{ url: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("导出参数:", params, options);
      resolve({
        url: `/exports/attendance_${new Date().getTime()}.${options.format}`,
      });
    }, 1000);
  });
};
