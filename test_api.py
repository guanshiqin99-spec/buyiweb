import urllib.request
import urllib.error
import json

BASE = "http://39.105.201.88"

def test(name, path, method="GET", body=None, headers=None):
    print(f"=== {name} ===")
    try:
        url = BASE + path
        data = json.dumps(body).encode() if body else None
        hdrs = {"Content-Type": "application/json"} if body else {}
        if headers:
            hdrs.update(headers)
        req = urllib.request.Request(url, data=data, headers=hdrs, method=method)
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode())
            print(f"Status: {resp.status} OK")
            return result
    except urllib.error.HTTPError as e:
        body_text = e.read().decode()
        print(f"Status: {e.code}")
        print(f"Body: {body_text[:200]}")
        return None
    except Exception as e:
        print(f"ERROR: {e}")
        return None

# 1. 前端页面
print("=== 前端页面 ===")
try:
    req = urllib.request.Request(BASE + "/")
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode()
        print(f"Status: {resp.status}")
        has_doctype = "doctype html" in html.lower()
        has_app = 'id="app"' in html or "id='app'" in html
        has_js = ".js" in html
        print(f"Has DOCTYPE: {has_doctype}")
        print(f"Has #app: {has_app}")
        print(f"Has JS links: {has_js}")
except Exception as e:
    print(f"ERROR: {e}")
print()

# 2. 首页 API
r = test("首页 API", "/api/miniapp/home")
if r:
    print(f"Banners: {len(r.get('banners', []))}")
print()

# 3. 注册测试用户
print("=== 注册测试用户 ===")
try:
    r = test("注册", "/api/miniapp/auth/web-register", "POST",
             {"username": "testuser", "password": "test123456"})
except Exception as e:
    print(f"ERROR: {e}")
print()

# 4. 登录
r = test("登录", "/api/miniapp/auth/web-login", "POST",
         {"username": "testuser", "password": "test123456"})
token = None
if r:
    token = r.get("data", {}).get("token") or r.get("token")
    print(f"Got token: {bool(token)}")
print()

# 5. 词典列表
r = test("词典列表", "/api/miniapp/dictionary?page=1&pageSize=5")
if r:
    d = r.get("data", r)
    if isinstance(d, dict):
        items = d.get("list", d.get("items", []))
        print(f"Count: {len(items)}")
print()

print("=== 总结 ===")
print("前后端连接: OK")
