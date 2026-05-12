# MySQL 8.4 安装教程（Windows）

## 一、下载 MySQL Installer

1. 打开浏览器，访问 MySQL 官方下载页面：

   ```
   https://dev.mysql.com/downloads/installer/
   ```

2. 选择 **Windows (x86, 32-bit), MSI Installer**（大约 400MB）
   - 推荐下载 **mysql-installer-community-8.4.x.msi**（社区版，免费）

## 二、安装步骤

### 1. 运行安装程序

双击下载的 `.msi` 文件，如果提示"是否允许此应用对设备进行更改"，点击 **是**。

### 2. 选择安装类型

- 选择 **Server only**（仅安装 MySQL 服务器）
- 或者选择 **Developer Default**（开发者默认，会安装更多工具）
- **推荐选择 Server only**，更简洁

点击 **Next >**

### 3. 安装依赖

安装程序会自动检测并安装需要的依赖（如 Visual C++ Redistributable），按提示安装即可。

### 4. 开始安装

点击 **Execute** 开始安装，等待进度条走完。

### 5. 配置 MySQL

安装完成后会自动进入配置界面：

#### 5.1 Type and Networking（类型和网络）

- Config Type: **Development Computer**（开发电脑）
- Connectivity:
  - TCP/IP: ✅ 勾选
  - Port: **3306**（默认端口，不要改）
- 点击 **Next >**

#### 5.2 Authentication Method（认证方式）

- 选择 **Use Strong Password Encryption for Authentication (RECOMMENDED)**
- 点击 **Next >**

#### 5.3 Accounts and Roles（账号和角色）

- 设置 **root 密码**
  - **重要：密码一定要记住！**
  - 建议设置简单密码方便开发，例如：`123456`
  - 或者设置一个你记得住的密码
- 也可以点击 **Add User** 添加其他用户（非必须）
- 点击 **Next >**

#### 5.4 Windows Service（Windows 服务）

- ✅ **Configure MySQL Server as a Windows Service**
- Windows Service Name: `MySQL84`（默认）
- ✅ **Start the MySQL Server at System Startup**（开机自启，推荐）
- Run Windows Service as: **Standard System Account**
- 点击 **Next >**

#### 5.5 Apply Configuration（应用配置）

- 点击 **Execute** 执行配置
- 等待所有步骤完成（全部打勾 ✅）
- 点击 **Finish**

### 6. 安装完成

点击 **Finish** 退出安装程序。

## 三、验证安装

### 1. 打开命令提示符

按 `Win + R`，输入 `cmd`，回车。

### 2. 登录 MySQL

```bash
mysql -u root -p
```

输入刚才设置的 root 密码，如果出现 `mysql>` 提示符，说明安装成功！

### 3. 查看版本

在 MySQL 命令行中输入：

```sql
SELECT VERSION();
```

应该显示 `8.4.x` 版本号。

### 4. 退出 MySQL

```sql
EXIT;
```

## 四、配置环境变量（重要）

为了让系统能识别 `mysql` 命令，需要配置环境变量：

1. 右键 **此电脑** → **属性**
2. 点击 **高级系统设置**
3. 点击 **环境变量**
4. 在 **系统变量** 中找到 `Path`，双击
5. 点击 **新建**，添加：
   ```
   C:\Program Files\MySQL\MySQL Server 8.4\bin
   ```
6. 点击 **确定** 保存所有窗口

## 五、创建项目数据库

### 1. 登录 MySQL

```bash
mysql -u root -p
```

### 2. 创建数据库

```sql
CREATE DATABASE IF NOT EXISTS attendance_system
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
```

### 3. 使用数据库

```sql
USE attendance_system;
```

### 4. 初始化表结构

在项目目录下找到 `backend/config/init.sql` 文件，执行：

```bash
mysql -u root -p attendance_system < backend/config/init.sql
```

或者在 MySQL 命令行中直接复制 `init.sql` 的内容粘贴执行。

### 5. 验证表是否创建成功

```sql
SHOW TABLES;
```

应该看到以下表：

- users
- user_profiles
- user_notification_preferences
- attendance_activities
- attendance_records
- appeals

## 六、配置项目连接

打开项目中的 `backend/.env` 文件，确保配置正确：

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你设置的密码
DB_NAME=attendance_system
```

> **注意：** 如果你设置的 root 密码不是空密码，一定要把 `DB_PASSWORD` 改成你的密码！

## 七、常见问题

### Q: 安装后无法启动 MySQL 服务？

A: 按 `Win + R` 输入 `services.msc`，找到 `MySQL84` 服务，右键点击 **启动**。

### Q: 忘记 root 密码怎么办？

A: 需要重置密码，步骤较复杂。建议重新安装 MySQL，安装时设置一个简单好记的密码。

### Q: 连接数据库报错 "Access denied"？

A: 检查 `.env` 文件中的 `DB_PASSWORD` 是否和安装时设置的 root 密码一致。

### Q: 端口 3306 被占用？

A: 运行 `netstat -ano | findstr :3306` 查看哪个程序占用了端口，关闭该程序或修改 MySQL 端口。
