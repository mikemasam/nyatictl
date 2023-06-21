
### Running tasks
```
npm i -g nyatictl
- without specifying configuration file
nyatictl hostname
- specifying configuration file
nyatictl --conf nyati.yaml hostname
options:
        nyatictl hostname         ; single host
        nyatictl --exec all       ; all hosts
        nyatictl --exec hostname  ; single host
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
version: 0.0.8      # version lock
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
    password: '#env:THIS_IS_ENV_KEY'   //this value will be loaded from .env on  the current directory
    privateKey: '/home/<username>/.ssh/id_rsa' //this can also be configured on .env file
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
