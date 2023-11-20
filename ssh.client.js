import { existsSync, readFileSync } from "fs";
import { Client } from "ssh2";
import getInput from "./get.input.js";
export default class Ssh {
  constructor(name, server) {
    this.name = name;
    this.server = server;
    this.connected = false;
    this.password = "";
    this.env = null;
  }
  loadEnv(env) {
    this.env = env;
  }
  async connect() {
    this.server.host = await getInput(this, {
      label: this.name,
      name: "host",
      require: true,
    });
    this.server.username = await getInput(this, {
      label: this.name,
      name: "username",
      require: true,
    });

    const authParams = {};
    if (this.server.password) {
      this.password = await getInput(this, {
        label: this.name,
        name: "password",
        require: true,
        hidden: true,
      });
      authParams.password = this.password;
    } else if (this.server.privateKey) {
      let privateKey = await getInput(this, {
        label: this.name,
        name: "privateKey",
      });
      if (!existsSync(privateKey))
        return [
          false,
          {
            message: `privateKey not found ${privateKey}`,
          },
        ];
      authParams.privateKey = readFileSync(privateKey);
    } else {
      return [
        false,
        { message: "Both server.password & server.privateKey not specified" },
      ];
    }
    if (this.server.passphrase) {
      this.passphrase = await getInput(this, {
        label: this.name,
        name: "passphrase",
        require: true,
        hidden: true,
      });
      authParams.passphrase = this.passphrase;
    }
    //console.log(authParams);
    return new Promise((reslv) => {
      this.client = new Client();
      this.client.on("ready", () => {
        this.connected = true;
        reslv([true, null]);
      });
      this.client.on("error", (err) => {
        console.log(err);
        this.connected = false;
        reslv([false, err]);
      });
      const con_opts = {
        keepaliveInterval: 1000,
        keepaliveCountMax: 30,
        host: this.server.host,
        port: this.server.port || 22,
        username: this.server.username,
        ...authParams,
      };
      this.client.connect(con_opts);
    }).catch((e) => [false, e]);
  }
  async disconnect() {
    this.client?.end();
  }

  async exec(task, spinner, output_log) {
    return new Promise((reslv) => {
      let output = "";
      let authRequired = task.askpass == 1;
      this.client.exec(
        `${task.dir ? "cd " + task.dir + ";" : ""} ${task.cmd}`,
        { pty: true },
        (err, stream) => {
          if (err) return reslv([-1, err?.message]);
          stream
            .on("close", (code, signal) => {
              reslv([code, output]);
            })
            .on("data", (data) => {
              if (output_log)
                console.log(
                  `auth required = [${authRequired}] `,
                  data.toString(),
                );
              output += data.toString();
              if (
                authRequired &&
                output.slice(-2, -1) === ":" &&
                output.indexOf("assword") > -1
              ) {
                //authRequired = false;
                spinner.stop();
                this.getSUPassword().then(() => {
                  spinner.start();
                  output = "";
                  if (output_log) console.log(`Auth submitted`);
                  stream.write(`${this.password}\n`);
                });
              }
            })
            .stderr.on("data", (data) => {
              if (output_log) console.log(data.toString());
              output += data;
            });
        },
      );
    });
  }

  async getSUPassword() {
    if (!this.password)
      this.password = await getInput(this, {
        label: this.name + " sudo",
        name: "password",
        require: true,
        hidden: true,
      });
    return this.password;
  }
}

//console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
