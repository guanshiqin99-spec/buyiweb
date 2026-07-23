import urllib.request
import json

BASE = "http://39.105.201.88"

# 注册一个新用户并登录
data = json.dumps({"username": "testuser_final", "password": "test123456"}).encode()
req = urllib.request.Request(
    BASE + "/api/miniapp/auth/web-register",
    data=data,
    headers={"Content-Type": "application/json"},
    method="POST"
)
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        result = json.loads(resp.read().decode())
        print("注册状态:", resp.status)
        print("注册返回:", json.dumps(result, indent=2, ensure_ascii=False))
except urllib.error.HTTPError as e:
    print("注册失败:", e.code, e.read().decode()[:200])

print()

# 登录
data = json.dumps({"username": "testuser_final", "password": "test123456"}).encode()
req = urllib.request.Request(
    BASE + "/api/miniapp/auth/web-login",
    data=data,
    headers={"Content-Type": "application/json"},
    method="POST"
)
with urllib.request.urlopen(req, timeout=10) as resp:
    result = json.loads(resp.read().decode())
    print("登录状态:", resp.status)
    print("登录返回 keys:", list(result.keys()))
    print("有 accessToken:", "accessToken" in result)
    print("有 token:", "token" in result)
    print("有 user:", "user" in result)
    if result.get("user"):
        print("user keys:", list(result["user"].keys()))
