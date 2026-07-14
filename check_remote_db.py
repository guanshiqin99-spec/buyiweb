# 安全实践：使用环境变量或 SSH 密钥，不硬编码口令
import paramiko
import os
import sys

HOST = os.environ.get('SSH_HOST')
USER = os.environ.get('SSH_USER', 'root')
PASS = os.environ.get('SSH_PASS')
KEY_FILENAME = os.environ.get('SSH_KEY_FILENAME')

if not HOST:
    print('[error] 缺少必需的环境变量: SSH_HOST', file=sys.stderr)
    print('请通过环境变量提供 SSH 主机，优先使用 SSH_KEY_FILENAME 进行密钥认证。', file=sys.stderr)
    sys.exit(1)
if not KEY_FILENAME and not PASS:
    print('[error] 未配置认证方式：请设置 SSH_KEY_FILENAME (推荐) 或 SSH_PASS 环境变量。', file=sys.stderr)
    sys.exit(1)

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
ssh.connect(
    HOST,
    username=USER,
    key_filename=KEY_FILENAME,
    password=PASS,
    timeout=30,
)

stdin, stdout, stderr = ssh.exec_command(f"python3 -c {__import__('shlex').quote(script)}")
print(stdout.read().decode())
err = stderr.read().decode()
if err:
    print("STDERR:", err)
ssh.close()
