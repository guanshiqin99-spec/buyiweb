import paramiko

HOST = "39.105.201.88"
USER = "root"
PASS = "gsq060606.@"
LOCAL_DB = r"d:\BuyiDictionaryWeb\BuyiDictionaryApp-main\BuyiDictionaryApp-main\backend\buyi-local.sqlite"
REMOTE_DB = "/root/buyi-backend/buyi-prod.sqlite"

transport = paramiko.Transport((HOST, 22))
transport.connect(username=USER, password=PASS)
sftp = paramiko.SFTPClient.from_transport(transport)

print(f"Uploading {LOCAL_DB} -> {REMOTE_DB}")
sftp.put(LOCAL_DB, REMOTE_DB)
print("Upload done.")

sftp.close()
transport.close()
print("Done.")
