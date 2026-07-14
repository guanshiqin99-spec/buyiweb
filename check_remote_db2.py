import paramiko

HOST = "39.105.201.88"
USER = "root"
PASS = "gsq060606.@"

py_code = """
import sqlite3
conn = sqlite3.connect('/root/buyi-backend/buyi-prod.sqlite')
cur = conn.cursor()
for t in ['dictionary_entries','phrases','proverbs','songs','users']:
    cur.execute('SELECT COUNT(*) FROM ' + t)
    print(t + ': ' + str(cur.fetchone()[0]))
conn.close()
"""

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS, timeout=30)

sftp = ssh.open_sftp()
with sftp.file('/tmp/check_db.py', 'w') as f:
    f.write(py_code)
sftp.close()

stdin, stdout, stderr = ssh.exec_command("python3 /tmp/check_db.py")
print(stdout.read().decode())
err = stderr.read().decode()
if err:
    print("ERR:", err)
ssh.close()
