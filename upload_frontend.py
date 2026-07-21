import paramiko
import os
import zipfile

HOST = '39.105.222.204'
USER = 'root'
PASSWORD = 'gsq060606.@'
LOCAL_DIST = r'd:\BuyiDictionaryWeb\buyi-dictionary-vue\dist'
REMOTE_DIR = '/var/www/buyi-web'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=15)
    print('=== 连接成功 ===')
    
    # 先打包 dist 目录
    print('\n1. 打包前端文件...')
    zip_path = r'd:\BuyiDictionaryWeb\dist.zip'
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(LOCAL_DIST):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, LOCAL_DIST)
                zipf.write(file_path, arcname)
    print(f'   打包完成: {zip_path}')
    
    # 上传 zip 文件
    print('\n2. 上传到服务器...')
    sftp = ssh.open_sftp()
    sftp.put(zip_path, '/tmp/dist.zip')
    sftp.close()
    print('   上传完成')
    
    # 解压
    print('\n3. 解压到目标目录...')
    stdin, stdout, stderr = ssh.exec_command(f'unzip -o /tmp/dist.zip -d {REMOTE_DIR}')
    print(stdout.read().decode())
    print(stderr.read().decode())
    
    # 设置权限
    stdin, stdout, stderr = ssh.exec_command(f'chown -R www-data:www-data {REMOTE_DIR} && chmod -R 755 {REMOTE_DIR}')
    print('   权限设置完成')
    
    # 重载 Nginx
    print('\n4. 重载 Nginx...')
    stdin, stdout, stderr = ssh.exec_command('systemctl reload nginx')
    print(stdout.read().decode())
    print(stderr.read().decode())
    
    # 测试访问
    print('\n5. 测试访问...')
    import urllib.request
    try:
        resp = urllib.request.urlopen('http://39.105.222.204/', timeout=10)
        print(f'   首页状态码: {resp.status}')
        content = resp.read().decode('utf-8', errors='ignore')
        print(f'   首页内容长度: {len(content)} 字节')
    except Exception as e:
        print(f'   首页访问失败: {e}')
    
    try:
        resp = urllib.request.urlopen('http://39.105.222.204/api/health', timeout=10)
        print(f'   API健康检查: {resp.read().decode()}')
    except Exception as e:
        print(f'   API访问失败: {e}')
    
    ssh.close()
    
    # 清理本地 zip
    os.remove(zip_path)
    
    print('\n=== 部署完成 ===')
    print(f'访问地址: http://39.105.222.204/')
    
except Exception as e:
    print(f'错误: {e}')
    import traceback
    traceback.print_exc()
    ssh.close()
