import paramiko
import sys

HOST = '39.105.222.204'
USER = 'root'
PASS = 'gsq060606.@'

NGINX_CONF = """server {
    listen 80;
    server_name _;

    client_max_body_size 20m;

    # API 请求转发给后端
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        proxy_buffering off;
    }

    # 后台管理页面（由后端提供）
    location /admin-web/ {
        proxy_pass http://127.0.0.1:3000/admin-web/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 媒体资源
    location /uploads/ {
        proxy_pass http://127.0.0.1:3000/uploads/;
        proxy_set_header Host $host;
    }

    # Swagger 文档
    location /api-docs/ {
        proxy_pass http://127.0.0.1:3000/api-docs/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /swagger-ui/ {
        proxy_pass http://127.0.0.1:3000/swagger-ui/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1024;
}
"""

def connect_ssh():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS, timeout=30)
    return ssh

def run_cmd(ssh, cmd, timeout=120):
    sys.stdout.write(f"\n[CMD] {cmd}\n")
    sys.stdout.flush()
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode()
    err = stderr.read().decode()
    rc = stdout.channel.recv_exit_status()
    if out:
        sys.stdout.write(out)
        sys.stdout.flush()
    if err:
        sys.stdout.write(f"[STDERR] {err}\n")
        sys.stdout.flush()
    return rc, out, err

def write_file(ssh, remote_path, content):
    sftp = ssh.open_sftp()
    with sftp.file(remote_path, 'w') as f:
        f.write(content)
    sftp.close()
    print(f"Written: {remote_path}")

if __name__ == "__main__":
    ssh = connect_ssh()
    print("Connected!")
    
    # 检查Nginx配置目录
    print("\n=== Checking Nginx config ===")
    run_cmd(ssh, "ls -la /etc/nginx/sites-available/")
    run_cmd(ssh, "ls -la /etc/nginx/sites-enabled/")
    
    # 写入配置
    print("\n=== Writing Nginx config ===")
    write_file(ssh, "/etc/nginx/sites-available/buyi-backend", NGINX_CONF)
    
    # 启用站点
    print("\n=== Enabling site ===")
    run_cmd(ssh, "ln -sf /etc/nginx/sites-available/buyi-backend /etc/nginx/sites-enabled/buyi-backend")
    run_cmd(ssh, "rm -f /etc/nginx/sites-enabled/default")
    
    # 测试配置
    print("\n=== Testing Nginx config ===")
    rc, out, err = run_cmd(ssh, "nginx -t")
    
    if rc == 0:
        # 重载Nginx
        print("\n=== Reloading Nginx ===")
        run_cmd(ssh, "systemctl reload nginx")
        run_cmd(ssh, "systemctl status nginx --no-pager")
        
        # 测试公网访问
        print("\n=== Testing public access ===")
        run_cmd(ssh, "curl -s http://39.105.222.204/api/health 2>&1")
    else:
        print("\n❌ Nginx config test failed!")
    
    ssh.close()
    print("\nDone!")
