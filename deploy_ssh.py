import paramiko
import time

HOST = "39.105.201.88"
USER = "root"
PASS = "gsq060606.@"


def run_ssh(cmd, timeout=60):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS, timeout=30)
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode()
    err = stderr.read().decode()
    rc = stdout.channel.recv_exit_status()
    ssh.close()
    return rc, out, err


def run_shell(script, timeout=300):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS, timeout=30)
    chan = ssh.invoke_shell()
    chan.settimeout(timeout)
    time.sleep(1)
    chan.recv(4096)
    chan.send(script + "\n")
    time.sleep(2)
    output = ""
    end_time = time.time() + timeout
    while time.time() < end_time:
        if chan.recv_ready():
            data = chan.recv(8192).decode()
            output += data
            print(data, end="")
        time.sleep(0.5)
    ssh.close()
    return output


if __name__ == "__main__":
    import sys
    cmd = sys.argv[1]
    timeout = int(sys.argv[2]) if len(sys.argv) > 2 else 120
    rc, out, err = run_ssh(cmd, timeout)
    print(out)
    if err:
        print("STDERR:", err)
    print("EXIT:", rc)
