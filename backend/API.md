# 考勤签到系统 API 文档

**基础地址**: `http://localhost:3000/api`

**认证方式**: Bearer Token（在请求头中添加 `Authorization: Bearer <token>`）

---

## 目录

1. [认证模块](#1-认证模块)
2. [用户管理模块](#2-用户管理模块)
3. [考勤活动模块](#3-考勤活动模块)
4. [打卡记录模块](#4-打卡记录模块)
5. [申诉/请假模块](#5-申诉请假模块)
6. [统计报表模块](#6-统计报表模块)

---

## 1. 认证模块

### 1.1 用户登录

```
POST /api/auth/login
```

**请求体**:

| 参数     | 类型   | 必填 | 说明   |
| -------- | ------ | ---- | ------ |
| username | string | 是   | 用户名 |
| password | string | 是   | 密码   |

**响应示例**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "student_id": null,
    "name": "管理员",
    "status": 1
  }
}
```

**错误响应**:

| 状态码 | 说明             |
| ------ | ---------------- |
| 401    | 用户名或密码错误 |

---

### 1.2 学生注册

```
POST /api/auth/register
```

**请求体**:

| 参数       | 类型   | 必填 | 说明     |
| ---------- | ------ | ---- | -------- |
| username   | string | 是   | 登录账号 |
| student_id | string | 是   | 学号     |
| name       | string | 是   | 姓名     |

> 默认密码为 `123456`

**响应示例**:

```json
{
  "message": "User registered successfully"
}
```

**错误响应**:

| 状态码 | 说明                       |
| ------ | -------------------------- |
| 400    | 用户名已存在 或 学号已存在 |

---

### 1.3 修改密码

```
POST /api/auth/change-password
```

**权限**: 登录用户

**请求体**:

| 参数        | 类型   | 必填 | 说明              |
| ----------- | ------ | ---- | ----------------- |
| oldPassword | string | 是   | 原密码            |
| newPassword | string | 是   | 新密码（至少6位） |

**响应示例**:

```json
{
  "message": "Password changed successfully"
}
```

**错误响应**:

| 状态码 | 说明                         |
| ------ | ---------------------------- |
| 400    | 原密码错误 或 新密码长度不足 |
| 404    | 用户不存在                   |

---

## 2. 用户管理模块

### 2.1 获取所有学生列表

```
GET /api/users/students
```

**权限**: 教师、管理员

**响应示例**:

```json
[
  {
    "id": 3,
    "username": "student",
    "student_id": "20230001",
    "name": "张三",
    "status": 1
  }
]
```

---

### 2.2 获取所有教师列表

```
GET /api/users/teachers
```

**权限**: 管理员

**响应示例**:

```json
[
  {
    "id": 2,
    "username": "staff",
    "name": "教职工"
  }
]
```

---

### 2.3 获取单个用户信息

```
GET /api/users/:id
```

**权限**: 登录用户

**路径参数**:

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | number | 用户ID |

**响应示例**:

```json
{
  "id": 3,
  "username": "student",
  "student_id": "20230001",
  "name": "张三",
  "status": 1
}
```

**错误响应**:

| 状态码 | 说明       |
| ------ | ---------- |
| 404    | 用户不存在 |

---

### 2.4 添加学生

```
POST /api/users/students
```

**权限**: 教师、管理员

**请求体**:

| 参数       | 类型   | 必填 | 说明     |
| ---------- | ------ | ---- | -------- |
| username   | string | 是   | 登录账号 |
| student_id | string | 是   | 学号     |
| name       | string | 是   | 姓名     |

> 默认密码为 `123456`

**响应示例**:

```json
{
  "message": "Student added successfully"
}
```

**错误响应**:

| 状态码 | 说明                       |
| ------ | -------------------------- |
| 400    | 用户名已存在 或 学号已存在 |

---

### 2.5 添加教师

```
POST /api/users/teachers
```

**权限**: 管理员

**请求体**:

| 参数     | 类型   | 必填 | 说明     |
| -------- | ------ | ---- | -------- |
| username | string | 是   | 登录账号 |
| name     | string | 是   | 姓名     |

> 默认密码为 `123456`

**响应示例**:

```json
{
  "message": "Teacher added successfully"
}
```

**错误响应**:

| 状态码 | 说明         |
| ------ | ------------ |
| 400    | 用户名已存在 |

---

### 2.6 更新学生信息

```
PUT /api/users/students/:id
```

**权限**: 教师、管理员

**路径参数**:

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | number | 学生ID |

**请求体**:

| 参数       | 类型   | 必填 | 说明                               |
| ---------- | ------ | ---- | ---------------------------------- |
| student_id | string | 否   | 新学号                             |
| name       | string | 否   | 新姓名                             |
| status     | string | 否   | 状态（`"active"` 或 `"inactive"`） |

**响应示例**:

```json
{
  "message": "Student updated successfully"
}
```

**错误响应**:

| 状态码 | 说明       |
| ------ | ---------- |
| 400    | 学号已存在 |
| 404    | 学生不存在 |

---

### 2.7 更新教师信息

```
PUT /api/users/teachers/:id
```

**权限**: 管理员

**路径参数**:

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | number | 教师ID |

**请求体**:

| 参数 | 类型   | 必填 | 说明   |
| ---- | ------ | ---- | ------ |
| name | string | 是   | 新姓名 |

**响应示例**:

```json
{
  "message": "Teacher updated successfully"
}
```

**错误响应**:

| 状态码 | 说明       |
| ------ | ---------- |
| 404    | 教师不存在 |

---

### 2.8 删除学生

```
DELETE /api/users/students/:id
```

**权限**: 教师、管理员

**路径参数**:

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | number | 学生ID |

**响应示例**:

```json
{
  "message": "Student deleted successfully"
}
```

**错误响应**:

| 状态码 | 说明       |
| ------ | ---------- |
| 404    | 学生不存在 |

---

### 2.9 删除教师

```
DELETE /api/users/teachers/:id
```

**权限**: 管理员

**路径参数**:

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | number | 教师ID |

**响应示例**:

```json
{
  "message": "Teacher deleted successfully"
}
```

**错误响应**:

| 状态码 | 说明       |
| ------ | ---------- |
| 404    | 教师不存在 |

---

### 2.10 检查学号是否存在

```
POST /api/users/check-student-id
```

**权限**: 无需登录

**请求体**:

| 参数       | 类型   | 必填 | 说明 |
| ---------- | ------ | ---- | ---- |
| student_id | string | 是   | 学号 |

**响应示例**:

```json
{
  "exists": true,
  "student": {
    "id": 3,
    "name": "张三"
  }
}
```

```json
{
  "exists": false
}
```

**错误响应**:

| 状态码 | 说明       |
| ------ | ---------- |
| 400    | 学号未提供 |

---

### 2.11 更新个人信息

```
PUT /api/users/profile
```

**权限**: 登录用户

**请求体**:

| 参数  | 类型   | 必填 | 说明   |
| ----- | ------ | ---- | ------ |
| name  | string | 否   | 新姓名 |
| email | string | 否   | 邮箱   |

**响应示例**:

```json
{
  "message": "Profile updated successfully"
}
```

---

### 2.12 上传头像

```
POST /api/users/avatar
```

**权限**: 登录用户

> 当前暂未实现，返回空头像URL

**响应示例**:

```json
{
  "avatarUrl": ""
}
```

---

### 2.13 获取通知偏好

```
GET /api/users/notifications/preferences
```

**权限**: 登录用户

**响应示例**:

```json
{
  "checkinReminder": true,
  "approvalNotification": true,
  "attendanceAlert": true
}
```

---

### 2.14 更新通知偏好

```
PUT /api/users/notifications/preferences
```

**权限**: 登录用户

**请求体**:

| 参数                 | 类型    | 必填 | 说明         |
| -------------------- | ------- | ---- | ------------ |
| checkinReminder      | boolean | 否   | 签到提醒     |
| approvalNotification | boolean | 否   | 审批结果通知 |
| attendanceAlert      | boolean | 否   | 考勤异常提醒 |

**响应示例**:

```json
{
  "message": "Notification preferences updated successfully"
}
```

---

## 3. 考勤活动模块

### 3.1 创建考勤活动

```
POST /api/activities
```

**权限**: 教师、管理员

**请求体**:

| 参数                | 类型   | 必填 | 说明                         |
| ------------------- | ------ | ---- | ---------------------------- |
| title               | string | 是   | 活动标题                     |
| longitude           | number | 是   | 地理围栏中心经度             |
| latitude            | number | 是   | 地理围栏中心纬度             |
| radius              | number | 是   | 围栏半径（米）               |
| start_time          | string | 是   | 考勤开始时间（ISO 8601格式） |
| end_time            | string | 是   | 考勤结束时间（ISO 8601格式） |
| qr_refresh_interval | number | 否   | 二维码刷新间隔（秒，默认30） |

**响应示例**:

```json
{
  "message": "Attendance activity created successfully"
}
```

---

### 3.2 获取教师的所有考勤活动

```
GET /api/activities/teacher
```

**权限**: 教师、管理员

> 教师只能查看自己的活动，管理员可以查看所有活动

**响应示例**:

```json
[
  {
    "id": 1,
    "teacher_id": 2,
    "title": "第1节 数据结构",
    "longitude": 113.1234567,
    "latitude": 23.1234567,
    "radius": 100,
    "start_time": "2026-05-03T08:00:00.000Z",
    "end_time": "2026-05-03T09:40:00.000Z",
    "qr_refresh_interval": 30,
    "created_at": "2026-05-03T07:00:00.000Z"
  }
]
```

---

### 3.3 获取单个考勤活动详情

```
GET /api/activities/:id
```

**权限**: 登录用户

**路径参数**:

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | number | 活动ID |

**响应示例**:

```json
{
  "id": 1,
  "teacher_id": 2,
  "title": "第1节 数据结构",
  "longitude": 113.1234567,
  "latitude": 23.1234567,
  "radius": 100,
  "start_time": "2026-05-03T08:00:00.000Z",
  "end_time": "2026-05-03T09:40:00.000Z",
  "qr_refresh_interval": 30,
  "created_at": "2026-05-03T07:00:00.000Z"
}
```

**错误响应**:

| 状态码 | 说明       |
| ------ | ---------- |
| 404    | 活动不存在 |

---

### 3.4 更新考勤活动

```
PUT /api/activities/:id
```

**权限**: 教师、管理员

**路径参数**:

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | number | 活动ID |

**请求体**:

| 参数                | 类型   | 必填 | 说明                 |
| ------------------- | ------ | ---- | -------------------- |
| title               | string | 是   | 活动标题             |
| longitude           | number | 是   | 地理围栏中心经度     |
| latitude            | number | 是   | 地理围栏中心纬度     |
| radius              | number | 是   | 围栏半径（米）       |
| start_time          | string | 是   | 考勤开始时间         |
| end_time            | string | 是   | 考勤结束时间         |
| qr_refresh_interval | number | 否   | 二维码刷新间隔（秒） |

**响应示例**:

```json
{
  "message": "Activity updated successfully"
}
```

**错误响应**:

| 状态码 | 说明               |
| ------ | ------------------ |
| 404    | 活动不存在或无权限 |

---

### 3.5 删除考勤活动

```
DELETE /api/activities/:id
```

**权限**: 教师、管理员

**路径参数**:

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | number | 活动ID |

**响应示例**:

```json
{
  "message": "Activity deleted successfully"
}
```

**错误响应**:

| 状态码 | 说明               |
| ------ | ------------------ |
| 404    | 活动不存在或无权限 |

---

### 3.6 获取当前活跃的考勤活动

```
GET /api/activities/active/current
```

**权限**: 学生

> 返回当前时间处于有效期内的所有考勤活动

**响应示例**:

```json
[
  {
    "id": 1,
    "teacher_id": 2,
    "title": "第1节 数据结构",
    "longitude": 113.1234567,
    "latitude": 23.1234567,
    "radius": 100,
    "start_time": "2026-05-03T08:00:00.000Z",
    "end_time": "2026-05-03T09:40:00.000Z",
    "qr_refresh_interval": 30,
    "created_at": "2026-05-03T07:00:00.000Z"
  }
]
```

---

## 4. 打卡记录模块

### 4.1 学生打卡

```
POST /api/records
```

**权限**: 学生

**请求体**:

| 参数            | 类型   | 必填 | 说明                                 |
| --------------- | ------ | ---- | ------------------------------------ |
| activity_id     | number | 是   | 考勤活动ID                           |
| check_time      | string | 是   | 打卡时间（ISO 8601格式）             |
| gps_longitude   | number | 是   | 打卡时GPS经度                        |
| gps_latitude    | number | 是   | 打卡时GPS纬度                        |
| liveness_result | string | 是   | 活体检测结果（`"pass"` 或 `"fail"`） |
| device_info     | string | 否   | 设备标识                             |

**响应示例**:

```json
{
  "message": "Check-in successful",
  "status": "normal"
}
```

**错误响应**:

| 状态码 | 说明                 |
| ------ | -------------------- |
| 400    | 活动未激活 或 已打卡 |
| 404    | 活动不存在           |

---

### 4.2 获取学生的打卡记录

```
GET /api/records/student
```

**权限**: 学生

**响应示例**:

```json
[
  {
    "id": 1,
    "activity_id": 1,
    "user_id": 3,
    "check_time": "2026-05-03T08:30:00.000Z",
    "gps_longitude": 113.1234567,
    "gps_latitude": 23.1234567,
    "liveness_result": "pass",
    "final_status": "normal",
    "device_info": null,
    "created_at": "2026-05-03T08:30:00.000Z",
    "title": "第1节 数据结构"
  }
]
```

---

### 4.3 获取活动的打卡记录

```
GET /api/records/activity/:id
```

**权限**: 教师、管理员

**路径参数**:

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | number | 活动ID |

**响应示例**:

```json
[
  {
    "id": 1,
    "activity_id": 1,
    "user_id": 3,
    "check_time": "2026-05-03T08:30:00.000Z",
    "gps_longitude": 113.1234567,
    "gps_latitude": 23.1234567,
    "liveness_result": "pass",
    "final_status": "normal",
    "device_info": null,
    "created_at": "2026-05-03T08:30:00.000Z",
    "student_id": "20230001",
    "name": "张三"
  }
]
```

---

## 5. 申诉/请假模块

### 5.1 提交申诉/请假

```
POST /api/appeals
```

**权限**: 学生

**请求体**:

| 参数        | 类型   | 必填 | 说明                                     |
| ----------- | ------ | ---- | ---------------------------------------- |
| activity_id | number | 是   | 考勤活动ID                               |
| type        | string | 是   | 类型（`"appeal"` 申诉 / `"leave"` 请假） |
| reason      | string | 是   | 申请理由                                 |

**响应示例**:

```json
{
  "message": "Application submitted successfully"
}
```

**错误响应**:

| 状态码 | 说明                   |
| ------ | ---------------------- |
| 400    | 已提交过相同类型的申请 |
| 404    | 活动不存在             |

---

### 5.2 获取学生的申诉/请假记录

```
GET /api/appeals/student
```

**权限**: 学生

**响应示例**:

```json
[
  {
    "id": 1,
    "user_id": 3,
    "activity_id": 1,
    "type": "leave",
    "reason": "身体不适",
    "status": "pending",
    "admin_comment": null,
    "created_at": "2026-05-03T08:00:00.000Z",
    "updated_at": "2026-05-03T08:00:00.000Z",
    "title": "第1节 数据结构"
  }
]
```

---

### 5.3 获取所有待审核的申诉/请假

```
GET /api/appeals/pending
```

**权限**: 教师、管理员

**响应示例**:

```json
[
  {
    "id": 1,
    "user_id": 3,
    "activity_id": 1,
    "type": "leave",
    "reason": "身体不适",
    "status": "pending",
    "admin_comment": null,
    "created_at": "2026-05-03T08:00:00.000Z",
    "updated_at": "2026-05-03T08:00:00.000Z",
    "title": "第1节 数据结构",
    "student_id": "20230001",
    "name": "张三"
  }
]
```

---

### 5.4 审核申诉/请假

```
PUT /api/appeals/:id
```

**权限**: 教师、管理员

**路径参数**:

| 参数 | 类型   | 说明        |
| ---- | ------ | ----------- |
| id   | number | 申诉/请假ID |

**请求体**:

| 参数          | 类型   | 必填 | 说明                                              |
| ------------- | ------ | ---- | ------------------------------------------------- |
| status        | string | 是   | 审核结果（`"approved"` 通过 / `"rejected"` 驳回） |
| admin_comment | string | 否   | 管理员回复                                        |

**响应示例**:

```json
{
  "message": "Appeal reviewed successfully"
}
```

**错误响应**:

| 状态码 | 说明            |
| ------ | --------------- |
| 404    | 申诉/请假不存在 |

### 4.4 获取所有考勤记录（管理员端，支持分页和筛选）

```
GET /api/records
```

**权限**: 教师、管理员

**查询参数**:

| 参数        | 类型   | 必填 | 说明                                                                    |
| ----------- | ------ | ---- | ----------------------------------------------------------------------- |
| page        | number | 否   | 页码（默认1）                                                           |
| pageSize    | number | 否   | 每页条数（默认10）                                                      |
| status      | string | 否   | 状态筛选（`"all"` / `"normal"` / `"late"` / `"absent"` / `"abnormal"`） |
| startDate   | string | 否   | 开始日期                                                                |
| endDate     | string | 否   | 结束日期                                                                |
| studentName | string | 否   | 学生姓名（模糊搜索）                                                    |
| studentId   | string | 否   | 学号（模糊搜索）                                                        |

**响应示例**:

```json
{
  "records": [
    {
      "id": 1,
      "studentId": "20230001",
      "studentName": "张三",
      "className": "",
      "courseName": "",
      "date": "2026-05-03",
      "checkinTime": "2026-05-03 08:30:00",
      "status": "normal",
      "location": "113.1234567, 23.1234567",
      "teacher": "",
      "remark": ""
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 10
}
```

---

### 4.5 修改考勤状态（管理员端）

```
POST /api/records/modify
```

**权限**: 教师、管理员

**请求体**:

| 参数      | 类型   | 必填 | 说明                                                     |
| --------- | ------ | ---- | -------------------------------------------------------- |
| recordId  | number | 是   | 记录ID                                                   |
| newStatus | string | 是   | 新状态（`"normal"` / `"late"` / `"absent"` / `"leave"`） |
| reason    | string | 是   | 修改原因                                                 |

**响应示例**:

```json
{
  "message": "Attendance status modified successfully"
}
```

---

### 4.6 导出考勤数据（管理员端）

```
POST /api/records/export
```

**权限**: 教师、管理员

> 当前暂未完整实现，返回空URL

**响应示例**:

```json
{
  "url": ""
}
```

---

## 6. 统计报表模块

### 6.1 获取看板数据

```
GET /api/statistics/dashboard
```

**权限**: 教师、管理员

**响应示例**:

```json
{
  "todayLateCount": 0,
  "todayAbsentCount": 0,
  "weekAbnormalCount": 0,
  "monthAbnormalCount": 0,
  "recentAbnormalRecords": [],
  "topLateStudents": [],
  "topAbsentStudents": []
}
```

---

### 6.2 获取学生考勤统计

```
GET /api/statistics/students
```

**权限**: 教师、管理员

**查询参数**:

| 参数      | 类型   | 必填 | 说明     |
| --------- | ------ | ---- | -------- |
| startDate | string | 否   | 开始日期 |
| endDate   | string | 否   | 结束日期 |
| className | string | 否   | 班级名称 |

**响应示例**:

```json
[
  {
    "studentId": "20230001",
    "studentName": "张三",
    "className": "",
    "totalCourses": 10,
    "lateCount": 1,
    "absentCount": 0,
    "leaveCount": 1,
    "lateRate": 10,
    "absentRate": 0,
    "totalAbnormalRate": 10
  }
]
```

---

### 6.3 获取班级考勤统计

```
GET /api/statistics/classes
```

**权限**: 教师、管理员

> 由于数据库暂无班级表，当前返回模拟数据

**响应示例**:

```json
[
  {
    "className": "计算机科学1班",
    "totalStudents": 30,
    "averageLateRate": 5,
    "averageAbsentRate": 2,
    "totalLateCount": 15,
    "totalAbsentCount": 6,
    "totalLeaveCount": 8
  }
]
```

---

### 6.4 获取日期趋势数据

```
GET /api/statistics/trend
```

**权限**: 教师、管理员

> 返回最近7天的异常考勤趋势数据

**响应示例**:

```json
[
  {
    "date": "2026-04-27",
    "lateCount": 0,
    "absentCount": 0,
    "leaveCount": 0,
    "totalAbnormalCount": 0
  }
]
```

---

### 6.5 获取迟到时长分布

```
GET /api/statistics/late-duration
```

**权限**: 教师、管理员

> 当前返回模拟数据

**响应示例**:

```json
[
  { "durationRange": "0-5分钟", "count": 12 },
  { "durationRange": "5-15分钟", "count": 8 },
  { "durationRange": "15-30分钟", "count": 5 },
  { "durationRange": "30分钟以上", "count": 3 }
]
```

---

## 附录

### 通用错误响应格式

```json
{
  "error": "错误描述信息"
}
```

### 通用状态码说明

| 状态码 | 说明                   |
| ------ | ---------------------- |
| 200    | 请求成功               |
| 201    | 创建成功               |
| 400    | 请求参数错误           |
| 401    | 未提供token或token无效 |
| 403    | 权限不足               |
| 404    | 资源不存在             |
| 500    | 服务器内部错误         |

### 用户角色说明

| 角色    | 说明                                  |
| ------- | ------------------------------------- |
| admin   | 管理员 - 拥有所有权限                 |
| teacher | 教师 - 可管理考勤活动、学生、审核申诉 |
| student | 学生 - 可打卡、提交申诉/请假          |
