// 模拟登录接口
export const mockLogin = (username: string, password: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 测试账号数据
      const accounts: Record<
        string,
        { password: string; id: number; role: "admin" | "staff" | "student" }
      > = {
        admin: { password: "123456", id: 1, role: "admin" },
        staff: { password: "123456", id: 2, role: "staff" },
        student: { password: "123456", id: 3, role: "student" },
      };

      const account = accounts[username];

      if (!account) {
        reject(new Error("账号不存在"));
        return;
      }

      if (account.password !== password) {
        reject(new Error("密码错误"));
        return;
      }

      resolve({
        id: account.id,
        username: username,
        role: account.role,
        token: `${username}-${Date.now()}`,
      });
    }, 500);
  });
};

// 模拟获取用户个人信息
export const mockGetUserProfile = (): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 3,
        username: "student",
        studentId: "20230001",
        name: "张三",
        className: "计算机科学与技术1班",
        major: "计算机科学与技术",
        phone: "13800138000",
        email: "student@example.com",
        avatar: "",
        emergencyContact: "李四",
        emergencyPhone: "13900139000",
        dormitory: "1号楼301室",
        enrollmentDate: "2023-09-01",
        counselor: "王老师",
        college: "计算机学院",
        grade: "2023级",
      });
    }, 300);
  });
};

// 模拟更新用户个人信息
export const mockUpdateUserProfile = (data: any): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("更新个人信息:", data);
      resolve();
    }, 500);
  });
};

// 模拟上传头像
export const mockUploadAvatar = (
  _formData: FormData,
): Promise<{ avatarUrl: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟上传成功，返回一个虚拟的图片URL
      resolve({
        avatarUrl: "https://example.com/avatar/student-avatar.jpg",
      });
    }, 800);
  });
};

// 模拟修改密码
export const mockChangePassword = (
  oldPassword: string,
  _newPassword: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (oldPassword === "123456") {
        resolve();
      } else {
        reject(new Error("原密码错误"));
      }
    }, 500);
  });
};

// 模拟获取通知偏好
export const mockGetNotificationPreferences = (): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        checkinReminder: true,
        approvalNotification: true,
        attendanceAlert: true,
      });
    }, 200);
  });
};

// 模拟更新通知偏好
export const mockUpdateNotificationPreferences = (
  preferences: any,
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("更新通知偏好:", preferences);
      resolve();
    }, 300);
  });
};
