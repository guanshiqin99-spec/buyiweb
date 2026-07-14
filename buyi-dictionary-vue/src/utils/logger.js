// 统一的错误日志出口
// 所有 API 错误、渲染错误、路由错误通过此模块记录，避免散落在各业务模块

export function logApiError(error) {
  if (error.response) {
    const msg = error.response.data?.message || error.response.data?.error
    switch (error.response.status) {
      case 403:
        console.error('没有权限访问', msg)
        break
      case 404:
        console.error('请求的资源不存在', msg)
        break
      case 500:
        console.error('服务器内部错误', msg)
        break
      default:
        console.error('请求失败:', error.response.status, msg)
    }
  } else if (error.request) {
    console.error('网络错误，请检查网络连接或后端服务是否启动')
  } else {
    console.error('请求配置错误:', error.message)
  }
}

export function logRenderError(err, info) {
  console.error('[Render] 组件渲染错误:', err, info)
}

export function logRouteChunkError(error) {
  console.error('[Router] 路由懒加载失败:', error?.message || error)
}
