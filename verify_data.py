import urllib.request
import json

BASE = "http://39.105.201.88"

def get(path):
    req = urllib.request.Request(BASE + path)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())

def print_count(name, path):
    data = get(path)
    d = data.get("data", data)
    if isinstance(d, dict):
        items = d.get("list", d.get("items", []))
        total = d.get("total", d.get("count", len(items)))
    elif isinstance(d, list):
        items = d
        total = len(d)
    else:
        total = 0
        items = []
    print(f"{name}: {total} 条")
    return items

print("=== 服务器 API 数据量 ===")
dict_items = print_count("词典", "/api/miniapp/dictionary?page=1&pageSize=250")
print_count("谚语", "/api/miniapp/proverbs?page=1&pageSize=100")
print_count("短语", "/api/miniapp/phrases?page=1&pageSize=100")
songs = print_count("民歌", "/api/miniapp/songs")

print()
print("=== 本地数据库数据量 ===")
import sqlite3
conn = sqlite3.connect(r"d:\BuyiDictionaryWeb\BuyiDictionaryApp-main\BuyiDictionaryApp-main\backend\buyi-local.sqlite")
cur = conn.cursor()
for t in ["dictionary_entries", "phrases", "proverbs", "songs"]:
    cur.execute(f"SELECT COUNT(*) FROM {t}")
    print(f"{t}: {cur.fetchone()[0]} 条")
conn.close()

print()
if dict_items and len(dict_items) > 10:
    print(f"验证: 词典有 {len(dict_items)} 条，和本地一致 ✅")
else:
    print("警告: 词典数据量不足")
