export interface Course {
  id: number;
  name: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  teacher: string;
  status: "pending" | "checkin" | "late" | "absent" | "finished";
  description?: string;
}

export interface ScheduleResponse {
  courses: Course[];
  currentWeek: number;
  totalWeeks: number;
}

export interface CheckinRequest {
  courseId: number;
  latitude?: number;
  longitude?: number;
  qrCode?: string;
  checkinTime: string;
}

export interface CheckinResponse {
  success: boolean;
  message: string;
  checkinTime: string;
  status: "success" | "late" | "invalid";
}

export interface AttendanceRecord {
  id: number;
  courseId: number;
  courseName: string;
  checkinTime: string;
  status: "normal" | "late" | "absent" | "leave";
  location?: string;
  teacher: string;
  date: string;
}
