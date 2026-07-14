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


def _load_pkey(key_filename):
    """尝试以多种密钥类型加载私钥，兼容 RSA/Ed25519/ECDSA/DSS。"""
    for cls in (paramiko.Ed25519Key, paramiko.ECDSAKey, paramiko.RSAKey, paramiko.DSSKey):
        try:
            return cls.from_private_key_file(key_filename)
        except paramiko.SSHException:
            continue
    raise paramiko.SSHException(f'无法加载 SSH 私钥: {key_filename}')


LOCAL_DB = r"d:\BuyiDictionaryWeb\BuyiDictionaryApp-main\BuyiDictionaryApp-main\backend\buyi-local.sqlite"
REMOTE_DB = "/root/buyi-backend/buyi-prod.sqlite"

transport = paramiko.Transport((HOST, 22))
if KEY_FILENAME:
    transport.connect(username=USER, pkey=_load_pkey(KEY_FILENAME))
else:
    transport.connect(username=USER, password=PASS)
sftp = paramiko.SFTPClient.from_transport(transport)

print(f"Uploading {LOCAL_DB} -> {REMOTE_DB}")
sftp.put(LOCAL_DB, REMOTE_DB)
print("Upload done.")

sftp.close()
transport.close()
print("Done.")
