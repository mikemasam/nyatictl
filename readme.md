
### Running tasks
```
npm i -g nyatictl
nyatictl --conf nyati.yaml --exec
options:
        --exec all                ; all hosts
        --exec `servername`       ; single hosts
        --task                    ; run single task
        --debug                   ; print debug information 
```

### Task definition
```
 name: task name no spaces
 cmd: task action
 expect: expected action code
 message: on success message
 output: print on success stdout
 dir: working dir
 lib: available through --task flag
 retry: ask to retry on fail
 askpass: password will be asked if required, useful for commands that require sudo
```

### Configuration
```
version: 0.0.7      # version lock
appname: 
dir: '/var/www/html/${appname}/'
params:
  myparam: this is my paramater value
hosts:
  live:
    host: localhost
    username: ''
    privateKey: ''
    port: ''
    password: ''
    privateKey: ''
  test:
    host: '' 
    username: ''
tasks:
  - name: create file
    cmd: touch ~/test.hi
    expect: 0
    retry: 1
  - name: write to file
    cmd: echo HelloWorld > ~/test.hi
    expect: 0
  - name: write param to file
    cmd: echo ${myparam} > ~/test.hi
    expect: 0
    message: This message will be printed when this task is completed with expect code
  - name: test sudo 
    cmd: echo HelloWorld > /test.hi
    expect: 0
    askpass: 1
```

### Default paramaters
```
appname           ; value from config file
release_version   ; current unix timestamp in milliseconds
```
