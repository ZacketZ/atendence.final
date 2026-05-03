const { pool: db } = require("../config/db");

class RecordService {
  // 学生打卡
  async createRecord(
    user_id,
    activity_id,
    check_time,
    gps_longitude,
    gps_latitude,
    liveness_result,
    device_info,
  ) {
    try {
      // 检查活动是否存在
      const [activities] = await db.query(
        "SELECT * FROM attendance_activities WHERE id = ?",
        [activity_id],
      );
      if (activities.length === 0) {
        throw new Error("Activity not found");
      }

      const activity = activities[0];
      const now = new Date();

      // 检查活动是否在有效期内
      if (
        now < new Date(activity.start_time) ||
        now > new Date(activity.end_time)
      ) {
        throw new Error("Activity is not active");
      }

      // 计算距离，检查是否在地理围栏内
      const distance = this.calculateDistance(
        parseFloat(activity.latitude),
        parseFloat(activity.longitude),
        parseFloat(gps_latitude),
        parseFloat(gps_longitude),
      );

      let final_status = "normal";
      if (distance > activity.radius) {
        final_status = "abnormal";
      }

      // 检查是否已经打卡
      const [existingRecords] = await db.query(
        "SELECT * FROM attendance_records WHERE activity_id = ? AND user_id = ?",
        [activity_id, user_id],
      );

      if (existingRecords.length > 0) {
        throw new Error("You have already checked in for this activity");
      }

      // 创建打卡记录
      await db.query(
        "INSERT INTO attendance_records (activity_id, user_id, check_time, gps_longitude, gps_latitude, final_status, device_info) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          activity_id,
          user_id,
          check_time,
          gps_longitude,
          gps_latitude,
          final_status,
          device_info,
        ],
      );

      return { message: "Check-in successful", status: final_status };
    } catch (error) {
      throw error;
    }
  }

  // 获取学生的打卡记录
  async getStudentRecords(user_id) {
    try {
      const [records] = await db.query(
        "SELECT r.*, a.title FROM attendance_records r JOIN attendance_activities a ON r.activity_id = a.id WHERE r.user_id = ? ORDER BY r.check_time DESC",
        [user_id],
      );
      return records;
    } catch (error) {
      throw error;
    }
  }

  // 获取活动的打卡记录
  async getActivityRecords(activity_id) {
    try {
      const [records] = await db.query(
        "SELECT r.*, u.student_id, u.name FROM attendance_records r JOIN users u ON r.user_id = u.id WHERE r.activity_id = ? ORDER BY r.check_time ASC",
        [activity_id],
      );
      return records;
    } catch (error) {
      throw error;
    }
  }

  // 计算两点之间的距离（米）
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // 地球半径（米）
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

module.exports = new RecordService();
