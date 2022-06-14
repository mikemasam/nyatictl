import { readFileSync } from 'fs';
import { Client } from 'ssh2';

export default class Ssh {
  constructor(name, server){
    this.name = name;
    this.server = server;
    this.connected = false;
  }
  async connect(){
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
        username: this.server.username,
        password: this.server.password ? this.server.password : undefined,
        privateKey: this.server.key ? readFileSync(this.server.key) : undefined 
      });
    });
  }
  async disconnect(){
    this.client?.end();
  }

  async exec(task){
    return new Promise(reslv => {
      let output = null;
      this.client.exec(`${task.dir ? 'cd ' + task.dir + ';' : '' } ${task.cmd}`, (err, stream) => {
        if (err) return reslv([-1 , err?.message]);
        stream.on('close', (code, signal) => {
          reslv([code , output]);
        }).on('data', (data) => {
          output = data;
        }).stderr.on('data', (data) => {
          //console.log(data.toString());
          output = data;
        });
      });
    });
  }
}

//console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
