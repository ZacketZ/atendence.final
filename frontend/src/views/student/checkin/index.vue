<template>
  <div class="checkin-container">
    <div class="page-header">
      <h2>签到打卡</h2>
      <p>查看当前可签到的考勤活动并进行打卡</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 当前可签到活动 -->
    <template v-else>
      <div class="section-title">当前可签到活动</div>

      <div v-if="activeActivities.length === 0" class="empty-state">
        <el-empty description="暂无进行中的考勤活动" />
      </div>

      <div v-else class="activity-list">
        <div
          v-for="activity in activeActivities"
          :key="activity.id"
          class="activity-card"
        >
          <div class="activity-icon">
            <el-icon :size="28"><Location /></el-icon>
          </div>
          <div class="activity-info">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-meta">
              <span
                >时间：{{ formatTime(activity.start_time) }} -
                {{ formatTime(activity.end_time) }}</span
              >
              <span>地点范围：{{ activity.radius }}米</span>
            </div>
          </div>
          <div class="activity-action">
            <el-button
              v-if="!getCheckedInStatus(activity.id)"
              type="primary"
              :loading="checkingId === activity.id"
              @click="handleCheckin(activity)"
            >
              签到打卡
            </el-button>
            <el-tag v-else type="success" effect="plain">已签到 ✓</el-tag>
          </div>
        </div>
      </div>

      <!-- 签到记录 -->
      <div class="section-title" style="margin-top: 32px">我的签到记录</div>

      <div v-if="records.length === 0" class="empty-state">
        <el-empty description="暂无签到记录" />
      </div>

      <div v-else class="records-table">
        <el-table :data="records" stripe style="width: 100%">
          <el-table-column prop="title" label="活动名称" min-width="140" />
          <el-table-column label="签到时间" width="170">
            <template #default="{ row }">
              {{ formatDateTime(row.check_time) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag
                :type="row.final_status === 'normal' ? 'success' : 'danger'"
                effect="plain"
                size="small"
              >
                {{ row.final_status === "normal" ? "正常" : "异常" }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>

    <!-- 签到结果弹窗 -->
    <el-dialog
      v-model="resultDialog.visible"
      title="签到结果"
      width="360px"
      :close-on-click-modal="false"
    >
      <div class="result-content">
        <el-icon
          :size="48"
          :color="resultDialog.success ? '#67c23a' : '#e6a23c'"
        >
          <CircleCheckFilled v-if="resultDialog.success" />
          <WarningFilled v-else />
        </el-icon>
        <p class="result-text">{{ resultDialog.message }}</p>
        <p v-if="resultDialog.distance !== undefined" class="result-detail">
          距签到点约 {{ resultDialog.distance }} 米
        </p>
      </div>
      <template #footer>
        <el-button type="primary" @click="resultDialog.visible = false">
          知道了
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  Location,
  CircleCheckFilled,
  WarningFilled,
} from "@element-plus/icons-vue";
import {
  getCurrentActivities,
  createRecord,
  getStudentRecords,
} from "@/api/attendance";
import type { Activity, Record } from "@/api/attendance";

// 状态
const loading = ref(true);
const activeActivities = ref<Activity[]>([]);
const records = ref<any[]>([]);
const checkingId = ref<number | null>(null);
const checkedInIds = ref<Set<number>>(new Set());

// 签到结果弹窗
const resultDialog = ref({
  visible: false,
  success: false,
  message: "",
  distance: undefined as number | undefined,
});

// 格式化时间
function formatTime(dateStr: string) {
  return dateStr.substring(11, 16);
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return "";
  return dateStr.substring(0, 19).replace("T", " ");
}

// 检查是否已签到
function getCheckedInStatus(activityId: number) {
  return checkedInIds.value.has(activityId);
}

// 获取定位
function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("浏览器不支持定位功能"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

// 签到打卡
async function handleCheckin(activity: Activity) {
  checkingId.value = activity.id;
  try {
    // 1. 获取定位
    const position = await getCurrentPosition();
    const gps_longitude = position.coords.longitude;
    const gps_latitude = position.coords.latitude;

    // 2. 提交打卡
    const now = new Date();
    const check_time = now.toISOString().slice(0, 19).replace("T", " ");

    const result = await createRecord({
      activity_id: activity.id,
      check_time,
      gps_longitude,
      gps_latitude,
      device_info: "web",
    });

    // 3. 计算距离（前端显示用）
    const distance = calcDistance(
      activity.latitude,
      activity.longitude,
      gps_latitude,
      gps_longitude,
    );

    // 4. 显示结果
    const isNormal =
      result.status === "normal" || result.final_status === "normal";
    resultDialog.value = {
      visible: true,
      success: isNormal,
      message: isNormal
        ? "签到成功！位置在允许范围内。"
        : "签到成功，但位置不在允许范围内，已标记为异常。",
      distance: Math.round(distance),
    };

    // 5. 更新状态
    checkedInIds.value.add(activity.id);
    await loadRecords();
  } catch (error: any) {
    if (error.code === 1) {
      ElMessage.error("定位权限被拒绝，请在浏览器设置中允许定位");
    } else if (error.message?.includes("already checked in")) {
      ElMessage.warning("您已签到过该活动");
      checkedInIds.value.add(activity.id);
    } else if (error.message?.includes("not active")) {
      ElMessage.error("该活动不在有效签到时间内");
    } else {
      ElMessage.error("签到失败：" + (error.message || "未知错误"));
    }
  } finally {
    checkingId.value = null;
  }
}

// 计算两点距离（Haversine 公式）
function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const [activities, studentRecords] = await Promise.all([
      getCurrentActivities(),
      getStudentRecords(),
    ]);
    activeActivities.value = activities;
    records.value = studentRecords;

    // 标记已签到的活动
    checkedInIds.value.clear();
    for (const r of studentRecords) {
      checkedInIds.value.add(r.activity_id);
    }
  } catch (error) {
    console.error("加载数据失败:", error);
    ElMessage.error("加载数据失败");
  } finally {
    loading.value = false;
  }
}

async function loadRecords() {
  try {
    const studentRecords = await getStudentRecords();
    records.value = studentRecords;
  } catch {
    // 静默处理
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.checkin-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 24px;

  h2 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 24px;
  }

  p {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 3px solid #409eff;
}

.loading-state {
  padding: 40px 20px;
  background: #fff;
  border-radius: 8px;
}

.empty-state {
  background: #fff;
  border-radius: 8px;
  padding: 40px 0;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
}

.activity-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ecf5ff;
  border-radius: 12px;
  color: #409eff;
}

.activity-info {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 6px;
}

.activity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: #909399;
}

.activity-action {
  flex-shrink: 0;
}

.records-table {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 0;
  text-align: center;
}

.result-text {
  font-size: 16px;
  color: #303133;
  margin: 0;
}

.result-detail {
  font-size: 14px;
  color: #909399;
  margin: 0;
}
</style>
