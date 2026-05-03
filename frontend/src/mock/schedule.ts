import type { Course, CheckinRequest, CheckinResponse } from "@/types/schedule";

// 模拟学生课程表数据
export const mockStudentSchedule = (): Promise<Course[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const courses: Course[] = [
        {
          id: 101,
          name: "高等数学",
          date: new Date().toISOString().split("T")[0],
          startTime: "08:00",
          endTime: "09:40",
          location: "教学楼A-301",
          teacher: "张老师",
          status: "checkin",
          description: "高等数学基础课程",
        },
        {
          id: 102,
          name: "大学英语",
          date: new Date().toISOString().split("T")[0],
          startTime: "10:00",
          endTime: "11:40",
          location: "教学楼B-205",
          teacher: "李老师",
          status: "pending",
          description: "大学英语四级辅导",
        },
        {
          id: 103,
          name: "计算机基础",
          date: new Date().toISOString().split("T")[0],
          startTime: "14:00",
          endTime: "15:40",
          location: "实验楼C-101",
          teacher: "王老师",
          status: "pending",
          description: "计算机编程基础",
        },
        {
          id: 104,
          name: "体育",
          date: new Date().toISOString().split("T")[0],
          startTime: "16:00",
          endTime: "17:40",
          location: "体育馆",
          teacher: "赵老师",
          status: "pending",
        },
        {
          id: 105,
          name: "思想政治",
          date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // 明天
          startTime: "08:00",
          endTime: "09:40",
          location: "教学楼A-201",
          teacher: "刘老师",
          status: "pending",
        },
        {
          id: 106,
          name: "数据结构",
          date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          startTime: "10:00",
          endTime: "11:40",
          location: "实验楼D-302",
          teacher: "陈老师",
          status: "pending",
        },
        {
          id: 107,
          name: "大学物理",
          date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0], // 后天
          startTime: "14:00",
          endTime: "15:40",
          location: "教学楼C-105",
          teacher: "孙老师",
          status: "pending",
        },
        {
          id: 108,
          name: "线性代数",
          date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
          startTime: "16:00",
          endTime: "17:40",
          location: "教学楼A-305",
          teacher: "周老师",
          status: "pending",
        },
      ];
      resolve(courses);
    }, 500);
  });
};

// 模拟签到
export const mockCheckin = (
  _data: CheckinRequest,
): Promise<CheckinResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const now = new Date();
      const checkinTime = now.toISOString();

      // 模拟签到逻辑
      const courseStartTime = "10:00"; // 假设课程开始时间
      const checkinHour = now.getHours();
      const checkinMinute = now.getMinutes();
      const [startHour, startMinute] = courseStartTime.split(":").map(Number);

      // 计算是否迟到（课程开始后10分钟内）
      const checkinTotalMinutes = checkinHour * 60 + checkinMinute;
      const startTotalMinutes = startHour * 60 + startMinute;
      const isLate = checkinTotalMinutes > startTotalMinutes + 10;

      if (Math.random() > 0.1) {
        // 90%成功率
        resolve({
          success: true,
          message: isLate ? "签到成功（迟到）" : "签到成功",
          checkinTime,
          status: isLate ? "late" : "success",
        });
      } else {
        reject(new Error("签到失败：二维码无效或不在签到范围内"));
      }
    }, 1000);
  });
};

// 模拟获取课程详情
export const mockGetCourseDetail = (courseId: number): Promise<Course> => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const schedule = await mockStudentSchedule();
      const course = schedule.find((c) => c.id === courseId);
      if (course) {
        resolve(course);
      } else {
        reject(new Error("课程不存在"));
      }
    }, 300);
  });
};
