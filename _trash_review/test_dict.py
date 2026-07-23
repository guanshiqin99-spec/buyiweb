import urllib.request
import json

BASE = "http://39.105.201.88"

req = urllib.request.Request(BASE + "/api/miniapp/dictionary?page=1&pageSize=10")
with urllib.request.urlopen(req, timeout=15) as resp:
    data = json.loads(resp.read().decode())
    print("Status:", resp.status)
    print("Response keys:", list(data.keys()))
    d = data.get("data", data)
    if isinstance(d, dict):
        print("Data keys:", list(d.keys()))
        items = d.get("items", d.get("list", []))
        total = d.get("total", d.get("count", "unknown"))
        print("Total:", total)
        print("Items in page:", len(items))
        for item in items[:5]:
            print(" -", item.get("buyiText"), "=", item.get("zhText"))
    elif isinstance(d, list):
        print("List len:", len(d))
