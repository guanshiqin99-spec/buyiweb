
const tcb = require('@cloudbase/node-sdk');

// 初始化 CloudBase
const app = tcb.init({
  env: 'cloud1-1gl3y5g7fbe3c208',
});

const db = app.database();

/**
 * 布依词典 API - 函数型云托管主入口
 * 支持小程序端和管理后台的 API 请求
 */
exports.main = async function (event, context) {
  const { httpContext } = context;
  const method = (httpContext?.httpMethod || 'GET').toUpperCase();
  const path = httpContext?.url || '/';
  const body = parseBody(event, httpContext);
  const query = httpContext?.query || {};

  // 设置 CORS 头（在 cloudbase-functions-framework 中通过 context 返回）
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-Id',
  };

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    const result = await routeRequest(method, path, { body, query, headers, db, app });
    return {
      statusCode: result.statusCode || 200,
      headers: { ...headers, ...result.headers },
      body: JSON.stringify(result.body),
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: error.statusCode || 500,
      headers,
      body: JSON.stringify({
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || '服务器内部错误',
      }),
    };
  }
};

/**
 * 解析请求体
 */
function parseBody(event, httpContext) {
  try {
    if (typeof event === 'string') return JSON.parse(event);
    if (event && event.body) return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    if (httpContext?.body) return typeof httpContext.body === 'string' ? JSON.parse(httpContext.body) : httpContext.body;
    return {};
  } catch {
    return {};
  }
}

/**
 * 路由分发
 */
async function routeRequest(method, path, ctx) {
  const { body, query, db } = ctx;

  // ========== 健康检查 ==========
  if (path === '/api/health' || path === '/api/ready') {
    return {
      statusCode: 200,
      body: { status: 'ok', service: 'Buyi Dictionary API (CloudBase)', timestamp: Date.now() },
    };
  }

  // ========== 小程序 - 首页 ==========
  if (path === '/api/miniapp/home' && method === 'GET') {
    const banners = await db.collection('banners').where({ status: 'published' }).limit(5).get();
    const suggestions = await db.collection('dictionary').where({ status: 'published' }).limit(5).get();
    return {
      body: {
        code: 0,
        data: {
          banners: banners.data || [],
          suggestions: suggestions.data || [],
          stats: {
            dictionaryCount: await getCount(db, 'dictionary', 'published'),
            phraseCount: await getCount(db, 'phrases', 'published'),
            proverbCount: await getCount(db, 'proverbs', 'published'),
            songCount: await getCount(db, 'songs', 'published'),
          },
        },
      },
    };
  }

  // ========== 小程序 - 词典列表 ==========
  if (path === '/api/miniapp/dictionary' && method === 'GET') {
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 20;
    const keyword = query.keyword || '';
    const status = query.status || 'published';

    let collection = db.collection('dictionary');
    if (status) collection = collection.where({ status });
    if (keyword) {
      collection = collection.where({
        $or: [
          { buyiWord: db.RegExp({ regexp: keyword, options: 'i' }) },
          { chineseWord: db.RegExp({ regexp: keyword, options: 'i' }) },
        ],
      });
    }

    const total = (await collection.count()).total;
    const list = await collection.skip((page - 1) * pageSize).limit(pageSize).get();

    return {
      body: {
        code: 0,
        data: { list: list.data || [], total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
      },
    };
  }

  // ========== 小程序 - 词典详情 ==========
  const dictDetailMatch = path.match(/^\/api\/miniapp\/dictionary\/(.+)$/);
  if (dictDetailMatch && method === 'GET') {
    const id = dictDetailMatch[1];
    const doc = await db.collection('dictionary').doc(id).get();
    if (!doc.data || doc.data.length === 0) {
      return { statusCode: 404, body: { code: 404, message: '词条不存在' } };
    }
    return { body: { code: 0, data: doc.data[0] || doc.data } };
  }

  // ========== 小程序 - 搜索 ==========
  if (path === '/api/miniapp/search' && method === 'GET') {
    const keyword = query.keyword || '';
    if (!keyword) {
      return { body: { code: 0, data: { dictionary: [], phrases: [], proverbs: [], songs: [] } } };
    }

    const regex = db.RegExp({ regexp: keyword, options: 'i' });
    const [dictRes, phraseRes, proverbRes, songRes] = await Promise.all([
      db.collection('dictionary').where({ status: 'published', $or: [{ buyiWord: regex }, { chineseWord: regex }] }).limit(20).get(),
      db.collection('phrases').where({ status: 'published', $or: [{ buyiText: regex }, { chineseText: regex }] }).limit(20).get(),
      db.collection('proverbs').where({ status: 'published', $or: [{ buyiText: regex }, { chineseText: regex }] }).limit(20).get(),
      db.collection('songs').where({ status: 'published', $or: [{ title: regex }, { content: regex }] }).limit(20).get(),
    ]);

    return {
      body: {
        code: 0,
        data: {
          dictionary: dictRes.data || [],
          phrases: phraseRes.data || [],
          proverbs: proverbRes.data || [],
          songs: songRes.data || [],
        },
      },
    };
  }

  // ========== 小程序 - 搜索建议 ==========
  if (path === '/api/miniapp/search/suggest' && method === 'GET') {
    const keyword = query.keyword || '';
    if (!keyword || keyword.length < 1) {
      return { body: { code: 0, data: [] } };
    }
    const regex = db.RegExp({ regexp: keyword, options: 'i' });
    const res = await db.collection('dictionary')
      .where({ status: 'published', $or: [{ buyiWord: regex }, { chineseWord: regex }] })
      .field({ buyiWord: true, chineseWord: true, _id: true })
      .limit(10)
      .get();
    return { body: { code: 0, data: res.data || [] } };
  }

  // ========== 小程序 - 短语列表 ==========
  if (path === '/api/miniapp/phrases' && method === 'GET') {
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 20;
    const status = query.status || 'published';

    let collection = db.collection('phrases');
    if (status) collection = collection.where({ status });

    const total = (await collection.count()).total;
    const list = await collection.skip((page - 1) * pageSize).limit(pageSize).get();

    return {
      body: {
        code: 0,
        data: { list: list.data || [], total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
      },
    };
  }

  // ========== 小程序 - 谚语列表 ==========
  if (path === '/api/miniapp/proverbs' && method === 'GET') {
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 20;
    const status = query.status || 'published';

    let collection = db.collection('proverbs');
    if (status) collection = collection.where({ status });

    const total = (await collection.count()).total;
    const list = await collection.skip((page - 1) * pageSize).limit(pageSize).get();

    return {
      body: {
        code: 0,
        data: { list: list.data || [], total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
      },
    };
  }

  // ========== 小程序 - 民歌列表 ==========
  if (path === '/api/miniapp/songs' && method === 'GET') {
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 20;
    const status = query.status || 'published';

    let collection = db.collection('songs');
    if (status) collection = collection.where({ status });

    const total = (await collection.count()).total;
    const list = await collection.skip((page - 1) * pageSize).limit(pageSize).get();

    return {
      body: {
        code: 0,
        data: { list: list.data || [], total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
      },
    };
  }

  // ========== 小程序 - 收藏列表 ==========
  if (path === '/api/miniapp/favorites' && method === 'GET') {
    const userId = query.userId || query.openid || '';
    if (!userId) {
      return { body: { code: 0, data: { list: [], total: 0 } } };
    }
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 20;

    let collection = db.collection('favorites').where({ userId });
    const total = (await collection.count()).total;
    const list = await collection.skip((page - 1) * pageSize).limit(pageSize).get();

    return {
      body: {
        code: 0,
        data: { list: list.data || [], total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
      },
    };
  }

  // ========== 小程序 - 切换收藏 ==========
  if (path === '/api/miniapp/favorites/toggle' && method === 'POST') {
    const { userId, contentId, contentType } = body;
    if (!userId || !contentId) {
      return { statusCode: 400, body: { code: 400, message: '缺少必要参数' } };
    }

    const existing = await db.collection('favorites').where({ userId, contentId }).get();
    if (existing.data && existing.data.length > 0) {
      await db.collection('favorites').doc(existing.data[0]._id).remove();
      return { body: { code: 0, data: { favorited: false }, message: '已取消收藏' } };
    } else {
      const res = await db.collection('favorites').add({
        userId,
        contentId,
        contentType: contentType || 'dictionary',
        createdAt: Date.now(),
      });
      return { body: { code: 0, data: { favorited: true, id: res.id }, message: '收藏成功' } };
    }
  }

  // ========== 小程序 - 学习记录 ==========
  if (path === '/api/miniapp/learning-records') {
    const userId = query.userId || body.userId || '';
    if (!userId) {
      return { statusCode: 400, body: { code: 400, message: '缺少 userId' } };
    }

    if (method === 'GET') {
      const page = parseInt(query.page) || 1;
      const pageSize = parseInt(query.pageSize) || 20;
      let collection = db.collection('learning_records').where({ userId }).orderBy('createdAt', 'desc');
      const total = (await collection.count()).total;
      const list = await collection.skip((page - 1) * pageSize).limit(pageSize).get();
      return {
        body: {
          code: 0,
          data: { list: list.data || [], total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
        },
      };
    }

    if (method === 'POST') {
      const { contentId, contentType, progress, score } = body;
      if (!contentId) {
        return { statusCode: 400, body: { code: 400, message: '缺少 contentId' } };
      }
      const res = await db.collection('learning_records').add({
        userId,
        contentId,
        contentType: contentType || 'dictionary',
        progress: progress || 0,
        score: score || 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return { body: { code: 0, data: { id: res.id }, message: '记录已保存' } };
    }

    if (method === 'DELETE') {
      const recordId = query.id || body.id;
      if (!recordId) {
        return { statusCode: 400, body: { code: 400, message: '缺少记录 ID' } };
      }
      await db.collection('learning_records').doc(recordId).remove();
      return { body: { code: 0, message: '记录已删除' } };
    }
  }

  // ========== 小程序 - 我的页面 ==========
  if (path === '/api/miniapp/me' && method === 'GET') {
    const userId = query.userId || query.openid || '';
    
    // 查询用户信息
    let userInfo = null;
    if (userId) {
      try {
        const userRes = await db.collection('users').where({ openid: userId }).get();
        if (userRes.data && userRes.data.length > 0) {
          const u = userRes.data[0];
          userInfo = {
            id: u._id,
            nickname: u.nickname || null,
            nickName: u.nickname || null,
            avatarUrl: u.avatarUrl || null,
            openid: u.openid || userId,
          };
        }
      } catch (err) {
        console.error('查询用户信息失败:', err);
      }
    }

    const [favCount, recordCount] = await Promise.all([
      userId ? (await db.collection('favorites').where({ userId }).count()).total : 0,
      userId ? (await db.collection('learning_records').where({ userId }).count()).total : 0,
    ]);
    return {
      body: {
        code: 0,
        data: {
          user: userInfo || { nickname: null, avatarUrl: null },
          userId,
          stats: { favoriteCount: favCount, learningRecordCount: recordCount },
        },
      },
    };
  }

  // ========== 小程序 - 设置 ==========
  if (path === '/api/miniapp/settings') {
    const userId = query.userId || body.userId || '';

    if (method === 'GET') {
      if (!userId) return { body: { code: 0, data: { theme: 'light', fontSize: 'medium' } } };
      const res = await db.collection('user_settings').where({ userId }).get();
      return { body: { code: 0, data: (res.data && res.data[0]) || { theme: 'light', fontSize: 'medium' } } };
    }

    if (method === 'PUT') {
      if (!userId) return { statusCode: 400, body: { code: 400, message: '缺少 userId' } };
      const existing = await db.collection('user_settings').where({ userId }).get();
      const settings = { userId, ...body, updatedAt: Date.now() };
      if (existing.data && existing.data.length > 0) {
        await db.collection('user_settings').doc(existing.data[0]._id).update(settings);
      } else {
        settings.createdAt = Date.now();
        await db.collection('user_settings').add(settings);
      }
      return { body: { code: 0, message: '设置已保存' } };
    }
  }

  // ========== 小程序 - 微信登录 ==========
  if (path === '/api/miniapp/auth/wechat-login' && method === 'POST') {
    const { code, nickname, avatarUrl } = body;
    if (!code) {
      return { statusCode: 400, body: { code: 400, message: '缺少登录凭证 code' } };
    }

    // 调用微信 code2Session 换取 openid
    let openid = '';
    try {
      const wxRes = await app.callFunction({
        name: 'login',
        data: { code, nickname: nickname || '微信用户', avatarUrl: avatarUrl || '' },
      });
      if (wxRes && wxRes.result) {
        openid = wxRes.result.openid;
      }
    } catch (err) {
      console.error('调用云函数 login 失败:', err);
      // 降级：直接操作数据库
      openid = `anonymous_${Date.now()}`;
    }

    if (openid) {
      const now = new Date();
      try {
        const userQuery = await db.collection('users').where({ openid }).get();
        if (userQuery.data && userQuery.data.length > 0) {
          await db.collection('users').doc(userQuery.data[0]._id).update({
            nickname: nickname || userQuery.data[0].nickname,
            avatarUrl: avatarUrl || userQuery.data[0].avatarUrl,
            updateTime: now,
            lastLoginTime: now,
          });
        } else {
          await db.collection('users').add({
            openid,
            nickname: nickname || '微信用户',
            avatarUrl: avatarUrl || '',
            createTime: now,
            updateTime: now,
            lastLoginTime: now,
          });
        }
      } catch (dbErr) {
        console.error('数据库用户操作失败:', dbErr);
      }
    }

    return {
      body: {
        code: 0,
        data: {
          accessToken: 'miniapp-token-placeholder',
          refreshToken: 'refresh-token-placeholder',
          user: {
            id: openid,
            openid,
            nickname: nickname || '微信用户',
            avatarUrl: avatarUrl || '',
          },
          settings: { theme: 'light', fontSize: 'medium' },
        },
      },
    };
  }

  // ========== 404 ==========
  return {
    statusCode: 404,
    body: { code: 404, message: `接口不存在: ${method} ${path}` },
  };
}

/**
 * 获取集合中符合条件的记录数
 */
async function getCount(db, collectionName, status) {
  try {
    let collection = db.collection(collectionName);
    if (status) collection = collection.where({ status });
    const result = await collection.count();
    return result.total || 0;
  } catch {
    return 0;
  }
}
