# 安全实践：使用环境变量或 SSH 密钥，不硬编码口令
import paramiko
import os
import sys
import time

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


def _connect():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(
        HOST,
        username=USER,
        key_filename=KEY_FILENAME,
        password=PASS,
        timeout=30,
    )
    return ssh


def run_ssh(cmd, timeout=60):
    ssh = _connect()
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode()
    err = stderr.read().decode()
    rc = stdout.channel.recv_exit_status()
    ssh.close()
    return rc, out, err


def run_shell(script, timeout=300):
    ssh = _connect()
    chan = ssh.invoke_shell()
    chan.settimeout(timeout)
    time.sleep(1)
    chan.recv(4096)
    chan.send(script + "\n")
    time.sleep(2)
    output = ""
    end_time = time.time() + timeout
    while time.time() < end_time:
        if chan.recv_ready():
            data = chan.recv(8192).decode()
            output += data
            print(data, end="")
        time.sleep(0.5)
    ssh.close()
    return output


if __name__ == "__main__":
    cmd = sys.argv[1]
    timeout = int(sys.argv[2]) if len(sys.argv) > 2 else 120
    rc, out, err = run_ssh(cmd, timeout)
    print(out)
    if err:
        print("STDERR:", err)
    print("EXIT:", rc)
