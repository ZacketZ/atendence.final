-- ============================================================
-- 考勤系统初始化数据
-- 默认密码: 123456
-- bcrypt hash: $2b$10$OgPNwmMnkqgXhl.L9B6B4OD25qTY2QX/7hJ55f/9bKOrFzvl4Fhfm
-- ============================================================
USE web-db;

-- ============================================================
-- 插入管理员 
-- ============================================================
INSERT INTO users (username, password_hash, role, name) VALUES
  ('admin',   '$2b$10$OgPNwmMnkqgXhl.L9B6B4OD25qTY2QX/7hJ55f/9bKOrFzvl4Fhfm', 'admin',   '系统管理员'),
  ('admin2',  '$2b$10$OgPNwmMnkqgXhl.L9B6B4OD25qTY2QX/7hJ55f/9bKOrFzvl4Fhfm', 'admin',   '教务管理员'),
  ('admin3',  '$2b$10$OgPNwmMnkqgXhl.L9B6B4OD25qTY2QX/7hJ55f/9bKOrFzvl4Fhfm', 'admin',   '学工管理员');

-- ============================================================
-- 插入教师
-- ============================================================
INSERT INTO users (username, password_hash, role, name) VALUES
  ('teacher1', '$2b$10$OgPNwmMnkqgXhl.L9B6B4OD25qTY2QX/7hJ55f/9bKOrFzvl4Fhfm', 'teacher', '张老师'),
  ('teacher2', '$2b$10$OgPNwmMnkqgXhl.L9B6B4OD25qTY2QX/7hJ55f/9bKOrFzvl4Fhfm', 'teacher', '李老师'),
  ('teacher3', '$2b$10$OgPNwmMnkqgXhl.L9B6B4OD25qTY2QX/7hJ55f/9bKOrFzvl4Fhfm', 'teacher', '王老师'),
  ('teacher4', '$2b$10$OgPNwmMnkqgXhl.L9B6B4OD25qTY2QX/7hJ55f/9bKOrFzvl4Fhfm', 'teacher', '赵老师'),
  ('teacher5', '$2b$10$OgPNwmMnkqgXhl.L9B6B4OD25qTY2QX/7hJ55f/9bKOrFzvl4Fhfm', 'teacher', '陈老师');

-- ============================================================
-- 插入学生（同步写入 user_profiles 和 user_notification_preferences）
-- ============================================================
INSERT INTO users (username, password_hash, role, student_id, name, status) VALUES
  ('student1', '$2b$10$OgPNwmMnkqgXhl.L9B6B4OD25qTY2QX/7hJ55f/9bKOrFzvl4Fhfm', 'student', '20230001', '张三', 1),
  ('student2', '$2b$10$OgPNwmMnkqgXhl.L9B6B4OD25qTY2QX/7hJ55f/9bKOrFzvl4Fhfm', 'student', '20230002', '李四', 1),
  ('student3', '$2b$10$OgPNwmMnkqgXhl.L9B6B4OD25qTY2QX/7hJ55f/9bKOrFzvl4Fhfm', 'student', '20230003', '王五', 1),
  ('student4', '$2b$10$OgPNwmMnkqgXhl.L9B6B4OD25qTY2QX/7hJ55f/9bKOrFzvl4Fhfm', 'student', '20230004', '赵六', 1),
  ('student5', '$2b$10$OgPNwmMnkqgXhl.L9B6B4OD25qTY2QX/7hJ55f/9bKOrFzvl4Fhfm', 'student', '20230005', '陈七', 1);

INSERT INTO user_profiles (user_id, phone, email, college, grade, major, class_name, dormitory, enrollment_date) VALUES
  ((SELECT id FROM users WHERE username = 'student1'), '13800001001', 'zhangsan@example.com', '计算机学院', '2023级', '软件工程',         '软件2301', '北苑1号楼301室', '2023-09-01'),
  ((SELECT id FROM users WHERE username = 'student2'), '13800001002', 'lisi@example.com',    '计算机学院', '2023级', '计算机科学与技术', '计科2301', '北苑1号楼302室', '2023-09-01'),
  ((SELECT id FROM users WHERE username = 'student3'), '13800001003', 'wangwu@example.com',   '数学学院',   '2023级', '应用数学',         '数学2301', '南苑2号楼101室', '2023-09-01'),
  ((SELECT id FROM users WHERE username = 'student4'), '13800001004', 'zhaoliu@example.com', '物理学院',   '2023级', '物理学',           '物理2301', '南苑2号楼102室', '2023-09-01'),
  ((SELECT id FROM users WHERE username = 'student5'), '13800001005', 'chenqi@example.com',  '外语学院',   '2023级', '英语',             '英语2301', '西苑3号楼201室', '2023-09-01');

INSERT INTO user_notification_preferences (user_id) VALUES
  ((SELECT id FROM users WHERE username = 'student1')),
  ((SELECT id FROM users WHERE username = 'student2')),
  ((SELECT id FROM users WHERE username = 'student3')),
  ((SELECT id FROM users WHERE username = 'student4')),
  ((SELECT id FROM users WHERE username = 'student5'));