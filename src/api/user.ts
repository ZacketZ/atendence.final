import {
  mockLogin,
  mockGetUserProfile,
  mockUpdateUserProfile,
  mockUploadAvatar,
} from "@/mock/user";

export interface LoginResponse {
  id: number;
  username: string;
  role: "admin" | "staff" | "student";
  token: string;
}

export interface UserProfile {
  id: number;
  username: string;
  studentId: string;
  name: string;
  className: string;
  major: string;
  phone: string;
  email: string;
  avatar?: string;
  emergencyContact: string;
  emergencyPhone: string;
  dormitory: string;
  enrollmentDate?: string;
  counselor?: string;
  college?: string;
  grade?: string;
}

export interface UpdateProfileData {
  phone: string;
  email: string;
  emergencyContact: string;
  emergencyPhone: string;
  dormitory: string;
  avatar?: string;
}

export interface AvatarUploadResponse {
  avatarUrl: string;
}

// 登录
export const login = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  return (await mockLogin(username, password)) as LoginResponse;
};

// 登出
export const logout = () => {
  localStorage.removeItem("userInfo");
};

// 获取用户个人信息
export const getUserProfile = async (): Promise<UserProfile> => {
  return await mockGetUserProfile();
};

// 更新用户个人信息
export const updateUserProfile = async (
  data: UpdateProfileData,
): Promise<void> => {
  return await mockUpdateUserProfile(data);
};

// 上传头像
export const uploadAvatar = async (
  formData: FormData,
): Promise<AvatarUploadResponse> => {
  return await mockUploadAvatar(formData);
};

// 修改密码
export const changePassword = async (
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

// 获取通知偏好
export const getNotificationPreferences = async () => {
  return Promise.resolve({
    checkinReminder: true,
    approvalNotification: true,
    attendanceAlert: true,
  });
};

// 更新通知偏好
export const updateNotificationPreferences = async (_preferences: any) => {
  return Promise.resolve();
};
