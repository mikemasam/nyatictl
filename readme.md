

```
 - Task definition
 name: task name no spaces
 cmd: task action
 expect: expected action code
 message: on success message
 output: print on success stdout
 dir: working dir
 lib: available through --task flag
```

```
version: 0.1
appname: 
dir: '/var/www/html/${appname}/'
servers:
  live:
    host: localhost
    username: ''
    privateKey: ''
    port: ''
    password: ''
  test:
    host: '' 
    username: ''
tasks:
  - name: ''
    cmd: '' 
    expect: 0
  - name: ''
    cmd: ''
    expect: 0
```

