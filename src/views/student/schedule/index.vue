<template>
  <div class="schedule-container">
    <!-- 顶部操作栏 -->
    <div class="schedule-header">
      <div class="header-left">
        <h2>课程表</h2>
        <div class="date-info">
          <span class="current-date">{{ currentDate }}</span>
          <span class="current-week">{{ currentWeek }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button
            :type="viewMode === 'week' ? 'primary' : 'default'"
            @click="switchViewMode('week')"
          >
            周视图
          </el-button>
          <el-button
            :type="viewMode === 'month' ? 'primary' : 'default'"
            @click="switchViewMode('month')"
          >
            月视图
          </el-button>
        </el-button-group>
        <el-button @click="refreshSchedule" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 周视图 -->
    <div v-if="viewMode === 'week'" class="week-view">
      <!-- 周选择器 -->
      <div class="week-selector">
        <el-button @click="prevWeek" :disabled="loading">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="week-range">{{ weekRange }}</span>
        <el-button @click="nextWeek" :disabled="loading">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
        <el-button @click="goToToday" type="primary" plain> 今天 </el-button>
      </div>

      <!-- 课程表网格 -->
      <div class="schedule-grid">
        <!-- 时间轴 -->
        <div class="time-axis">
          <div class="time-header">时间</div>
          <div v-for="timeSlot in timeSlots" :key="timeSlot" class="time-slot">
            {{ timeSlot }}
          </div>
        </div>

        <!-- 星期列 -->
        <div v-for="day in weekDays" :key="day.date" class="day-column">
          <div class="day-header">
            <div class="day-name">{{ day.name }}</div>
            <div class="day-date">{{ day.date }}</div>
          </div>
          <div class="day-content">
            <div
              v-for="timeSlot in timeSlots"
              :key="timeSlot"
              class="time-cell"
            >
              <!-- 课程卡片 -->
              <div
                v-for="course in getCoursesByDayAndTime(day.date, timeSlot)"
                :key="course.id"
                class="course-card"
                :class="getCourseStatusClass(course)"
                @click="handleCourseClick(course)"
              >
                <div class="course-name">{{ course.name }}</div>
                <div class="course-info">
                  <span class="course-time"
                    >{{ course.startTime }} - {{ course.endTime }}</span
                  >
                  <span class="course-location">{{ course.location }}</span>
                </div>
                <div class="course-status">
                  <el-tag :type="getStatusTagType(course.status)" size="small">
                    {{ getStatusText(course.status) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 月视图 -->
    <div v-else class="month-view">
      <div class="month-selector">
        <el-button @click="prevMonth" :disabled="loading">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="month-title">{{ currentMonth }}</span>
        <el-button @click="nextMonth" :disabled="loading">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>

      <div class="calendar">
        <!-- 星期标题 -->
        <div class="weekdays-header">
          <div v-for="weekday in weekdays" :key="weekday" class="weekday">
            {{ weekday }}
          </div>
        </div>

        <!-- 日期网格 -->
        <div class="dates-grid">
          <div
            v-for="date in calendarDates"
            :key="date.date"
            class="date-cell"
            :class="{
              today: date.isToday,
              'current-month': date.isCurrentMonth,
              'has-courses': date.courses.length > 0,
            }"
            @click="handleDateClick(date)"
          >
            <div class="date-number">{{ date.day }}</div>
            <div v-if="date.courses.length > 0" class="course-indicators">
              <div
                v-for="course in date.courses.slice(0, 3)"
                :key="course.id"
                class="course-indicator"
                :class="getCourseStatusClass(course)"
              ></div>
            </div>
            <div v-if="date.courses.length > 3" class="more-courses">
              +{{ date.courses.length - 3 }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 课程详情弹窗 -->
    <el-dialog
      v-model="courseDialogVisible"
      :title="selectedCourse?.name || '课程详情'"
      width="500px"
    >
      <div v-if="selectedCourse" class="course-detail">
        <div class="detail-item">
          <span class="label">课程名称：</span>
          <span class="value">{{ selectedCourse.name }}</span>
        </div>
        <div class="detail-item">
          <span class="label">上课时间：</span>
          <span class="value"
            >{{ selectedCourse.startTime }} - {{ selectedCourse.endTime }}</span
          >
        </div>
        <div class="detail-item">
          <span class="label">上课地点：</span>
          <span class="value">{{ selectedCourse.location }}</span>
        </div>
        <div class="detail-item">
          <span class="label">授课教师：</span>
          <span class="value">{{ selectedCourse.teacher }}</span>
        </div>
        <div class="detail-item">
          <span class="label">课程状态：</span>
          <el-tag :type="getStatusTagType(selectedCourse.status)" size="small">
            {{ getStatusText(selectedCourse.status) }}
          </el-tag>
        </div>
        <div v-if="selectedCourse.description" class="detail-item">
          <span class="label">课程描述：</span>
          <span class="value">{{ selectedCourse.description }}</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="courseDialogVisible = false">关闭</el-button>
          <el-button
            v-if="selectedCourse?.status === 'pending'"
            type="primary"
            @click="handleCheckin(selectedCourse!)"
          >
            立即签到
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Refresh, ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
import { getStudentSchedule } from "@/api/schedule";
import type { Course } from "@/types/schedule";

// 视图模式
const viewMode = ref<"week" | "month">("week");
const loading = ref(false);

// 当前日期
const currentDate = ref(new Date());

// 课程数据
const courses = ref<Course[]>([]);

// 弹窗控制
const courseDialogVisible = ref(false);
const selectedCourse = ref<Course | null>(null);

// 时间槽位
const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

// 星期几
const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

// 计算属性
const currentWeek = computed(() => {
  const weekMap = ["日", "一", "二", "三", "四", "五", "六"];
  return `星期${weekMap[currentDate.value.getDay()]}`;
});

const weekRange = computed(() => {
  const start = new Date(currentDate.value);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const format = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`;
  return `${format(start)} - ${format(end)}`;
});

const weekDays = computed(() => {
  const start = new Date(currentDate.value);
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split("T")[0],
      name: weekdays[date.getDay()],
      day: date.getDate(),
    };
  });
});

const currentMonth = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth() + 1;
  return `${year}年${month}月`;
});

const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 获取当月第一天是星期几
  const firstDayIndex = firstDay.getDay();

  // 计算需要显示的总天数（包括上个月和下个月的部分日期）
  const totalDays = 42; // 6周 * 7天
  const dates = [];

  // 添加上个月的日期
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    dates.push({
      date: date.toISOString().split("T")[0],
      day: date.getDate(),
      isToday: false,
      isCurrentMonth: false,
      courses: getCoursesByDate(date.toISOString().split("T")[0]),
    });
  }

  // 添加当月的日期
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    const dateStr = date.toISOString().split("T")[0];
    dates.push({
      date: dateStr,
      day: i,
      isToday: dateStr === todayStr,
      isCurrentMonth: true,
      courses: getCoursesByDate(dateStr),
    });
  }

  // 添加下个月的日期
  const remainingDays = totalDays - dates.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    dates.push({
      date: date.toISOString().split("T")[0],
      day: i,
      isToday: false,
      isCurrentMonth: false,
      courses: getCoursesByDate(date.toISOString().split("T")[0]),
    });
  }

  return dates;
});

// 方法
const switchViewMode = (mode: "week" | "month") => {
  viewMode.value = mode;
};

const refreshSchedule = async () => {
  loading.value = true;
  try {
    courses.value = await getStudentSchedule();
    ElMessage.success("课程表已刷新");
  } catch (error) {
    ElMessage.error("刷新失败：" + (error as Error).message);
  } finally {
    loading.value = false;
  }
};

const prevWeek = () => {
  const date = new Date(currentDate.value);
  date.setDate(date.getDate() - 7);
  currentDate.value = date;
};

const nextWeek = () => {
  const date = new Date(currentDate.value);
  date.setDate(date.getDate() + 7);
  currentDate.value = date;
};

const goToToday = () => {
  currentDate.value = new Date();
};

const prevMonth = () => {
  const date = new Date(currentDate.value);
  date.setMonth(date.getMonth() - 1);
  currentDate.value = date;
};

const nextMonth = () => {
  const date = new Date(currentDate.value);
  date.setMonth(date.getMonth() + 1);
  currentDate.value = date;
};

const getCoursesByDayAndTime = (date: string, timeSlot: string) => {
  return courses.value.filter((course) => {
    return (
      course.date === date &&
      course.startTime <= timeSlot &&
      course.endTime >= timeSlot
    );
  });
};

const getCoursesByDate = (date: string) => {
  return courses.value.filter((course) => course.date === date);
};

const getCourseStatusClass = (course: Course) => {
  const statusMap: Record<string, string> = {
    pending: "status-pending",
    checkin: "status-checkin",
    late: "status-late",
    absent: "status-absent",
    finished: "status-finished",
  };
  return statusMap[course.status] || "";
};

const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: "info",
    checkin: "success",
    late: "warning",
    absent: "danger",
    finished: "info",
  };
  return typeMap[status] || "info";
};

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: "未开始",
    checkin: "已签到",
    late: "迟到",
    absent: "缺勤",
    finished: "已结束",
  };
  return textMap[status] || status;
};

const handleCourseClick = (course: Course) => {
  selectedCourse.value = course;
  courseDialogVisible.value = true;
};

const handleDateClick = (date: any) => {
  if (date.courses.length > 0) {
    // 如果有课程，显示第一个课程的详情
    selectedCourse.value = date.courses[0];
    courseDialogVisible.value = true;
  }
};

const handleCheckin = (course: Course) => {
  // 跳转到签到页面
  window.location.href = `/student/checkin?courseId=${course.id}`;
};

// 生命周期
onMounted(() => {
  refreshSchedule();
});
</script>

<style scoped lang="scss">
.schedule-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .header-left {
    h2 {
      margin: 0 0 8px 0;
      color: #303133;
      font-size: 24px;
    }

    .date-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .current-date {
        font-size: 16px;
        color: #606266;
      }

      .current-week {
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.week-view {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.week-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;

  .week-range {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    min-width: 200px;
    text-align: center;
  }
}

.schedule-grid {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;

  .time-axis {
    background: #f5f7fa;
    border-right: 1px solid #e4e7ed;

    .time-header {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      color: #303133;
      border-bottom: 1px solid #e4e7ed;
    }

    .time-slot {
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #909399;
      border-bottom: 1px solid #e4e7ed;

      &:last-child {
        border-bottom: none;
      }
    }
  }

  .day-column {
    border-right: 1px solid #e4e7ed;
    background: white;

    &:last-child {
      border-right: none;
    }

    .day-header {
      height: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid #e4e7ed;
      background: #f8f9fa;

      .day-name {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
      }

      .day-date {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }
    }

    .day-content {
      .time-cell {
        height: 80px;
        border-bottom: 1px solid #e4e7ed;
        position: relative;

        &:last-child {
          border-bottom: none;
        }

        .course-card {
          position: absolute;
          top: 2px;
          left: 2px;
          right: 2px;
          bottom: 2px;
          padding: 8px;
          background: #f0f9ff;
          border: 1px solid #bae0ff;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transform: translateY(-1px);
          }

          &.status-pending {
            background: #f0f9ff;
            border-color: #bae0ff;
          }

          &.status-checkin {
            background: #f6ffed;
            border-color: #b7eb8f;
          }

          &.status-late {
            background: #fff7e6;
            border-color: #ffd591;
          }

          &.status-absent {
            background: #fff2f0;
            border-color: #ffccc7;
          }

          &.status-finished {
            background: #f6f6f6;
            border-color: #d9d9d9;
          }

          .course-name {
            font-size: 12px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .course-info {
            display: flex;
            flex-direction: column;
            gap: 2px;

            .course-time {
              font-size: 10px;
              color: #606266;
            }

            .course-location {
              font-size: 10px;
              color: #909399;
            }
          }

          .course-status {
            position: absolute;
            bottom: 4px;
            right: 4px;
          }
        }
      }
    }
  }
}

.month-view {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.month-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;

  .month-title {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
    min-width: 150px;
    text-align: center;
  }
}

.calendar {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;

  .weekdays-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;

    .weekday {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      border-right: 1px solid #e4e7ed;

      &:last-child {
        border-right: none;
      }
    }
  }

  .dates-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: repeat(6, 1fr);

    .date-cell {
      height: 100px;
      border-right: 1px solid #e4e7ed;
      border-bottom: 1px solid #e4e7ed;
      padding: 8px;
      cursor: pointer;
      transition: all 0.2s;

      &:nth-child(7n) {
        border-right: none;
      }

      &:nth-last-child(-n + 7) {
        border-bottom: none;
      }

      &:hover {
        background: #f5f7fa;
      }

      &.today {
        background: #f0f9ff;
      }

      &.current-month {
        background: white;
      }

      &:not(.current-month) {
        background: #fafafa;
        color: #c0c4cc;
      }

      &.has-courses {
        background: #f6ffed;
      }

      .date-number {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 8px;
      }

      .course-indicators {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        margin-bottom: 4px;

        .course-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;

          &.status-pending {
            background: #1890ff;
          }

          &.status-checkin {
            background: #52c41a;
          }

          &.status-late {
            background: #faad14;
          }

          &.status-absent {
            background: #ff4d4f;
          }

          &.status-finished {
            background: #d9d9d9;
          }
        }
      }

      .more-courses {
        font-size: 10px;
        color: #909399;
      }
    }
  }
}

.course-detail {
  .detail-item {
    display: flex;
    margin-bottom: 12px;

    .label {
      width: 80px;
      color: #606266;
      font-size: 14px;
    }

    .value {
      flex: 1;
      color: #303133;
      font-size: 14px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
