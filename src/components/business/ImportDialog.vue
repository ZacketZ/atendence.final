<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    @close="handleClose"
  >
    <div class="import-dialog">
      <!-- 步骤1：下载模板 -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="step-description">
          <h3>第一步：下载导入模板</h3>
          <p>请先下载Excel模板文件，按照模板格式填写数据后上传。</p>
        </div>

        <div class="template-info">
          <el-alert type="info" :closable="false">
            <template #title>
              <strong>模板说明：</strong>
            </template>
            <div class="alert-content">
              <p>1. 请严格按照模板格式填写数据</p>
              <p>2. 必填字段不能为空</p>
              <p>3. 日期格式：YYYY-MM-DD</p>
              <p>4. 状态字段请使用预设值</p>
            </div>
          </el-alert>
        </div>

        <div class="template-preview">
          <h4>模板字段说明：</h4>
          <el-table :data="templateFields" size="small" border>
            <el-table-column prop="field" label="字段名" width="120" />
            <el-table-column prop="description" label="说明" />
            <el-table-column prop="required" label="必填" width="60">
              <template #default="{ row }">
                <el-tag v-if="row.required" type="danger" size="small"
                  >是</el-tag
                >
                <el-tag v-else type="info" size="small">否</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="example" label="示例" width="120" />
          </el-table>
        </div>

        <div class="step-actions">
          <el-button type="primary" @click="downloadTemplate">
            <el-icon><Download /></el-icon> 下载模板
          </el-button>
          <el-button @click="nextStep"> 下一步 </el-button>
        </div>
      </div>

      <!-- 步骤2：上传文件 -->
      <div v-else-if="currentStep === 2" class="step-content">
        <div class="step-description">
          <h3>第二步：上传Excel文件</h3>
          <p>请选择已填写好的Excel文件进行上传。</p>
        </div>

        <el-upload
          ref="uploadRef"
          class="upload-area"
          drag
          :action="uploadUrl"
          :headers="uploadHeaders"
          :data="uploadData"
          :before-upload="beforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :show-file-list="false"
          accept=".xlsx,.xls,.csv"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">
              支持 .xlsx, .xls, .csv 格式，文件大小不超过10MB
            </div>
          </template>
        </el-upload>

        <div v-if="uploadedFile" class="uploaded-file">
          <el-alert type="success" :closable="false">
            <template #title> 已上传文件：{{ uploadedFile.name }} </template>
          </el-alert>
        </div>

        <div class="step-actions">
          <el-button @click="prevStep"> 上一步 </el-button>
          <el-button
            type="primary"
            @click="handleImport"
            :disabled="!uploadedFile"
            :loading="importing"
          >
            <el-icon><Upload /></el-icon> 开始导入
          </el-button>
        </div>
      </div>

      <!-- 步骤3：导入结果 -->
      <div v-else-if="currentStep === 3" class="step-content">
        <div class="step-description">
          <h3>第三步：导入结果</h3>
          <p>数据导入已完成，请查看导入结果。</p>
        </div>

        <div class="import-result">
          <el-alert
            :type="
              importResult.success === importResult.total
                ? 'success'
                : 'warning'
            "
            :closable="false"
          >
            <template #title>
              <strong>导入完成</strong>
            </template>
            <div class="result-stats">
              <p>总计：{{ importResult.total }} 条</p>
              <p>
                成功：<span class="success-count">{{
                  importResult.success
                }}</span>
                条
              </p>
              <p>
                失败：<span class="error-count">{{ importResult.failed }}</span>
                条
              </p>
            </div>
          </el-alert>

          <div v-if="importResult.errors.length > 0" class="error-details">
            <h4>错误详情：</h4>
            <el-table :data="importResult.errors" size="small" border>
              <el-table-column prop="row" label="行号" width="80" />
              <el-table-column prop="field" label="字段" width="120" />
              <el-table-column prop="message" label="错误信息" />
            </el-table>
          </div>
        </div>

        <div class="step-actions">
          <el-button @click="resetAndClose"> 关闭 </el-button>
          <el-button
            v-if="importResult.failed > 0"
            type="primary"
            @click="downloadErrorReport"
          >
            <el-icon><Download /></el-icon> 下载错误报告
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage, type UploadInstance } from "element-plus";
import { UploadFilled, Upload, Download } from "@element-plus/icons-vue";
import { downloadImportTemplate } from "@/api/management";
import type { BatchImportResult } from "@/types/management";

interface Props {
  modelValue: boolean;
  type: "faculty" | "student";
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  type: "faculty",
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

// 数据
const dialogVisible = ref(props.modelValue);
const currentStep = ref(1);
const uploadedFile = ref<File | null>(null);
const importing = ref(false);
const importResult = ref<BatchImportResult>({
  total: 0,
  success: 0,
  failed: 0,
  errors: [],
});
const uploadRef = ref<UploadInstance>();

// 计算属性
const dialogTitle = computed(() => {
  const typeMap = {
    faculty: "教职工",
    student: "学生",
  };
  return `${typeMap[props.type]}批量导入`;
});

const templateFields = computed(() => {
  if (props.type === "faculty") {
    return [
      {
        field: "工号",
        description: "教职工工号，唯一标识",
        required: true,
        example: "T001",
      },
      {
        field: "姓名",
        description: "教职工姓名",
        required: true,
        example: "张老师",
      },
      {
        field: "部门",
        description: "所属部门",
        required: true,
        example: "计算机学院",
      },
      { field: "职位", description: "职位", required: true, example: "教授" },
      {
        field: "联系方式",
        description: "手机号码",
        required: true,
        example: "13800138001",
      },
      {
        field: "邮箱",
        description: "电子邮箱",
        required: true,
        example: "zhang@example.com",
      },
      {
        field: "角色",
        description: "teacher/counselor/department_admin/system_admin",
        required: true,
        example: "teacher",
      },
      {
        field: "考勤权限",
        description:
          "none/view_own_class/view_all_classes/modify_own_class/modify_all_classes",
        required: true,
        example: "view_own_class",
      },
      {
        field: "状态",
        description: "active/leave/external/resigned",
        required: true,
        example: "active",
      },
    ];
  } else {
    return [
      {
        field: "学号",
        description: "学生学号，唯一标识",
        required: true,
        example: "20230001",
      },
      {
        field: "姓名",
        description: "学生姓名",
        required: true,
        example: "张三",
      },
      {
        field: "班级",
        description: "所属班级",
        required: true,
        example: "计算机科学与技术1班",
      },
      {
        field: "专业",
        description: "所学专业",
        required: true,
        example: "计算机科学与技术",
      },
      {
        field: "入学年份",
        description: "入学年份",
        required: true,
        example: "2023",
      },
      {
        field: "联系方式",
        description: "手机号码",
        required: true,
        example: "13800138009",
      },
      {
        field: "邮箱",
        description: "电子邮箱",
        required: true,
        example: "zhangsan@example.com",
      },
      {
        field: "状态",
        description: "enrolled/suspended/graduated/withdrawn",
        required: true,
        example: "enrolled",
      },
    ];
  }
});

// 上传配置
const uploadUrl = computed(() => {
  return `/api/${props.type}/import`;
});

const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  };
});

const uploadData = computed(() => {
  return {
    type: props.type,
  };
});

// 方法
const downloadTemplate = async () => {
  try {
    const blob = await downloadImportTemplate(props.type);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${props.type}_import_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    ElMessage.success("模板下载成功");
  } catch (error) {
    console.error("下载模板失败:", error);
    ElMessage.error("下载模板失败");
  }
};

const nextStep = () => {
  currentStep.value++;
};

const prevStep = () => {
  currentStep.value--;
};

const beforeUpload = (file: File) => {
  // 检查文件类型
  const allowedTypes = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ];
  const isExcel =
    allowedTypes.includes(file.type) ||
    file.name.endsWith(".xlsx") ||
    file.name.endsWith(".xls") ||
    file.name.endsWith(".csv");

  if (!isExcel) {
    ElMessage.error("只能上传Excel或CSV文件");
    return false;
  }

  // 检查文件大小（10MB）
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    ElMessage.error("文件大小不能超过10MB");
    return false;
  }

  uploadedFile.value = file;
  return false; // 手动上传
};

const handleUploadSuccess = (response: any) => {
  if (response.code === 200) {
    ElMessage.success("文件上传成功");
  } else {
    ElMessage.error(response.message || "文件上传失败");
  }
};

const handleUploadError = (error: Error) => {
  console.error("上传失败:", error);
  ElMessage.error("文件上传失败");
};

const handleImport = async () => {
  if (!uploadedFile.value) {
    ElMessage.warning("请先上传文件");
    return;
  }

  importing.value = true;
  try {
    // 模拟导入过程
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 模拟导入结果
    importResult.value = {
      total: 15,
      success: 13,
      failed: 2,
      errors: [
        { row: 3, field: "工号", message: "工号已存在" },
        { row: 7, field: "邮箱", message: "邮箱格式不正确" },
      ],
    };

    currentStep.value = 3;
    ElMessage.success("数据导入完成");
  } catch (error) {
    console.error("导入失败:", error);
    ElMessage.error("数据导入失败");
  } finally {
    importing.value = false;
  }
};

const downloadErrorReport = () => {
  // 生成错误报告
  const errorContent = importResult.value.errors
    .map((error) => `第${error.row}行，字段"${error.field}"：${error.message}`)
    .join("\n");

  const blob = new Blob([errorContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${props.type}_import_errors.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  ElMessage.success("错误报告下载成功");
};

const resetAndClose = () => {
  // 重置状态
  currentStep.value = 1;
  uploadedFile.value = null;
  importResult.value = {
    total: 0,
    success: 0,
    failed: 0,
    errors: [],
  };

  // 关闭对话框
  dialogVisible.value = false;

  // 触发成功事件
  if (importResult.value.success > 0) {
    emit("success");
  }
};

const handleClose = () => {
  resetAndClose();
};

// 监听props变化
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});
</script>

<style scoped>
.import-dialog {
  padding: 10px 0;
}

.step-content {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.step-description {
  margin-bottom: 20px;
}

.step-description h3 {
  margin: 0 0 10px 0;
  color: #303133;
}

.step-description p {
  margin: 0;
  color: #606266;
}

.template-info {
  margin-bottom: 20px;
}

.alert-content {
  font-size: 14px;
  line-height: 1.6;
}

.alert-content p {
  margin: 5px 0;
}

.template-preview {
  margin-bottom: 20px;
}

.template-preview h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
}

.upload-area {
  margin: 20px 0;
}

.uploaded-file {
  margin: 20px 0;
}

.import-result {
  flex: 1;
}

.result-stats {
  margin: 10px 0;
}

.result-stats p {
  margin: 5px 0;
  font-size: 14px;
}

.success-count {
  color: #67c23a;
  font-weight: bold;
}

.error-count {
  color: #f56c6c;
  font-weight: bold;
}

.error-details {
  margin-top: 20px;
}

.error-details h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
}

.step-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
