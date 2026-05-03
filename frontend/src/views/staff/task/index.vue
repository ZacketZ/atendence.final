<template>
  <div class="task-management">
    <div class="page-header">
      <h2>任务管理</h2>
      <p>创建和管理签到考勤活动</p>
    </div>

    <div class="content-wrapper">
      <!-- 左侧：创建活动表单 -->
      <div class="left-panel">
        <div class="panel-title">创建签到活动</div>
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          class="create-form"
        >
          <el-form-item label="活动名称" prop="title">
            <el-input
              v-model="form.title"
              placeholder="例如：高等数学周一签到"
              maxlength="50"
            />
          </el-form-item>

          <el-form-item label="开始时间" prop="start_time">
            <el-date-picker
              v-model="form.start_time"
              type="datetime"
              placeholder="选择签到开始时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="结束时间" prop="end_time">
            <el-date-picker
              v-model="form.end_time"
              type="datetime"
              placeholder="选择签到结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>

          <el-divider content-position="left">签到地点设置</el-divider>

          <el-form-item label="经度" prop="longitude">
            <el-input-number
              v-model="form.longitude"
              :precision="6"
              :step="0.01"
              :min="73"
              :max="135"
              placeholder="例如：116.397"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="纬度" prop="latitude">
            <el-input-number
              v-model="form.latitude"
              :precision="6"
              :step="0.01"
              :min="3"
              :max="53"
              placeholder="例如：39.908"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="签到范围" prop="radius">
            <el-input-number
              v-model="form.radius"
              :min="10"
              :max="1000"
              :step="10"
              style="width: 100%"
            />
            <span class="unit">米</span>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleCreate"
              :loading="submitting"
            >
              创建活动
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 右侧：活动列表 -->
      <div class="right-panel">
        <div class="panel-title">已创建的活动</div>

        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else-if="activities.length === 0" class="empty-state">
          <el-empty description="暂无活动，请创建" />
        </div>

        <div v-else class="activity-list">
          <div
            v-for="activity in activities"
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-header">
              <span class="activity-title">{{ activity.title }}</span>
              <el-tag
                :type="isActivityActive(activity) ? 'success' : 'info'"
                size="small"
              >
                {{ isActivityActive(activity) ? "进行中" : "已结束" }}
              </el-tag>
            </div>
            <div class="activity-info">
              <span
                >时间：{{ formatTime(activity.start_time) }} -
                {{ formatTime(activity.end_time) }}</span
              >
              <span
                >地点：({{ activity.longitude }}, {{ activity.latitude }})
                范围{{ activity.radius }}米</span
              >
            </div>
            <div class="activity-actions">
              <el-button
                type="danger"
                size="small"
                text
                @click="handleDelete(activity)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  createActivity,
  getTeacherActivities,
  deleteActivity,
} from "@/api/attendance";
import type { Activity } from "@/api/attendance";

// 获取当前位置
function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("浏览器不支持地理定位"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

// 表单
const formRef = ref();
const submitting = ref(false);
const locating = ref(false);
const form = reactive({
  title: "",
  start_time: "",
  end_time: "",
  longitude: 116.397,
  latitude: 39.908,
  radius: 200,
});

// 页面加载时自动获取位置
onMounted(async () => {
  try {
    locating.value = true;
    const pos = await getCurrentPosition();
    form.longitude = parseFloat(pos.coords.longitude.toFixed(6));
    form.latitude = parseFloat(pos.coords.latitude.toFixed(6));
  } catch {
    // 获取定位失败，使用默认值（北京天安门附近）
    console.log("无法获取当前位置，使用默认坐标");
  } finally {
    locating.value = false;
  }
  loadActivities();
});

const rules = {
  title: [{ required: true, message: "请输入活动名称", trigger: "blur" }],
  start_time: [
    { required: true, message: "请选择开始时间", trigger: "change" },
  ],
  end_time: [{ required: true, message: "请选择结束时间", trigger: "change" }],
  longitude: [{ required: true, message: "请输入经度", trigger: "blur" }],
  latitude: [{ required: true, message: "请输入纬度", trigger: "blur" }],
  radius: [{ required: true, message: "请输入签到范围", trigger: "blur" }],
};

// 活动列表
const loading = ref(false);
const activities = ref<Activity[]>([]);

// 判断活动是否在进行中
function isActivityActive(activity: Activity) {
  const now = new Date();
  return (
    now >= new Date(activity.start_time) && now <= new Date(activity.end_time)
  );
}

// 格式化时间
function formatTime(dateStr: string) {
  return dateStr.substring(0, 16).replace("T", " ");
}

// 创建活动
async function handleCreate() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    await createActivity(form);
    ElMessage.success("签到活动创建成功！");
    resetForm();
    await loadActivities();
  } catch (error: any) {
    ElMessage.error("创建失败：" + (error.message || "未知错误"));
  } finally {
    submitting.value = false;
  }
}

// 重置表单
function resetForm() {
  formRef.value?.resetFields();
  form.longitude = 116.397;
  form.latitude = 39.908;
  form.radius = 200;
}

// 删除活动
async function handleDelete(activity: Activity) {
  try {
    await ElMessageBox.confirm(
      `确定要删除活动「${activity.title}」吗？`,
      "确认删除",
      { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" },
    );
    await deleteActivity(activity.id);
    ElMessage.success("删除成功");
    await loadActivities();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error("删除失败：" + (error.message || "未知错误"));
    }
  }
}

// 加载活动列表
async function loadActivities() {
  loading.value = true;
  try {
    activities.value = await getTeacherActivities();
  } catch {
    ElMessage.error("加载活动列表失败");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
.task-management {
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

.content-wrapper {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.left-panel,
.right-panel {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.left-panel {
  width: 480px;
  flex-shrink: 0;
}

.right-panel {
  flex: 1;
  min-width: 0;
}

.panel-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 3px solid #409eff;
}

.create-form {
  .unit {
    margin-left: 8px;
    color: #909399;
    font-size: 14px;
  }
}

.loading-state {
  padding: 20px 0;
}

.empty-state {
  padding: 40px 0;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}

.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.activity-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.activity-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.activity-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}
</style>
