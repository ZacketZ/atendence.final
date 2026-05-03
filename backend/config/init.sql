-- ============================================================
-- 考勤系统数据库初始化脚本
-- 使用方法: mysql -u root -p < init.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS attendance_system
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE attendance_system;

-- ============================================================
-- 用户表
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
  student_id    VARCHAR(50)  DEFAULT NULL UNIQUE,
  name          VARCHAR(100) DEFAULT NULL,
  status        TINYINT      NOT NULL DEFAULT 1 COMMENT '1=启用 0=禁用',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role),
  INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 考勤活动表
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance_activities (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id          INT          NOT NULL,
  title               VARCHAR(200) NOT NULL,
  longitude           DECIMAL(10,7) NOT NULL COMMENT '经度',
  latitude            DECIMAL(10,7) NOT NULL COMMENT '纬度',
  radius              INT          NOT NULL DEFAULT 200 COMMENT '地理围栏半径(米)',
  start_time          DATETIME     NOT NULL,
  end_time            DATETIME     NOT NULL,
  qr_refresh_interval INT          NOT NULL DEFAULT 30 COMMENT '二维码刷新间隔(秒)',
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_teacher (teacher_id),
  INDEX idx_time_range (start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 打卡记录表
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance_records (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  activity_id     INT           NOT NULL,
  user_id         INT           NOT NULL,
  check_time      DATETIME      NOT NULL,
  gps_longitude   DECIMAL(10,7) DEFAULT NULL COMMENT '打卡经度',
  gps_latitude    DECIMAL(10,7) DEFAULT NULL COMMENT '打卡纬度',
  liveness_result VARCHAR(100)  DEFAULT NULL COMMENT '活体检测结果',
  final_status    ENUM('normal', 'abnormal') NOT NULL DEFAULT 'normal' COMMENT '打卡状态',
  device_info     VARCHAR(255)  DEFAULT NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_activity_user (activity_id, user_id),
  FOREIGN KEY (activity_id) REFERENCES attendance_activities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_activity (activity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 申诉/请假表
-- ============================================================
CREATE TABLE IF NOT EXISTS appeals (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT                     NOT NULL,
  activity_id   INT                     NOT NULL,
  type          ENUM('appeal', 'leave') NOT NULL COMMENT 'appeal=申诉 leave=请假',
  reason        TEXT                    NOT NULL,
  status        ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  admin_comment TEXT DEFAULT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_activity_type (user_id, activity_id, type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES attendance_activities(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
