import paramiko

HOST = "39.105.201.88"
USER = "root"
PASS = "gsq060606.@"

script = """
import sqlite3, os
db_path = '/root/buyi-backend/buyi-prod.sqlite'
if not os.path.exists(db_path):
    print('DB_NOT_FOUND')
else:
    print(f'Size: {os.path.getsize(db_path)/1024:.1f} KB')
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [r[0] for r in cur.fetchall()]
    print(f'Tables: {len(tables)}')
    for t in tables:
        cur.execute(f'SELECT COUNT(*) FROM {t}')
        cnt = cur.fetchone()[0]
        if cnt > 0:
            print(f'  {t}: {cnt}')
    conn.close()
"""

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS, timeout=30)

stdin, stdout, stderr = ssh.exec_command(f"python3 -c {__import__('shlex').quote(script)}")
print(stdout.read().decode())
err = stderr.read().decode()
if err:
    print("STDERR:", err)
ssh.close()
