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


FRONTEND_DIST = r"d:\BuyiDictionaryWeb\buyi-dictionary-vue\dist"
REMOTE_WEB = "/var/www/buyi-dictionary"


def create_zip():
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(FRONTEND_DIST):
            rel = os.path.relpath(root, FRONTEND_DIST)
            for f in files:
                full = os.path.join(root, f)
                arc = os.path.join(rel, f) if rel != '.' else f
                arc = arc.replace('\\', '/')
                zf.write(full, arc)
    buf.seek(0)
    return buf


def main():
    transport = paramiko.Transport((HOST, 22))
    if KEY_FILENAME:
        transport.connect(username=USER, pkey=_load_pkey(KEY_FILENAME))
    else:
        transport.connect(username=USER, password=PASS)
    sftp = paramiko.SFTPClient.from_transport(transport)

    print("Creating zip...")
    zip_buf = create_zip()
    print(f"Zip size: {len(zip_buf.getvalue()) / 1024:.1f} KB")

    remote_zip = "/tmp/frontend.zip"
    print("Uploading...")
    with sftp.file(remote_zip, 'w') as f:
        f.write(zip_buf.getvalue())
    print("Upload done.")

    ssh = paramiko.SSHClient()
    ssh._transport = transport
    cmd = (
        f"mkdir -p {REMOTE_WEB} && "
        f"cd {REMOTE_WEB} && "
        f"rm -rf * && "
        f"unzip -o /tmp/frontend.zip && "
        f"rm /tmp/frontend.zip && "
        f"ls -la"
    )
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err:
        print("STDERR:", err)

    sftp.close()
    transport.close()


if __name__ == "__main__":
    main()
