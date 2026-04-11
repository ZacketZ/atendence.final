import { mockStudentSchedule, mockCheckin } from "@/mock/schedule";
import type { Course, CheckinRequest, CheckinResponse } from "@/types/schedule";

// 获取学生课程表
export const getStudentSchedule = async (): Promise<Course[]> => {
  return await mockStudentSchedule();
};

// 课程签到
export const checkinCourse = async (
  data: CheckinRequest,
): Promise<CheckinResponse> => {
  return await mockCheckin(data);
};

// 获取签到记录
export const getCheckinRecords = async (
  _startDate?: string,
  _endDate?: string,
): Promise<
  Array<{
    id: number;
    courseId: number;
    courseName: string;
    checkinTime: string;
    status: "normal" | "late" | "absent" | "early";
    location: string;
    teacher: string;
    date: string;
  }>
> => {
  // 模拟数据
  return Promise.resolve([
    {
      id: 1,
      courseId: 101,
      courseName: "高等数学",
      checkinTime: "2024-01-15 08:30:00",
      status: "normal" as const,
      location: "教学楼A-301",
      teacher: "张老师",
      date: "2024-01-15",
    },
    {
      id: 2,
      courseId: 102,
      courseName: "大学英语",
      checkinTime: "2024-01-15 10:15:00",
      status: "late" as const,
      location: "教学楼B-205",
      teacher: "李老师",
      date: "2024-01-15",
    },
    {
      id: 3,
      courseId: 103,
      courseName: "计算机基础",
      checkinTime: "2024-01-16 14:00:00",
      status: "normal" as const,
      location: "实验楼C-101",
      teacher: "王老师",
      date: "2024-01-16",
    },
  ]);
};

// 获取课程详情
export const getCourseDetail = async (courseId: number): Promise<Course> => {
  const schedule = await mockStudentSchedule();
  const course = schedule.find((c: Course) => c.id === courseId);
  if (!course) {
    throw new Error("课程不存在");
  }
  return course;
};

// 获取今日课程
export const getTodayCourses = async (): Promise<Course[]> => {
  const schedule = await mockStudentSchedule();
  const today = new Date().toISOString().split("T")[0];
  return schedule.filter((course: Course) => course.date === today);
};

// 获取待签到课程
export const getPendingCheckinCourses = async (): Promise<Course[]> => {
  const schedule = await mockStudentSchedule();
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const currentTime = `${hours}:${minutes}`;
  const today = now.toISOString().split("T")[0];

  return schedule.filter((course: Course) => {
    return (
      course.date === today &&
      course.status === "pending" &&
      course.startTime <= currentTime &&
      course.endTime >= currentTime
    );
  });
};
