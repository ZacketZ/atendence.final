<template>
  <div class="leave-container">
    <div class="page-header">
      <h2>请假申请</h2>
      <p>提交请假或申诉申请，并查看审核进度</p>
    </div>

    <div class="content-wrapper">
      <!-- 左侧：提交申请 -->
      <div class="left-panel">
        <div class="panel-title">提交申请</div>
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="80px"
          class="appeal-form"
        >
          <el-form-item label="申请类型" prop="type">
            <el-radio-group v-model="form.type">
              <el-radio value="leave">请假</el-radio>
              <el-radio value="appeal">申诉</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="相关活动" prop="activity_id">
            <el-select
              v-model="form.activity_id"
              placeholder="选择考勤活动"
              style="width: 100%"
            >
              <el-option
                v-for="act in activities"
                :key="act.id"
                :label="act.title"
                :value="act.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="申请原因" prop="reason">
            <el-input
              v-model="form.reason"
              type="textarea"
              :rows="4"
              placeholder="请详细描述请假或申诉的原因..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleSubmit"
              :loading="submitting"
            >
              提交申请
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 右侧：申请记录 -->
      <div class="right-panel">
        <div class="panel-title">我的申请记录</div>

        <!-- 筛选 -->
        <div class="filter-bar">
          <el-select
            v-model="filterStatus"
            placeholder="筛选状态"
            clearable
            style="width: 120px"
            @change="loadAppeals"
          >
            <el-option label="全部" value="" />
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
          <el-select
            v-model="filterType"
            placeholder="筛选类型"
            clearable
            style="width: 120px"
            @change="loadAppeals"
          >
            <el-option label="全部" value="" />
            <el-option label="请假" value="leave" />
            <el-option label="申诉" value="appeal" />
          </el-select>
        </div>

        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else-if="appeals.length === 0" class="empty-state">
          <el-empty description="暂无申请记录" />
        </div>

        <div v-else class="appeal-list">
          <div v-for="appeal in appeals" :key="appeal.id" class="appeal-card">
            <div class="appeal-header">
              <div class="appeal-title">
                <el-tag
                  :type="appeal.type === 'leave' ? 'warning' : 'primary'"
                  size="small"
                  effect="plain"
                >
                  {{ appeal.type === "leave" ? "请假" : "申诉" }}
                </el-tag>
                <span>{{ appeal.title || "未知活动" }}</span>
              </div>
              <el-tag :type="statusTagType(appeal.status)" size="small">
                {{ statusText(appeal.status) }}
              </el-tag>
            </div>
            <div class="appeal-body">
              <p class="appeal-reason">{{ appeal.reason }}</p>
              <div class="appeal-meta">
                <span>提交时间：{{ formatDateTime(appeal.created_at) }}</span>
              </div>
              <div v-if="appeal.admin_comment" class="appeal-reply">
                <span class="reply-label">管理员回复：</span>
                <span>{{ appeal.admin_comment }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  getCurrentActivities,
  submitAppeal,
  getStudentAppeals,
} from "@/api/attendance";
import type { Activity, Appeal } from "@/api/attendance";

// 表单
const formRef = ref();
const submitting = ref(false);
const form = reactive({
  type: "leave" as "leave" | "appeal",
  activity_id: null as number | null,
  reason: "",
});

const rules = {
  type: [{ required: true, message: "请选择申请类型", trigger: "change" }],
  activity_id: [
    { required: true, message: "请选择相关活动", trigger: "change" },
  ],
  reason: [
    { required: true, message: "请输入申请原因", trigger: "blur" },
    { min: 5, message: "原因至少5个字符", trigger: "blur" },
  ],
};

// 活动列表
const activities = ref<Activity[]>([]);

// 申请记录
const loading = ref(false);
const appeals = ref<Appeal[]>([]);
const filterStatus = ref("");
const filterType = ref("");

function statusTagType(status: string) {
  switch (status) {
    case "pending":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    default:
      return "info";
  }
}

function statusText(status: string) {
  switch (status) {
    case "pending":
      return "待审核";
    case "approved":
      return "已通过";
    case "rejected":
      return "已驳回";
    default:
      return status;
  }
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return "";
  return dateStr.substring(0, 19).replace("T", " ");
}

// 提交申请
async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    await submitAppeal({
      activity_id: form.activity_id!,
      type: form.type,
      reason: form.reason,
    });
    ElMessage.success("申请提交成功！");
    resetForm();
    await loadAppeals();
  } catch (error: any) {
    ElMessage.error("提交失败：" + (error.message || "未知错误"));
  } finally {
    submitting.value = false;
  }
}

function resetForm() {
  formRef.value?.resetFields();
  form.type = "leave";
  form.activity_id = null;
  form.reason = "";
}

// 加载申请记录
async function loadAppeals() {
  loading.value = true;
  try {
    let list = await getStudentAppeals();
    if (filterStatus.value) {
      list = list.filter((a) => a.status === filterStatus.value);
    }
    if (filterType.value) {
      list = list.filter((a) => a.type === filterType.value);
    }
    appeals.value = list;
  } catch {
    ElMessage.error("加载申请记录失败");
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  try {
    activities.value = await getCurrentActivities();
  } catch {
    // 静默处理
  }
  await loadAppeals();
});
</script>

<style scoped lang="scss">
.leave-container {
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
  width: 460px;
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

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.loading-state {
  padding: 20px 0;
}

.empty-state {
  padding: 40px 0;
}

.appeal-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.appeal-card {
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}

.appeal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.appeal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.appeal-body {
  font-size: 14px;
  color: #606266;
}

.appeal-reason {
  margin: 0 0 8px 0;
  line-height: 1.6;
}

.appeal-meta {
  font-size: 13px;
  color: #909399;
}

.appeal-reply {
  margin-top: 10px;
  padding: 10px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;

  .reply-label {
    font-weight: 500;
    color: #303133;
  }
}
</style>
