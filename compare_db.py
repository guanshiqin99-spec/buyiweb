import sqlite3
import os

LOCAL_DB = r"d:\BuyiDictionaryWeb\BuyiDictionaryApp-main\BuyiDictionaryApp-main\backend\buyi-local.sqlite"

def count_db(db_path, label):
    print(f"\n=== {label} ===")
    if not os.path.exists(db_path):
        print(f"DB not found: {db_path}")
        return {}
    size = os.path.getsize(db_path)
    print(f"Size: {size / 1024:.1f} KB")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [r[0] for r in cursor.fetchall()]
    print(f"Tables: {len(tables)}")
    counts = {}
    for t in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {t}")
        cnt = cursor.fetchone()[0]
        counts[t] = cnt
        if cnt > 0:
            print(f"  {t}: {cnt}")
    conn.close()
    return counts

local_counts = count_db(LOCAL_DB, "本地数据库")

# 服务器上的，后面再对比
print("\n(服务器数据库请通过SSH查询)")
