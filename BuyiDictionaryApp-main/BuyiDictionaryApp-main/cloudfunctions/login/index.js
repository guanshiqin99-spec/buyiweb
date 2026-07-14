// 云函数模板
// 部署：在 cloudfunctions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const { nickname, avatarUrl } = event
  const now = new Date()

  // 查询用户
  const usersCollection = db.collection('users')
  let userRecord = null

  try {
    const queryRes = await usersCollection.where({ openid }).get()
    if (queryRes.data.length > 0) {
      userRecord = queryRes.data[0]
    }
  } catch (err) {
    console.error('查询 users 集合失败，如果 collection 不存在请创建:', err)
  }

  try {
    if (userRecord) {
      // 存在用户，更新登录时间和用户信息
      await usersCollection.doc(userRecord._id).update({
        data: {
          nickname: nickname || userRecord.nickname,
          avatarUrl: avatarUrl || userRecord.avatarUrl,
          updateTime: now,
          lastLoginTime: now
        }
      })
    } else {
      // 不存在，新增用户
      await usersCollection.add({
        data: {
          openid: openid,
          nickname: nickname || '微信用户',
          avatarUrl: avatarUrl || '',
          createTime: now,
          updateTime: now,
          lastLoginTime: now
        }
      })
    }
  } catch (err) {
    console.error('更新/增加用户失败:', err)
  }

  // 可返回当前用户信息
  return {
    openid,
    nickname,
    avatarUrl
  }
}
