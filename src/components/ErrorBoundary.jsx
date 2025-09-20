import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误详情
    const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2)
    
    this.setState({
      error,
      errorInfo,
      errorId
    })

    // 在开发环境下输出详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 React Error Boundary Caught Error [${errorId}]`)
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }

    // 在生产环境可以发送错误到日志服务
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo, errorId)
    }
  }

  logErrorToService = (error, errorInfo, errorId) => {
    // 这里可以集成错误监控服务，如 Sentry, LogRocket 等
    const errorData = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }

    // 示例：发送到错误监控服务
    try {
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // })
      console.warn('Error logged:', errorData)
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId } = this.state
      const { fallback: Fallback, showDetails = false } = this.props

      // 如果提供了自定义的降级UI组件
      if (Fallback) {
        return (
          <Fallback 
            error={error}
            errorInfo={errorInfo}
            resetError={this.handleReset}
          />
        )
      }

      // 默认的错误UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  应用程序遇到错误
                </h3>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                很抱歉，应用程序遇到了一个意外错误。我们已经记录了这个问题。
              </p>
              {errorId && (
                <p className="text-xs text-gray-500 mt-2">
                  错误ID: {errorId}
                </p>
              )}
            </div>

            {showDetails && process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
                <details>
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    查看错误详情
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong>错误信息:</strong>
                      <pre className="mt-1 text-red-600 whitespace-pre-wrap">
                        {error?.toString()}
                      </pre>
                    </div>
                    {errorInfo?.componentStack && (
                      <div>
                        <strong>组件堆栈:</strong>
                        <pre className="mt-1 text-gray-600 whitespace-pre-wrap">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                重试
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                刷新页面
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  💡 开发提示: 检查浏览器控制台获取更多调试信息
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary