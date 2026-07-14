import paramiko
import os
import zipfile
import io

HOST = "39.105.201.88"
USER = "root"
PASS = "gsq060606.@"
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
