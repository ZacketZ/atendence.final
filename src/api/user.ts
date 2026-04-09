import { mockLogin } from '@/mock/user'

export interface LoginResponse {
  id: number
  username: string
  role: 'admin' | 'staff' | 'student'
  token: string
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  return (await mockLogin(username, password)) as LoginResponse
}

export const logout = () => {
  localStorage.removeItem('userInfo')
}
