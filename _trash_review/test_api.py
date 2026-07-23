import paramiko
import sys

HOST = '39.105.222.204'
USER = 'root'
PASS = 'gsq060606.@'

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

if __name__ == "__main__":
    ssh = connect_ssh()
    print("Connected!")
    
    # 禁用旧的配置
    print("\n=== Disabling old nginx config ===")
    run_cmd(ssh, "rm -f /etc/nginx/sites-enabled/buyi-dictionary")
    run_cmd(ssh, "nginx -t")
    run_cmd(ssh, "systemctl reload nginx")
    
    # 测试各种API
    print("\n=== Testing API endpoints ===")
    
    print("\n--- Health check ---")
    run_cmd(ssh, "curl -s http://39.105.222.204/api/health")
    
    print("\n--- Dictionary list ---")
    run_cmd(ssh, "curl -s 'http://39.105.222.204/api/miniapp/dictionary?page=1&pageSize=5'")
    
    print("\n--- Search ---")
    run_cmd(ssh, "curl -s 'http://39.105.222.204/api/miniapp/search?q=你好'")
    
    print("\n--- Songs list ---")
    run_cmd(ssh, "curl -s 'http://39.105.222.204/api/miniapp/songs?page=1&pageSize=5'")
    
    print("\n--- Phrases list ---")
    run_cmd(ssh, "curl -s 'http://39.105.222.204/api/miniapp/phrases?page=1&pageSize=5'")
    
    print("\n--- Proverbs list ---")
    run_cmd(ssh, "curl -s 'http://39.105.222.204/api/miniapp/proverbs?page=1&pageSize=5'")
    
    print("\n--- Home page ---")
    run_cmd(ssh, "curl -s http://39.105.222.204/api/miniapp/home")
    
    print("\n--- Admin login (test) ---")
    run_cmd(ssh, "curl -s -X POST http://39.105.222.204/api/admin/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"Admin@123456\"}'")
    
    ssh.close()
    print("\nDone!")
