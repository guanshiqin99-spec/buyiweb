const { authApi } = require('../../utils/api');
const { syncAppearance } = require('../../utils/view');

Page({
  data: {
    loading: false,
    currentTheme: 'light',
    fontSizeClass: 'medium',
    avatarUrl: '/images/avatar.png',
    nickname: '',
    showModal: false,
  },

  onLoad() {
    syncAppearance(this);
  },

  onShow() {
    syncAppearance(this);
  },
  
  showProfileModal() {
    this.setData({ showModal: true });
  },

  hideProfileModal() {
    this.setData({ showModal: false });
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({ avatarUrl });
  },

  onInputChange(e) {
    const nickname = e.detail.value;
    this.setData({ nickname });
  },

  async doLogin() {
    if (this.data.loading) {
      return;
    }

    if (!this.data.nickname) {
       wx.showToast({ title: '请填写昵称', icon: 'none' });
       return;
    }
    
    let { avatarUrl, nickname } = this.data;
    
    // 如果用户既没有改头像，也没有有效的信息，我们需要兜底避免用空覆盖之前的云端头像
    const app = getApp();
    const existingAvatar = app.globalData.userInfo ? app.globalData.userInfo.avatarUrl : '';

    if (avatarUrl === '/images/avatar.png') {
       avatarUrl = existingAvatar && existingAvatar !== '/images/avatar.png' ? existingAvatar : '';
    }

    this.setData({ loading: true });
    try {
      wx.showLoading({ title: '登录中...' });

      // Step 0: Upload customized avatar to cloud if picked
      let cloudAvatarUrl = avatarUrl;
      const isLocalTemp = avatarUrl && (avatarUrl.startsWith('http://tmp') || avatarUrl.startsWith('wxfile://'));
      if (isLocalTemp) {
        const ext = avatarUrl.match(/\.([^.]+)$/)?.[1] || 'png';
        const cloudPath = `avatars/${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${ext}`;
        try {
          const uploadRes = await wx.cloud.uploadFile({
            cloudPath,
            filePath: avatarUrl
          });
          cloudAvatarUrl = uploadRes.fileID;
        } catch (err) {
          console.error('[Login] Upload avatar fail, will use default:', err);
          // 上传失败时放弃临时路径，使用默认头像，避免临时路径被存入数据库
          cloudAvatarUrl = '';
          avatarUrl = '';
        }
      }

      // Step 1.5: call cloud function to save user in cloudbase
      let cloudOpenId = '';
      try {
        const cloudRes = await wx.cloud.callFunction({
          name: 'login',
          data: { nickname, avatarUrl: cloudAvatarUrl || avatarUrl }
        });
        if (cloudRes && cloudRes.result) {
          cloudOpenId = cloudRes.result.openid;
          if (cloudRes.result.avatarUrl && !cloudAvatarUrl) {
            cloudAvatarUrl = cloudRes.result.avatarUrl;
          }
        }
      } catch (err) {
        console.error('[Login] cloud function login fail:', err);
      }

      // Step 2: wx.login
      const loginResult = await new Promise((resolve, reject) => {
        wx.login({
          success(res) {
            console.log('[Login] wx.login success, code:', res.code ? res.code.substring(0, 10) + '...' : 'EMPTY');
            if (!res.code) {
              reject(new Error('未获取到登录凭证'));
              return;
            }
            resolve(res);
          },
          fail(err) {
            console.error('[Login] wx.login fail:', JSON.stringify(err));
            reject(new Error('登录凭证获取失败'));
          },
        });
      });

      // Step 3: call backend
      console.log('[Login] calling authApi.loginWithWechat...');
      const payload = await authApi.loginWithWechat(loginResult.code, {
        nickname: nickname,
        avatarUrl: cloudAvatarUrl || avatarUrl,
      });
      console.log('[Login] backend response success, user:', payload.user ? payload.user.id : 'NO_USER');

      // 更新全局状态管理
      const app = getApp();
      app.updateLoginState(payload.user, payload.accessToken, payload.refreshToken, payload.settings);
      
      // 同步缓存
      const loginState = wx.getStorageSync('loginState') || {};
      const finalUserInfo = {
        nickname: nickname,
        avatarUrl: cloudAvatarUrl || avatarUrl,
        openid: payload.user.openid || cloudOpenId || ''
      };
      loginState.userInfo = finalUserInfo;
      loginState.isLogin = true;
      
      app.globalData.userInfo = finalUserInfo;
      app.globalData.isLogin = true;
      wx.setStorageSync('loginState', loginState);
      
      wx.hideLoading();
      wx.showToast({ title: '登录成功', icon: 'success' });
      
      setTimeout(() => {
        if (getCurrentPages().length > 1) {
          wx.navigateBack();
        } else {
          wx.switchTab({ url: '/pages/mine/index' });
        }
      }, 500);

    } catch (error) {
      console.error('[Login] doLogin error:', error);
      wx.hideLoading();
      let errMsg = '登录失败，请稍后重试';
      if (error && error.message) {
         console.error('[Login] error message:', error.message);
         if (error.message.includes('未授权用户信息')) {
           errMsg = '未授权用户信息';
         } else if (error.errMsg && error.errMsg.includes('request:fail')) {
           errMsg = '网络异常，请检查网络';
         } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
           errMsg = '登录授权失败，请稍后重试';
         }
      }
      wx.showToast({ title: errMsg, icon: 'none', duration: 2000 });
    } finally {
      this.setData({ loading: false });
    }
  },

  getUserProfile() {
    return this.doLogin();
  },

  cancel() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({ url: '/pages/home/index' });
    }
  },
});
