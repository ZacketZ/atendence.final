<template>
  <div class="student-management">
    <div class="header">
      <h1>学生管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleAddStudent">
          <el-icon><Plus /></el-icon> 添加学生
        </el-button>
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon> 批量导入
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon> 导出数据
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="学号">
              <el-input
                v-model="searchForm.studentId"
                placeholder="请输入学号"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="姓名">
              <el-input
                v-model="searchForm.name"
                placeholder="请输入姓名"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="班级">
              <el-input
                v-model="searchForm.class"
                placeholder="请输入班级"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="专业">
              <el-input
                v-model="searchForm.major"
                placeholder="请输入专业"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="入学年份">
              <el-input
                v-model="searchForm.enrollmentYear"
                placeholder="请输入入学年份"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="请选择状态"
                clearable
              >
                <el-option label="在校" value="enrolled" />
                <el-option label="休学" value="suspended" />
                <el-option label="毕业" value="graduated" />
                <el-option label="退学" value="withdrawn" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" class="search-actions">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon> 搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon> 重置
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        :data="studentList"
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="class" label="班级" width="150" />
        <el-table-column prop="major" label="专业" width="180" />
        <el-table-column prop="enrollmentYear" label="入学年份" width="100" />
        <el-table-column prop="phone" label="联系方式" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="accountEnabled" label="账号状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.accountEnabled"
              @change="handleToggleAccount(row)"
              :active-value="true"
              :inactive-value="false"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
              :icon="Edit"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
              :icon="Delete"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="学号" prop="studentId">
          <el-input
            v-model="formData.studentId"
            placeholder="请输入学号"
            :disabled="isEditMode"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="班级" prop="class">
          <el-input v-model="formData.class" placeholder="请输入班级" />
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="formData.major" placeholder="请输入专业" />
        </el-form-item>
        <el-form-item label="入学年份" prop="enrollmentYear">
          <el-input
            v-model.number="formData.enrollmentYear"
            placeholder="请输入入学年份"
          />
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系方式" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="在校" value="enrolled" />
            <el-option label="休学" value="suspended" />
            <el-option label="毕业" value="graduated" />
            <el-option label="退学" value="withdrawn" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号启用" prop="accountEnabled">
          <el-switch
            v-model="formData.accountEnabled"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <ImportDialog
      v-model="importDialogVisible"
      type="student"
      @success="handleImportSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import {
  Plus,
  Upload,
  Download,
  Search,
  Refresh,
  Edit,
  Delete,
} from "@element-plus/icons-vue";
import ImportDialog from "@/components/business/ImportDialog.vue";

// 导入逻辑
import {
  // 数据
  loading,
  studentList,
  selectedRows,
  dialogVisible,
  importDialogVisible,
  isEditMode,
  formRef,

  // 搜索表单
  searchForm,

  // 分页
  pagination,

  // 表单数据
  formData,

  // 表单验证规则
  formRules,

  // 计算属性
  dialogTitle,

  // 方法
  fetchStudents,
  handleSearch,
  handleReset,
  handleAddStudent,
  handleEdit,
  handleDelete,
  handleSubmit,
  handleDialogClose,
  handleImport,
  handleExport,
  handleImportSuccess,
  handleToggleAccount,
  handleSelectionChange,
  handleSizeChange,
  handleCurrentChange,

  // 辅助函数
  getStatusLabel,
  getStatusTagType,
} from "./studentLogic";

// 生命周期
onMounted(() => {
  fetchStudents();
});
</script>

<style scoped>
.student-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-card {
  margin-bottom: 20px;
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 32px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
