import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = Bearer 
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 处理错误响应
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          window.location.href = '/login'
          break
        case 403:
          console.error('没有权限访问')
          break
        case 404:
          console.error('请求的资源不存在')
          break
        case 500:
          console.error('服务器内部错误')
          break
        default:
          console.error('请求失败:', error.response.status)
      }
    } else if (error.request) {
      console.error('网络错误，请检查网络连接')
    } else {
      console.error('请求配置错误:', error.message)
    }
    return Promise.reject(error)
  }
)

// API方法
export const dictionaryApi = {
  // 搜索词汇
  search(params) {
    return api.get('/dictionary/search', { params })
  },
  
  // 获取词汇详情
  getDetail(id) {
    return api.get(/dictionary/)
  },
  
  // 获取词汇列表
  getList(params) {
    return api.get('/dictionary', { params })
  }
}

export const phrasesApi = {
  // 搜索短语
  search(params) {
    return api.get('/phrases/search', { params })
  },
  
  // 获取短语详情
  getDetail(id) {
    return api.get(/phrases/)
  },
  
  // 获取短语列表
  getList(params) {
    return api.get('/phrases', { params })
  }
}

export const proverbsApi = {
  // 搜索谚语
  search(params) {
    return api.get('/proverbs/search', { params })
  },
  
  // 获取谚语详情
  getDetail(id) {
    return api.get(/proverbs/)
  },
  
  // 获取谚语列表
  getList(params) {
    return api.get('/proverbs', { params })
  }
}

export const songsApi = {
  // 获取民歌列表
  getList(params) {
    return api.get('/songs', { params })
  },
  
  // 获取民歌详情
  getDetail(id) {
    return api.get(/songs/)
  }
}

export const cultureApi = {
  // 获取文化内容
  getContent(params) {
    return api.get('/culture', { params })
  }
}

export const userApi = {
  // 用户登录
  login(data) {
    return api.post('/auth/login', data)
  },
  
  // 用户注册
  register(data) {
    return api.post('/auth/register', data)
  },
  
  // 获取用户信息
  getProfile() {
    return api.get('/user/profile')
  },
  
  // 更新用户信息
  updateProfile(data) {
    return api.put('/user/profile', data)
  },
  
  // 获取收藏列表
  getFavorites(params) {
    return api.get('/user/favorites', { params })
  },
  
  // 添加收藏
  addFavorite(data) {
    return api.post('/user/favorites', data)
  },
  
  // 删除收藏
  removeFavorite(id) {
    return api.delete(/user/favorites/)
  },
  
  // 获取学习记录
  getRecords(params) {
    return api.get('/user/records', { params })
  }
}

export default api
