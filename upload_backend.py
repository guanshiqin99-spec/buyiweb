# 安全实践：使用环境变量或 SSH 密钥，不硬编码口令
import paramiko
import os
import sys
import zipfile
import io

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


def _load_pkey(key_filename):
    """尝试以多种密钥类型加载私钥，兼容 RSA/Ed25519/ECDSA/DSS。"""
    for cls in (paramiko.Ed25519Key, paramiko.ECDSAKey, paramiko.RSAKey, paramiko.DSSKey):
        try:
            return cls.from_private_key_file(key_filename)
        except paramiko.SSHException:
            continue
    raise paramiko.SSHException(f'无法加载 SSH 私钥: {key_filename}')


BACKEND_LOCAL = r"d:\BuyiDictionaryWeb\BuyiDictionaryApp-main\BuyiDictionaryApp-main\backend"
REMOTE_DIR = "/root/buyi-backend"


def create_zip():
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(BACKEND_LOCAL):
            rel = os.path.relpath(root, BACKEND_LOCAL)
            if rel.startswith('node_modules') or rel == '.':
                pass
            if 'node_modules' in dirs:
                dirs.remove('node_modules')
            if '.git' in dirs:
                dirs.remove('.git')
            for f in files:
                if f.endswith('.sqlite') or f.endswith('.db') or f.endswith('.log'):
                    continue
                if f.startswith('.env') and not f.startswith('.env.example'):
                    continue
                full = os.path.join(root, f)
                arc = os.path.join(rel, f) if rel != '.' else f
                arc = arc.replace('\\', '/')
                zf.write(full, arc)
    buf.seek(0)
    return buf


def upload_and_extract():
    transport = paramiko.Transport((HOST, 22))
    if KEY_FILENAME:
        transport.connect(username=USER, pkey=_load_pkey(KEY_FILENAME))
    else:
        transport.connect(username=USER, password=PASS)
    sftp = paramiko.SFTPClient.from_transport(transport)

    print("Creating zip...")
    zip_buf = create_zip()
    zip_size = len(zip_buf.getvalue())
    print(f"Zip size: {zip_size / 1024 / 1024:.2f} MB")

    remote_zip = "/tmp/backend.zip"
    print(f"Uploading to {remote_zip}...")
    with sftp.file(remote_zip, 'w') as f:
        f.write(zip_buf.getvalue())
    print("Upload done.")

    ssh = paramiko.SSHClient()
    ssh._transport = transport
    stdin, stdout, stderr = ssh.exec_command(
        f"mkdir -p {REMOTE_DIR} && cd {REMOTE_DIR} && unzip -o /tmp/backend.zip && rm /tmp/backend.zip && ls -la"
    )
    out = stdout.read().decode()
    err = stderr.read().decode()
    print(out)
    if err:
        print("STDERR:", err)

    sftp.close()
    transport.close()


if __name__ == "__main__":
    upload_and_extract()
