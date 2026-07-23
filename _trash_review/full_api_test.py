import urllib.request
import urllib.error
import urllib.parse
import json

BASE = "http://39.105.201.88"

def test(name, path, method="GET", body=None, token=None):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    hdrs = {"Content-Type": "application/json"} if body else {}
    if token:
        hdrs["Authorization"] = "Bearer " + token
    try:
        req = urllib.request.Request(url, data=data, headers=hdrs, method=method)
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read().decode())
            print(f"  {resp.status} {name}")
            return result
    except urllib.error.HTTPError as e:
        body_text = e.read().decode()[:120]
        print(f"  {e.code} {name} - {body_text}")
        return None

print("=== 公开接口测试 ===")
test("首页", "/api/miniapp/home")
test("词典列表", "/api/miniapp/dictionary?page=1&pageSize=5")
test("谚语列表", "/api/miniapp/proverbs?page=1&pageSize=5")
test("短语列表", "/api/miniapp/phrases?page=1&pageSize=5")
test("民歌列表", "/api/miniapp/songs")
test("搜索(中文)", "/api/miniapp/search?q=" + urllib.parse.quote("你好"))
test("文化列表", "/api/miniapp/culture?page=1&pageSize=5")
test("词典详情", "/api/miniapp/dictionary/1")

print()
print("=== 认证接口测试 ===")
test("注册", "/api/miniapp/auth/web-register", "POST",
     {"username": "testuser3", "password": "test123456"})

login_res = test("登录", "/api/miniapp/auth/web-login", "POST",
                 {"username": "testuser3", "password": "test123456"})

token = None
if login_res:
    token = login_res.get("accessToken") or login_res.get("token")
    if not token and isinstance(login_res.get("data"), dict):
        token = login_res["data"].get("accessToken")
    print(f"  获取 token: {bool(token)}")

if token:
    print()
    print("=== 登录后接口测试 ===")
    test("用户信息", "/api/miniapp/me", "GET", None, token)
    test("学习统计", "/api/miniapp/learning-records/stats", "GET", None, token)
    test("收藏列表", "/api/miniapp/favorites?page=1&pageSize=5", "GET", None, token)
    test("徽章列表", "/api/miniapp/badges", "GET", None, token)
    test("收藏词条", "/api/miniapp/favorites", "POST",
         {"entryId": 1, "type": "dictionary"}, token)

print()
print("=== 测试完成 ===")
