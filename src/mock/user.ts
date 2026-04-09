// 模拟登录接口
export const mockLogin = (username: string, password: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 测试账号数据
      const accounts: Record<string, { password: string; id: number; role: 'admin' | 'staff' | 'student' }> = {
        admin: { password: '123456', id: 1, role: 'admin' },
        staff: { password: '123456', id: 2, role: 'staff' },
        student: { password: '123456', id: 3, role: 'student' }
      }

      const account = accounts[username]

      if (!account) {
        reject(new Error('账号不存在'))
        return
      }

      if (account.password !== password) {
        reject(new Error('密码错误'))
        return
      }

      resolve({
        id: account.id,
        username: username,
        role: account.role,
        token: `${username}-${Date.now()}`
      })
    }, 500)
  })
}
