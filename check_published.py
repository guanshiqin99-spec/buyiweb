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

py_code = """
import sqlite3
conn = sqlite3.connect('/root/buyi-backend/buyi-prod.sqlite')
cur = conn.cursor()
cur.execute('SELECT COUNT(*) FROM dictionary_entries WHERE isPublished = 1')
print('published:', cur.fetchone()[0])
cur.execute('SELECT COUNT(*) FROM dictionary_entries WHERE isPublished = 0')
print('unpublished:', cur.fetchone()[0])
cur.execute('SELECT id, buyiText, zhText, isPublished FROM dictionary_entries LIMIT 5')
for r in cur.fetchall():
    print(r)
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

sftp = ssh.open_sftp()
with sftp.file('/tmp/check_pub.py', 'w') as f:
    f.write(py_code)
sftp.close()

stdin, stdout, stderr = ssh.exec_command("python3 /tmp/check_pub.py")
print(stdout.read().decode())
err = stderr.read().decode()
if err:
    print("ERR:", err)
ssh.close()
