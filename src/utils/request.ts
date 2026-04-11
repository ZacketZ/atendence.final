import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import router from '@/router'

// 创建 axios 实例
const instance = axios.create({
  baseURL: '/api', // API 基础路径
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()

    // 如果有 token，添加到请求头
    if (userStore.userInfo?.token) {
      config.headers.Authorization = `Bearer ${userStore.userInfo.token}`
    }

    // 显示加载状态（可选）
    console.log('Request sent:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      data: config.data
    })

    return config
  },
  (error) => {
    // 请求错误处理
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 这里可以根据业务需求处理响应数据
    // 例如：统一处理成功响应的数据结构
    const { data } = response

    // 假设 API 返回格式为 { code: number, data: any, message: string }
    if (data.code === 0) {
      return data.data
    } else {
      // 业务错误
      ElMessage.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message || '请求失败'))
    }
  },
  (error: AxiosError) => {
    const userStore = useUserStore()

    // 处理 HTTP 错误
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // 未授权，token 过期或无效
          ElMessage.error('登录已过期，请重新登录')
          userStore.clearUser()
          router.push('/login')
          break
        case 403:
          // 权限不足
          ElMessage.error('权限不足')
          break
        case 404:
          // 资源不存在
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          // 服务器错误
          ElMessage.error('服务器内部错误')
          break
        default:
          // 其他错误
          ElMessage.error((data as any)?.message || `请求失败: ${status}`)
      }
    } else if (error.request) {
      // 请求已发送但没有响应
      ElMessage.error('网络错误，请检查您的网络连接')
    } else {
      // 请求配置错误
      ElMessage.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

// 封装 GET 请求
export const request = {
  get<T = any>(url: string, params?: Record<string, any>, config?: AxiosRequestConfig): Promise<T> {
    return instance.get(url, { params, ...config })
  },

  // 封装 POST 请求
  post<T = any>(url: string, data?: Record<string, any>, config?: AxiosRequestConfig): Promise<T> {
    return instance.post(url, data, config)
  },

  // 封装 PUT 请求
  put<T = any>(url: string, data?: Record<string, any>, config?: AxiosRequestConfig): Promise<T> {
    return instance.put(url, data, config)
  },

  // 封装 DELETE 请求
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete(url, config)
  },

  // 上传文件
  upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    return instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    })
  }
}
