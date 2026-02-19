# nyatictl

<p align="center">
  <strong>Remote server automation via SSH</strong>
</p>

<p align="center">
  <a href="https://npmjs.com/package/nyatictl"><img src="https://img.shields.io/npm/v/nyatictl?style=for-the-badge" alt="npm version"></a>
  <a href="https://npmjs.com/package/nyatictl"><img src="https://img.shields.io/npm/dt/nyatictl?style=for-the-badge" alt="npm downloads"></a>
</p>

Execute tasks on multiple servers from a YAML config. Deploy code, run scripts, manage servers — all from your terminal.

[npm](https://npmjs.com/package/nyatictl) · [Config Reference](#config) · [Templating](#templating) · [Architecture](#how-it-works)

## What you can do

- **Deploy applications** — Push code to multiple servers with one command
- **Run scripts** — Execute maintenance scripts across all your infrastructure
- **Server management** — Restart services, check status, manage configs
- **Parallel execution** — Run tasks across multiple hosts simultaneously
- **Custom parameters** — Define reusable variables for your tasks
- **Environment integration** — Securely reference env vars in configs
- **Template commands** — Use built-in variables in your commands

## Install

```bash
npm install -g nyatictl
```

Requires Node.js 18+ and SSH access to your servers.

## Quick Start

```bash
# 1. Create nyati.yaml (see Config section below)
# 2. Run on specific host
nyatictl production

# 3. Or run on all hosts
nyatictl all

# 4. Run specific task
nyatictl --task deploy production
```

## Config

Create `nyati.yaml` in your project root:

```yaml
appname: myapp
hosts:
  production:
    host: server.com
    username: admin
    password: "#env:PROD_PASSWORD"
tasks:
  - name: deploy
    cmd: ./deploy.sh
    expect: 0
    message: Deployed successfully
  - name: restart
    cmd: sudo systemctl restart app
    expect: 0
    askpass: true
```

## Commands

| Command | Description |
|---------|-------------|
| `nyatictl <host>` | Run all non-lib tasks on specified host |
| `nyatictl all` | Run all non-lib tasks on all hosts |
| `nyatictl --task <name> <host>` | Run specific task |
| `nyatictl --task <name> all` | Run specific task on all hosts |
| `nyatictl --conf <file> <host>` | Custom config file |
| `nyatictl --debug <host>` | Show detailed debug output |

## Templating

nyatictl supports variable substitution in commands, directories, and messages using `${variable}` syntax.

### Built-in Variables

| Variable | Description |
|----------|-------------|
| `${appname}` | Application name from config |
| `${host}` | Current host name (key in hosts) |
| `${dir}` | Base directory from config |
| `${release_version}` | Unix timestamp in milliseconds |

### Custom Parameters

Define in `params` section:

```yaml
appname: myapp
params:
  node_version: 18
  max_memory: 2gb
  backup_dir: /backups
hosts:
  production:
    host: server.com
    username: admin
    password: "#env:PASS"
tasks:
  - name: setup
    cmd: echo "Installing Node ${node_version}"
    expect: 0
  - name: backup
    cmd: pg_dump > ${backup_dir}/backup.sql
    expect: 0
```

### Environment Variables

Use `#env:VAR` for required or `#env?:VAR` for optional:

```yaml
hosts:
  production:
    host: server.com
    username: admin
    password: "#env:PROD_PASSWORD"    # Required - fails if not set
    passphrase: "#env?:SSH_PASSPHRASE" # Optional - empty if not set
```

## Host Options

```yaml
hosts:
  production:
    host: server.com              # Hostname or IP (required)
    username: deploy              # SSH username (required)
    port: 22                     # SSH port (default: 22)
    password: "#env:PASS"        # Password or env reference
    privateKey: ~/.ssh/id_rsa    # Path to SSH key
    passphrase: "#env?:KEY_PASS" # Key passphrase
    envpath: /etc/environment    # Source env file on remote
    envfile: .env                # Upload local env file
    output: true                 # Always show output
```

## Task Options

```yaml
tasks:
  - name: deploy                  # Task name (no spaces)
    cmd: ./deploy.sh             # Command to execute
    expect: 0                    # Expected exit code (default: 0)
    message: "Deployed!"         # Success message to print
    output: 1                    # Show stdout/stderr
    dir: /var/www/myapp          # Working directory
    retry: 1                     # Prompt retry on failure
    askpass: 1                   # Use sudo password
    error: 1                     # Custom error code tolerance
    hosts: [prod1, prod2]        # Run only on specific hosts
    lib: 1                       # Library task (run with --task)
```

## Examples

### 1. Deploy a Node.js App

```yaml
appname: myapp
dir: "/var/www/${appname}/"
hosts:
  production:
    host: 192.168.1.10
    username: deploy
    privateKey: ~/.ssh/id_rsa
tasks:
  - name: pull
    cmd: git pull origin main
    dir: /var/www/myapp
    expect: 0
  - name: install
    cmd: npm install --production
    dir: /var/www/myapp
    expect: 0
  - name: restart
    cmd: sudo systemctl restart myapp
    expect: 0
    askpass: true
```

### 2. Database Backup

```yaml
appname: myapp
params:
  backup_dir: /backups
hosts:
  production:
    host: db.server.com
    username: backup
    password: "#env:DB_PASS"
tasks:
  - name: backup
    cmd: pg_dump -U appuser myapp > ${backup_dir}/$(date +%Y%m%d).sql
    expect: 0
    message: Backup completed
  - name: cleanup
    cmd: find ${backup_dir} -mtime +7 -delete
    expect: 0
```

### 3. Health Check

```yaml
appname: myapp
hosts:
  prod1:
    host: server1.com
    username: admin
    password: "#env:PASS"
  prod2:
    host: server2.com
    username: admin
    password: "#env:PASS"
tasks:
  - name: check_disk
    cmd: df -h | grep '/dev/sda'
    expect: 0
    output: 1
  - name: check_memory
    cmd: free -h
    expect: 0
    output: 1
  - name: check_services
    cmd: systemctl is-active nginx
    expect: 0
    output: 1
```

### 4. Multiple Environments

```yaml
appname: myapp
hosts:
  staging:
    host: staging.server.com
    username: deploy
    password: "#env:STAGING_PASS"
  production:
    host: prod.server.com
    username: deploy
    password: "#env:PROD_PASS"
tasks:
  - name: deploy
    cmd: ./deploy.sh
    expect: 0
  - name: test
    cmd: curl -s http://localhost/health
    expect: 0
    output: 1
```

### 5. Library Tasks

Define utility tasks that run on-demand only:

```yaml
appname: myapp
hosts:
  production:
    host: server.com
    username: admin
    password: "#env:PASS"
tasks:
  - name: log_stats
    cmd: tail -n 100 /var/log/app.log
    expect: 0
    output: 1
    lib: 1
  - name: clear_cache
    cmd: rm -rf /tmp/cache/*
    expect: 0
    lib: 1
```

Run library tasks with `--task`:

```bash
nyatictl --task log_stats production
nyatictl --task clear_cache all
```

### 6. Selective Host Execution

Run tasks on specific hosts only:

```yaml
appname: myapp
hosts:
  db1:
    host: db1.server.com
    username: admin
    password: "#env:PASS"
  db2:
    host: db2.server.com
    username: admin
    password: "#env:PASS"
  web1:
    host: web1.server.com
    username: admin
    password: "#env:PASS"
tasks:
  - name: restart_db
    cmd: sudo systemctl restart postgresql
    expect: 0
    hosts: [db1, db2]
  - name: restart_web
    cmd: sudo systemctl restart nginx
    expect: 0
    hosts: [web1]
```

### 7. Environment File Loading

Load environment variables from remote or local files:

```yaml
appname: myapp
hosts:
  production:
    host: server.com
    username: admin
    password: "#env:PASS"
    envpath: /etc/myapp/env      # Source on remote before exec
    envfile: .env.production     # Upload local file before exec
tasks:
  - name: run
    cmd: npm start
    expect: 0
```

## How It Works

```
+------------------+     +------------------+     +------------------+
|   nyatictl CLI   | --> |   YAML Config    | --> |  SSH Connection  |
+------------------+     +------------------+     +------------------+
        |                       |                       |
        |                       |                       |
        v                       v                       v
  Parse Args &            Template Variables       Execute Tasks
  Load Config             Substitute ${var}        Check Exit Codes
                                                  Handle Retries
```

### Architecture

1. **CLI Parsing** — Parses command-line arguments and loads YAML config
2. **Template Engine** — Substitutes variables (`${var}`) with values
3. **SSH Manager** — Creates connection pool to all configured hosts
4. **Task Runner** — Executes tasks sequentially on each host
5. **Output Handling** — Logs results, handles retries, shows output

### Execution Flow

```
For each task:
  For each host:
    1. Parse template (substitute variables)
    2. Connect via SSH (if not connected)
    3. Change to work dir (if specified)
    4. Source env file (if specified)
    5. Execute command
    6. Check exit code against expected
    7. Print message/output on success
    8. Retry or fail on error
```

## Security Notes

- Store sensitive passwords in environment variables, never in config files
- Use SSH keys instead of passwords when possible
- The `#env:VAR` syntax allows referencing secrets without embedding them
- Config files can be added to `.gitignore` if they contain sensitive data

## Config File Location

nyatictl looks for config in this order:

1. `--conf <file>` CLI argument
2. `nyati.yaml` in current directory
3. `nyati.yml` in current directory

## Full Example

See [nyati.yaml](nyati.yaml) for a complete reference configuration.
