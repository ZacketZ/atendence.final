import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useLoadingStore } from '@/store/loading'
import { NetworkError, AuthError, BusinessError, handleError } from '@/utils/errors'
import { getToken, setToken, getRefreshToken, clearAuth } from '@/utils/auth'
import { ERROR_CODE_MAP, BIZ_CODE_MAP } from '@/constants'

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface RetryConfig {
  retries: number
  retryDelay: number
  retryDelayMultiplier: number
  retryOnStatusCodes: number[]
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  retries: 2,
  retryDelay: 1000,
  retryDelayMultiplier: 2,
  retryOnStatusCodes: [408, 500, 502, 503, 504],
}

let isRefreshing = false
let pendingRequests: Array<(token: string) => void> = []

function createAxiosInstance() {
  return axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

const instance = createAxiosInstance()

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    const loadingKey = (config as any)._loadingKey as string | undefined
    const showLoading = (config as any)._showLoading !== false
    if (showLoading) {
      try {
        const loadingStore = useLoadingStore()
        loadingStore.startLoading(loadingKey || 'global')
      } catch {}
    }

    return config
  },
  (error: AxiosError) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config as any
    const loadingKey = config._loadingKey as string | undefined
    const showLoading = config._showLoading !== false
    if (showLoading) {
      try {
        const loadingStore = useLoadingStore()
        loadingStore.stopLoading(loadingKey || 'global')
      } catch {}
    }

    const { data } = response

    if (data.code !== undefined && data.code !== 0 && data.code !== 200) {
      const bizMessage = BIZ_CODE_MAP[data.code] || data.message || '请求失败'
      const bizError = new BusinessError(bizMessage, data.code)
      handleError(bizError)
      ElMessage.error(bizMessage)
      return Promise.reject(bizError)
    }

    if (data.code !== undefined) {
      return data.data !== undefined ? data.data : data
    }

    return data
  },
  async (error: AxiosError) => {
    const config = error.config as any
    if (config) {
      const loadingKey = config._loadingKey as string | undefined
      const showLoading = config._showLoading !== false
      if (showLoading) {
        try {
          const loadingStore = useLoadingStore()
          loadingStore.stopLoading(loadingKey || 'global')
        } catch {}
      }
    }

    if (!error.response) {
      const networkError = new NetworkError('网络连接异常，请检查网络')
      handleError(networkError)
      ElMessage.error(networkError.message)
      return Promise.reject(networkError)
    }

    const { status, data } = error.response
    const errorMessage = (data as any)?.error || ERROR_CODE_MAP[status] || `请求失败: ${status}`

    if (status === 401) {
      const refreshToken = getRefreshToken()

      if (refreshToken && !isRefreshing) {
        isRefreshing = true

        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/refresh`,
            { refreshToken }
          )

          const newToken = res.data?.data?.token || res.data?.token
          if (newToken) {
            setToken(newToken)
            pendingRequests.forEach((cb) => cb(newToken))
            pendingRequests = []

            if (error.config) {
              error.config.headers.Authorization = `Bearer ${newToken}`
              return instance(error.config)
            }
          }
        } catch {
          clearAuth()
          const authError = new AuthError('登录已过期，请重新登录', 401)
          handleError(authError)
          ElMessage.error(authError.message)
          router.push('/login')
        } finally {
          isRefreshing = false
        }
      } else if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token: string) => {
            if (error.config) {
              error.config.headers.Authorization = `Bearer ${token}`
              resolve(instance(error.config))
            }
          })
        })
      } else {
        clearAuth()
        const authError = new AuthError('登录已过期，请重新登录', 401)
        handleError(authError)
        ElMessage.error(authError.message)
        router.push('/login')
      }
    } else if (status === 403) {
      const authError = new AuthError(errorMessage, 403)
      handleError(authError)
      ElMessage.error(errorMessage)
    } else {
      const appError = new NetworkError(errorMessage)
      handleError(appError)
      ElMessage.error(errorMessage)
    }

    return Promise.reject(error)
  }
)

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function requestWithRetry<T>(requestFn: () => Promise<any>, retryConfig?: Partial<RetryConfig>): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }
  let lastError: unknown

  for (let attempt = 0; attempt <= config.retries; attempt++) {
    try {
      return (await requestFn()) as T
    } catch (error) {
      lastError = error

      const axiosError = error as AxiosError
      const status = axiosError.response?.status

      const shouldRetry =
        status !== undefined &&
        config.retryOnStatusCodes.includes(status) &&
        attempt < config.retries

      if (!shouldRetry) {
        break
      }

      const delay = config.retryDelay * Math.pow(config.retryDelayMultiplier, attempt)
      console.warn(`[Retry] 第 ${attempt + 1} 次重试，${delay}ms 后执行...`, `status=${status}`)

      await sleep(delay)
    }
  }

  throw lastError
}

export interface RequestOptions extends AxiosRequestConfig {
  loadingKey?: string
  showLoading?: boolean
  retry?: Partial<RetryConfig> | false
}

export const request = {
  get<T = any>(url: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
    const { loadingKey, showLoading, retry, ...axiosConfig } = options || {}
    const config: any = {
      ...axiosConfig,
      params,
      _loadingKey: loadingKey,
      _showLoading: showLoading,
    }

    const requestFn = () => instance.get<T>(url, config)

    if (retry === false) {
      return requestFn().then((r) => r as unknown as T)
    }

    return requestWithRetry<T>(requestFn, retry || undefined)
  },

  post<T = any>(url: string, data?: Record<string, any>, options?: RequestOptions): Promise<T> {
    const { loadingKey, showLoading, retry, params, ...axiosConfig } = options || {}
    const config: any = {
      ...axiosConfig,
      params,
      _loadingKey: loadingKey,
      _showLoading: showLoading,
    }

    const requestFn = () => instance.post<T>(url, data, config)

    if (retry === false) {
      return requestFn().then((r) => r as unknown as T)
    }

    return requestWithRetry<T>(requestFn, retry || undefined)
  },

  put<T = any>(url: string, data?: Record<string, any>, options?: RequestOptions): Promise<T> {
    const { loadingKey, showLoading, retry, params, ...axiosConfig } = options || {}
    const config: any = {
      ...axiosConfig,
      params,
      _loadingKey: loadingKey,
      _showLoading: showLoading,
    }

    const requestFn = () => instance.put<T>(url, data, config)

    if (retry === false) {
      return requestFn().then((r) => r as unknown as T)
    }

    return requestWithRetry<T>(requestFn, retry || undefined)
  },

  delete<T = any>(url: string, options?: RequestOptions): Promise<T> {
    const { loadingKey, showLoading, retry, ...axiosConfig } = options || {}
    const config: any = {
      ...axiosConfig,
      _loadingKey: loadingKey,
      _showLoading: showLoading,
    }

    const requestFn = () => instance.delete<T>(url, config)

    if (retry === false) {
      return requestFn().then((r) => r as unknown as T)
    }

    return requestWithRetry<T>(requestFn, retry || undefined)
  },

  upload<T = any>(url: string, formData: FormData, options?: RequestOptions): Promise<T> {
    const { loadingKey, showLoading, retry, ...axiosConfig } = options || {}
    const config: any = {
      ...axiosConfig,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...axiosConfig.headers,
      },
      _loadingKey: loadingKey,
      _showLoading: showLoading,
    }

    const requestFn = () => instance.post<T>(url, formData, config)

    if (retry === false) {
      return requestFn().then((r) => r as unknown as T)
    }

    return requestWithRetry<T>(requestFn, retry || undefined)
  },
}

export default instance
