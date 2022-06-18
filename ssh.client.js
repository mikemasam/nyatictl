import { readFileSync } from 'fs';
import prompt from 'prompt';
import { Client } from 'ssh2';
prompt.message = "Nyatictl";
export default class Ssh {
  constructor(name, server){
    this.name = name;
    this.server = server;
    this.connected = false;
    this.username = '';
    this.password = '';
  }

  async getInput(label, name, required, hidden){
    let value = this.server[name];
    if(value === null || value == '' || (required && value === undefined)){
      const result = await prompt.get([{ 
        name: "value",
        description: `Enter '${label}' ${name}`,
        hidden: !!hidden,
        replace: hidden ? "*" : undefined,
        required: true,
        type: "string"
      }]).catch(err => false);
      if(result == false) {
        console.log("");
        process.exit(0);
      }
      return result.value;
    }else if(value){
      return value;
    }
  }
  async connect(){
    this.username = await this.getInput(this.server.host, "username", true);
    this.password = await this.getInput(this.server.host, "password", true, true);
    return new Promise(reslv => {
      this.client = new Client();
      this.client.on('ready', () => { 
        this.connected = true;
        reslv([true, null]);
      });
      this.client.on('error', (err) => { 
        this.connected = false 
        reslv([false, err]);
      });
      this.client.connect({
        keepaliveInterval: 500,
        host: this.server.host,
        port: this.server.port || 22,
        username: this.username,
        password: this.server.privateKey ? undefined : this.password,
        privateKey: this.server.privateKey ? readFileSync(this.server.privateKey) : undefined 
      });
    });
  }
  async disconnect(){
    this.client?.end();
  }

  async exec(task, argv, spinner){
    return new Promise(reslv => {
      let output = '';
      let authRequired = task.askpass == 1;
      this.client.exec(
        `${task.dir ? 'cd ' + task.dir + ';' : '' } ${task.cmd}`,
        { pty: true },
        (err, stream) => {
          if (err) return reslv([-1 , err?.message]);
          stream.on('close', (code, signal) => {
            reslv([code , output]);
          }).on('data', (data) => {
            if(argv.debug) console.log(`auth required = [${authRequired}] `, data.toString());
            output += data.toString();
            if(authRequired && output.slice(-2, -1) === ':' && output.indexOf('assword') > -1){
              spinner.stop();
              this.getSUPassword().then(() => {
              spinner.start();
                output = '';
                authRequired = false;
                if(argv.debug) console.log(`Auth submitted`);
                stream.write(`${this.password}\n`);
              });
            }
          }).stderr.on('data', (data) => {
            if(argv.debug) console.log(data.toString());
            output += data;
          });
        });
    });
  }

  async getSUPassword(){
    if(!this.password) this.password = await this.getInput(this.server.host + ' sudo', "password", true, true);
    return this.password;
  }
}

//console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
