export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  BUSINESS = 'BUSINESS',
  ROUTE = 'ROUTE',
  RUNTIME = 'RUNTIME',
}

export class AppError extends Error {
  type: ErrorType
  code: number
  timestamp: number

  constructor(message: string, type: ErrorType, code: number = 0) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.code = code
    this.timestamp = Date.now()
  }
}

export class NetworkError extends AppError {
  constructor(message: string = '网络连接异常，请检查网络') {
    super(message, ErrorType.NETWORK, 0)
    this.name = 'NetworkError'
  }
}

export class AuthError extends AppError {
  constructor(message: string = '登录已过期，请重新登录', code: number = 401) {
    super(message, ErrorType.AUTH, code)
    this.name = 'AuthError'
  }
}

export class BusinessError extends AppError {
  constructor(message: string, code: number) {
    super(message, ErrorType.BUSINESS, code)
    this.name = 'BusinessError'
  }
}

export class RouteError extends AppError {
  constructor(message: string, code: number = 404) {
    super(message, ErrorType.ROUTE, code)
    this.name = 'RouteError'
  }
}

const ERROR_HANDLER_MAP: Record<ErrorType, (error: AppError) => void> = {
  [ErrorType.NETWORK]: (error) => {
    console.error('[Network Error]', error.message)
  },
  [ErrorType.AUTH]: (error) => {
    console.warn('[Auth Error]', error.message)
  },
  [ErrorType.BUSINESS]: (error) => {
    console.warn('[Business Error]', `code=${error.code}, message=${error.message}`)
  },
  [ErrorType.ROUTE]: (error) => {
    console.warn('[Route Error]', error.message)
  },
  [ErrorType.RUNTIME]: (error) => {
    console.error('[Runtime Error]', error)
  },
}

export function handleError(error: unknown): AppError {
  let appError: AppError

  if (error instanceof AppError) {
    appError = error
  } else if (error instanceof Error) {
    appError = new AppError(error.message, ErrorType.RUNTIME, 0)
  } else {
    appError = new AppError(String(error), ErrorType.RUNTIME, 0)
  }

  const handler = ERROR_HANDLER_MAP[appError.type]
  if (handler) {
    handler(appError)
  }

  return appError
}

export function setupGlobalErrorHandler() {
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault()
    handleError(event.reason)
  })

  window.addEventListener('error', (event) => {
    event.preventDefault()
    handleError(new AppError(event.message, ErrorType.RUNTIME, 0))
  })
}
