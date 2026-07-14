import paramiko

HOST = "39.105.201.88"
USER = "root"
PASS = "gsq060606.@"

conf = r"""server {
    listen 80;
    server_name _;

    root /var/www/buyi-dictionary;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3000/uploads/;
        proxy_set_header Host $host;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1024;
}
"""

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS, timeout=30)

sftp = ssh.open_sftp()
with sftp.file("/etc/nginx/sites-available/buyi-dictionary", "w") as f:
    f.write(conf)
sftp.close()

stdin, stdout, stderr = ssh.exec_command(
    "ln -sf /etc/nginx/sites-available/buyi-dictionary /etc/nginx/sites-enabled/buyi-dictionary "
    "&& rm -f /etc/nginx/sites-enabled/default "
    "&& nginx -t "
    "&& systemctl reload nginx "
    "&& echo NGINX_RELOADED"
)
print(stdout.read().decode())
print(stderr.read().decode())
ssh.close()
