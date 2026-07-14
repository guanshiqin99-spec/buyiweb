import paramiko
import os
import zipfile
import io

HOST = "39.105.201.88"
USER = "root"
PASS = "gsq060606.@"
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
