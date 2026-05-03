# 学生移动考勤系统

## 项目介绍

学生移动考勤系统是一个基于Node.js和MySQL开发的后端服务，为学生和教师提供考勤管理功能。系统支持学生通过移动端进行打卡，教师通过Web端管理考勤活动和学生信息。

## 主要功能

### 学生端（移动端）
- 学号和密码登录（默认密码123456）
- 扫码打卡（支持二维码过期检测）
- GPS定位验证（地理围栏检查）
- 人脸活体检测结果提交
- 查看个人打卡记录
- 提交申诉/请假申请
- 修改密码

### 教师端（Web端）
- 发布考勤任务（设置地点、时间段、二维码刷新频率）
- 实时监控签到情况
- 管理学生信息（添加、修改、删除）
- 审核申诉/请假申请
- 查看统计报表
- 修改密码

## 技术栈

- **后端框架**：Express.js
- **数据库**：MySQL
- **认证**：JWT (JSON Web Token)
- **密码加密**：bcrypt
- **跨域处理**：cors
- **环境变量**：dotenv

## 项目结构

```
attendance_system/
├── app.js                # 主入口文件
├── .env                  # 环境变量配置
├── config/
│   └── db.js             # 数据库连接配置
├── middleware/
│   └── auth.js           # JWT认证和角色验证中间件
├── routes/
│   ├── activities.js     # 考勤活动路由
│   ├── appeals.js        # 申诉/请假路由
│   ├── auth.js           # 认证路由（登录、注册、修改密码）
│   ├── records.js        # 考勤记录路由
│   └── users.js          # 用户管理路由
├── services/
│   ├── ActivityService.js  # 考勤活动服务
│   ├── AppealService.js     # 申诉/请假服务
│   ├── AuthService.js       # 认证服务
│   ├── RecordService.js     # 考勤记录服务
│   └── UserService.js       # 用户管理服务
├── init.js               # 初始化脚本（创建管理员账号）
├── package.json          # 项目配置和依赖
├── README.md             # 项目说明文档
├── readme1.md            # Apifox测试指南
└── node_modules/         # 依赖包
```

## 安装和运行

### 前提条件

- Node.js 14+ 
- MySQL 5.7+

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd attendance_system
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   复制 `.env.example` 文件为 `.env`，并修改数据库连接信息：
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=123456
   DB_NAME=attendance_system
   
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   
   PORT=3000
   ```

4. **创建数据库**
   运行以下SQL语句创建数据库和表：
   ```sql
   -- 创建数据库（如果不存在）
   CREATE DATABASE IF NOT EXISTS attendance_system
   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   
   USE attendance_system;
   
   -- 1. 用户表（学生/教师）
   CREATE TABLE `users` (
       `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
       `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '登录账号',
       `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
       `role` ENUM('student', 'teacher') NOT NULL COMMENT '角色：学生/教师',
       `student_id` VARCHAR(20) UNIQUE NULL COMMENT '学号（学生必填，教师可空）',
       `name` VARCHAR(50) NOT NULL COMMENT '姓名',
       `face_hash` VARCHAR(255) NULL COMMENT '人脸特征哈希（用于比对）',
       `status` TINYINT(1) DEFAULT 1 COMMENT '账户状态（1=active, 0=disabled）',
       `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
       INDEX idx_student_id (`student_id`),
       INDEX idx_role (`role`)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
   
   -- 2. 考勤活动表（教师发布）
   CREATE TABLE `attendance_activities` (
       `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '活动ID',
       `teacher_id` INT NOT NULL COMMENT '创建活动的教师ID',
       `title` VARCHAR(100) NOT NULL COMMENT '活动标题',
       `longitude` DECIMAL(10,7) NOT NULL COMMENT '地理围栏中心经度',
       `latitude` DECIMAL(10,7) NOT NULL COMMENT '地理围栏中心纬度',
       `radius` INT NOT NULL COMMENT '围栏半径（米）',
       `start_time` DATETIME NOT NULL COMMENT '考勤开始时间',
       `end_time` DATETIME NOT NULL COMMENT '考勤结束时间',
       `qr_refresh_interval` INT DEFAULT 30 COMMENT '二维码刷新间隔（秒）',
       `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
       FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
       INDEX idx_teacher (`teacher_id`),
       INDEX idx_time_range (`start_time`, `end_time`)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='考勤活动表';
   
   -- 3. 考勤记录表（学生打卡详情）
   CREATE TABLE `attendance_records` (
       `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
       `activity_id` INT NOT NULL COMMENT '考勤活动ID',
       `user_id` INT NOT NULL COMMENT '学生用户ID',
       `check_time` DATETIME NOT NULL COMMENT '打卡时间',
       `gps_longitude` DECIMAL(10,7) NOT NULL COMMENT '打卡时GPS经度',
       `gps_latitude` DECIMAL(10,7) NOT NULL COMMENT '打卡时GPS纬度',
       `liveness_result` ENUM('pass', 'fail') NOT NULL COMMENT '活体检测结果',
       `final_status` ENUM('normal', 'abnormal') NOT NULL COMMENT '最终状态：正常/异常',
       `device_info` VARCHAR(100) NULL COMMENT '设备标识（IMEI/MAC等）',
       `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
       FOREIGN KEY (`activity_id`) REFERENCES `attendance_activities`(`id`) ON DELETE CASCADE,
       FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
       INDEX idx_activity (`activity_id`),
       INDEX idx_user (`user_id`),
       INDEX idx_check_time (`check_time`)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='考勤记录表';
   
   -- 4. 申诉/请假表
   CREATE TABLE `appeals` (
       `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '申请ID',
       `user_id` INT NOT NULL COMMENT '学生ID',
       `activity_id` INT NOT NULL COMMENT '考勤活动ID',
       `type` ENUM('appeal', 'leave') NOT NULL COMMENT '类型：申诉/请假',
       `reason` TEXT NOT NULL COMMENT '申请理由',
       `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '审核状态',
       `admin_comment` TEXT NULL COMMENT '管理员回复',
       `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
       `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
       FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
       FOREIGN KEY (`activity_id`) REFERENCES `attendance_activities`(`id`) ON DELETE CASCADE,
       INDEX idx_user_activity (`user_id`, `activity_id`),
       INDEX idx_status (`status`)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='申诉/请假表';
   ```

5. **创建默认管理员账号**
   ```bash
   node init.js
   ```

6. **启动服务器**
   ```bash
   node app.js
   ```

   服务器将在 `http://localhost:3000` 上运行。

## 默认账号

- **管理员账号**：admin
- **密码**：123456

## API接口文档

### 认证接口

#### 1. 用户登录
- **URL**：`/api/auth/login`
- **方法**：POST
- **请求体**：
  ```json
  {
    "username": "admin",
    "password": "123456"
  }
  ```
- **响应**：
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "teacher",
      "student_id": null,
      "name": "管理员",
      "status": 1
    }
  }
  ```

#### 2. 学生注册
- **URL**：`/api/auth/register`
- **方法**：POST
- **请求体**：
  ```json
  {
    "username": "student1",
    "student_id": "20210001",
    "name": "张三"
  }
  ```
- **响应**：
  ```json
  {
    "message": "User registered successfully"
  }
  ```

#### 3. 修改密码
- **URL**：`/api/auth/change-password`
- **方法**：POST
- **请求头**：`Authorization: Bearer <token>`
- **请求体**：
  ```json
  {
    "oldPassword": "123456",
    "newPassword": "newpassword123"
  }
  ```
- **响应**：
  ```json
  {
    "message": "Password changed successfully"
  }
  ```

### 用户管理接口

#### 1. 获取所有学生信息（教师权限）
- **URL**：`/api/users/students`
- **方法**：GET
- **请求头**：`Authorization: Bearer <token>`
- **响应**：
  ```json
  [
    {
      "id": 2,
      "username": "student1",
      "student_id": "20210001",
      "name": "张三",
      "status": 1
    }
  ]
  ```

#### 2. 添加学生（教师权限）
- **URL**：`/api/users/students`
- **方法**：POST
- **请求头**：`Authorization: Bearer <token>`
- **请求体**：
  ```json
  {
    "username": "student2",
    "student_id": "20210002",
    "name": "李四"
  }
  ```
- **响应**：
  ```json
  {
    "message": "Student added successfully"
  }
  ```

#### 3. 检查学号是否存在
- **URL**：`/api/users/check-student-id`
- **方法**：POST
- **请求体**：
  ```json
  {
    "student_id": "20210001"
  }
  ```
- **响应**：
  ```json
  {
    "exists": true,
    "student": {
      "id": 2,
      "name": "张三"
    }
  }
  ```

### 考勤活动接口

#### 1. 创建考勤活动（教师权限）
- **URL**：`/api/activities`
- **方法**：POST
- **请求头**：`Authorization: Bearer <token>`
- **请求体**：
  ```json
  {
    "title": "数学课堂考勤",
    "longitude": 116.397428,
    "latitude": 39.90923,
    "radius": 50,
    "start_time": "2026-04-11T08:00:00",
    "end_time": "2026-04-11T10:00:00",
    "qr_refresh_interval": 30
  }
  ```
- **响应**：
  ```json
  {
    "message": "Attendance activity created successfully"
  }
  ```

#### 2. 获取当前活跃的考勤活动（学生端）
- **URL**：`/api/activities/active/current`
- **方法**：GET
- **请求头**：`Authorization: Bearer <token>`
- **响应**：
  ```json
  [
    {
      "id": 1,
      "teacher_id": 1,
      "title": "数学课堂考勤",
      "longitude": 116.397428,
      "latitude": 39.90923,
      "radius": 50,
      "start_time": "2026-04-11T08:00:00",
      "end_time": "2026-04-11T10:00:00",
      "qr_refresh_interval": 30,
      "created_at": "2026-04-11T07:00:00"
    }
  ]
  ```

### 考勤记录接口

#### 1. 学生打卡
- **URL**：`/api/records`
- **方法**：POST
- **请求头**：`Authorization: Bearer <token>`
- **请求体**：
  ```json
  {
    "activity_id": 1,
    "check_time": "2026-04-11T08:30:00",
    "gps_longitude": 116.397428,
    "gps_latitude": 39.90923,
    "liveness_result": "pass",
    "device_info": "IMEI1234567890"
  }
  ```
- **响应**：
  ```json
  {
    "message": "Check-in successful",
    "status": "normal"
  }
  ```

### 申诉/请假接口

#### 1. 学生提交申诉/请假
- **URL**：`/api/appeals`
- **方法**：POST
- **请求头**：`Authorization: Bearer <token>`
- **请求体**：
  ```json
  {
    "activity_id": 1,
    "type": "leave",
    "reason": "生病请假"
  }
  ```
- **响应**：
  ```json
  {
    "message": "Application submitted successfully"
  }
  ```

## Apifox测试指南

### 1. 准备工作

1. 下载并安装 [Apifox](https://www.apifox.cn/download)
2. 启动后端服务器：`node app.js`
3. 确保服务器运行在 `http://localhost:3000`

### 2. 创建Apifox项目

1. 打开Apifox，点击「新建项目」按钮
2. 填写项目名称：「学生考勤系统API」
3. 点击「创建」按钮

### 3. 创建环境变量

1. 在项目页面左侧，点击「环境」按钮
2. 点击「新建环境」，命名为「开发环境」
3. 添加以下环境变量：
   - `base_url`：`http://localhost:3000`
   - `token`：留空，后续测试时会动态设置
4. 点击「保存」按钮

### 4. 测试认证接口

#### 测试登录接口
1. 在左侧导航栏，点击「接口」→「+ 新建接口」
2. 填写接口信息：
   - 接口名称：「登录 - 管理员」
   - 请求方法：POST
   - 请求URL：`/api/auth/login`
3. 在「请求体」选项卡中，选择「JSON」格式，输入请求体：
   ```json
   {
     "username": "admin",
     "password": "123456"
   }
   ```
4. 点击「发送」按钮，查看响应
5. 在响应结果中，复制 `token` 值
6. 在环境变量中，将 `token` 的值设置为复制的token值，点击「保存」

#### 测试注册接口
1. 点击「+ 新建接口」
2. 填写接口信息：
   - 接口名称：「注册 - 学生」
   - 请求方法：POST
   - 请求URL：`/api/auth/register`
3. 在「请求体」选项卡中，输入请求体：
   ```json
   {
     "username": "student1",
     "student_id": "20210001",
     "name": "张三"
   }
   ```
4. 点击「发送」按钮，查看响应

#### 测试修改密码接口
1. 点击「+ 新建接口」
2. 填写接口信息：
   - 接口名称：「修改密码」
   - 请求方法：POST
   - 请求URL：`/api/auth/change-password`
3. 在「请求头」选项卡中，添加：
   - 键：`Authorization`
   - 值：`Bearer {{token}}`
4. 在「请求体」选项卡中，输入请求体：
   ```json
   {
     "oldPassword": "123456",
     "newPassword": "newpassword123"
   }
   ```
5. 点击「发送」按钮，查看响应

### 5. 测试用户管理接口

#### 测试获取所有学生信息
1. 点击「+ 新建接口」
2. 填写接口信息：
   - 接口名称：「获取所有学生」
   - 请求方法：GET
   - 请求URL：`/api/users/students`
3. 在「请求头」选项卡中，添加：
   - 键：`Authorization`
   - 值：`Bearer {{token}}`
4. 点击「发送」按钮，查看响应

#### 测试检查学号是否存在
1. 点击「+ 新建接口」
2. 填写接口信息：
   - 接口名称：「检查学号」
   - 请求方法：POST
   - 请求URL：`/api/users/check-student-id`
3. 在「请求体」选项卡中，输入请求体：
   ```json
   {
     "student_id": "20210001"
   }
   ```
4. 点击「发送」按钮，查看响应

### 6. 测试考勤活动接口

#### 测试创建考勤活动
1. 点击「+ 新建接口」
2. 填写接口信息：
   - 接口名称：「创建考勤活动」
   - 请求方法：POST
   - 请求URL：`/api/activities`
3. 在「请求头」选项卡中，添加：
   - 键：`Authorization`
   - 值：`Bearer {{token}}`
4. 在「请求体」选项卡中，输入请求体：
   ```json
   {
     "title": "数学课堂考勤",
     "longitude": 116.397428,
     "latitude": 39.90923,
     "radius": 50,
     "start_time": "2026-04-11T08:00:00",
     "end_time": "2026-04-11T10:00:00",
     "qr_refresh_interval": 30
   }
   ```
5. 点击「发送」按钮，查看响应

### 7. 测试考勤记录接口

#### 测试学生打卡
1. 首先，使用学生账号登录获取token：
   - 创建一个新的登录接口，使用学生账号登录
   - 复制响应中的token值
   - 在环境变量中，暂时将 `token` 的值设置为学生token
2. 点击「+ 新建接口」
3. 填写接口信息：
   - 接口名称：「学生打卡」
   - 请求方法：POST
   - 请求URL：`/api/records`
4. 在「请求头」选项卡中，添加：
   - 键：`Authorization`
   - 值：`Bearer {{token}}`
5. 在「请求体」选项卡中，输入请求体：
   ```json
   {
     "activity_id": 1,
     "check_time": "2026-04-11T08:30:00",
     "gps_longitude": 116.397428,
     "gps_latitude": 39.90923,
     "liveness_result": "pass",
     "device_info": "IMEI1234567890"
   }
   ```
6. 点击「发送」按钮，查看响应
7. 测试完成后，将环境变量中的 `token` 改回管理员token

### 8. 测试申诉/请假接口

#### 测试提交申诉
1. 暂时将环境变量中的 `token` 设置为学生token
2. 点击「+ 新建接口」
3. 填写接口信息：
   - 接口名称：「提交申诉」
   - 请求方法：POST
   - 请求URL：`/api/appeals`
4. 在「请求头」选项卡中，添加：
   - 键：`Authorization`
   - 值：`Bearer {{token}}`
5. 在「请求体」选项卡中，输入请求体：
   ```json
   {
     "activity_id": 1,
     "type": "leave",
     "reason": "生病请假"
   }
   ```
6. 点击「发送」按钮，查看响应
7. 测试完成后，将环境变量中的 `token` 改回管理员token

### 9. 批量测试

1. 在左侧导航栏，点击「测试」→「+ 新建测试用例」
2. 命名测试用例为「完整测试流程」
3. 添加以下测试步骤：
   - 登录 - 管理员
   - 获取所有学生
   - 创建考勤活动
   - 注册 - 学生
   - 检查学号
   - （切换到学生token）学生打卡
   - （切换到学生token）提交申诉
   - （切换到管理员token）获取待审核申诉
4. 点击「运行」按钮，执行批量测试
5. 查看测试结果，确保所有接口都正常工作

## 注意事项

1. 所有需要认证的接口都需要在请求头中添加 `Authorization: Bearer <token>`
2. 教师权限的接口只能使用教师账号的token访问
3. 学生权限的接口只能使用学生账号的token访问
4. 打卡时需要确保GPS定位在地理围栏内，否则会被标记为异常
5. 每个考勤活动，学生只能打卡一次
6. 修改密码时，新密码长度至少为6个字符

## 故障排除

1. **数据库连接错误**：检查 `.env` 文件中的数据库连接信息是否正确
2. **Token无效**：确保使用正确的token，并且token没有过期
3. **权限不足**：确保使用具有相应权限的账号访问接口
4. **打卡失败**：检查活动是否在有效期内，GPS是否在围栏内
5. **密码修改失败**：确保旧密码正确，新密码长度符合要求

## 许可证

MIT
