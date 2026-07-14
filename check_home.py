import urllib.request
import json

BASE = "http://39.105.201.88"

def get(path):
    req = urllib.request.Request(BASE + path)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())

home = get("/api/miniapp/home")
print("=== 首页返回结构 ===")
print("顶层 keys:", list(home.keys()))

banners = home.get("banners", [])
print(f"\nbanners: {len(banners)} 条")
if banners:
    print("  第一条 keys:", list(banners[0].keys()))
    print("  第一条:", json.dumps(banners[0], ensure_ascii=False)[:200])

cats = home.get("categories", [])
print(f"\ncategories: {len(cats)} 条")
if cats:
    print("  第一条:", json.dumps(cats[0], ensure_ascii=False)[:200])

songs = home.get("featuredSongs", home.get("songs", []))
print(f"\nfeaturedSongs/songs: {len(songs)} 条")

daily = home.get("dailyWord", home.get("daily", {}))
print(f"\ndailyWord: {json.dumps(daily, ensure_ascii=False)[:200]}")

print("\n=== 全部顶层字段 ===")
for k in home.keys():
    v = home[k]
    if isinstance(v, list):
        print(f"  {k}: list({len(v)})")
    elif isinstance(v, dict):
        print(f"  {k}: dict({list(v.keys())})")
    else:
        print(f"  {k}: {type(v).__name__} = {str(v)[:50]}")
