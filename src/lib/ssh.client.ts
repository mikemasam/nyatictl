import { existsSync, readFileSync } from "fs";
import { Client } from "ssh2";
import getInput from "./get.input.js";
import type { Server, Task, SshClient as SshClientType } from "../types.js";

interface SshClientInput {
  name: string;
  server: Server;
  env: Record<string, string> | null;
  password: string;
}

export default class Ssh implements SshClientType {
  name: string;
  server: Server;
  connected: boolean;
  password: string;
  env: Record<string, string> | null;
  client: Client | null = null;
  passphrase: string | undefined;

  constructor(name: string, server: Server) {
    this.name = name;
    this.server = server;
    this.connected = false;
    this.password = "";
    this.env = null;
  }

  loadEnv(env: Record<string, string> | null): void {
    this.env = env;
  }

  async connect(): Promise<[boolean, unknown]> {
    const clientInput: SshClientInput = this;
    this.server.host = (await getInput(clientInput, {
      label: this.name,
      name: "host",
      required: true,
    })) as string;

    this.server.username = (await getInput(clientInput, {
      label: this.name,
      name: "username",
      required: true,
    })) as string;

    const authParams: Record<string, string | Buffer> = {};
    if (this.server.password) {
      this.password = (await getInput(clientInput, {
        label: this.name,
        name: "password",
        required: true,
        hidden: true,
      })) as string;
      authParams.password = this.password;
    } else if (this.server.privateKey) {
      let privateKey = (await getInput(clientInput, {
        label: this.name,
        name: "privateKey",
      })) as string;
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
      this.passphrase = (await getInput(clientInput, {
        label: this.name,
        name: "passphrase",
        required: true,
        hidden: true,
      })) as string;
      authParams.passphrase = this.passphrase;
    }

    return new Promise<[boolean, unknown]>((resolve) => {
      this.client = new Client();
      this.client.on("ready", () => {
        this.connected = true;
        resolve([true, null]);
      });
      this.client.on("error", (err) => {
        console.log(err);
        this.connected = false;
        resolve([false, err]);
      });
      const con_opts: Record<string, string | number | Buffer | undefined> = {
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

  async disconnect(): Promise<void> {
    this.client?.end();
  }

  async exec(
    task: Task,
    _spinner: unknown,
    output_log: boolean
  ): Promise<[number, string]> {
    return new Promise((resolve) => {
      let output = "";
      const authRequired = task.askpass === 1;
      this.client?.exec(
        `${task.dir ? "cd " + task.dir + ";" : ""} ${task.cmd}`,
        { pty: true },
        (err, stream) => {
          if (err) return resolve([-1, err?.message || ""]);
          stream.on("close", (code: number) => {
            resolve([code, output]);
          });
          stream.on("data", (data: Buffer) => {
            if (output_log)
              console.log(
                `auth required = [${authRequired}] `,
                data.toString()
              );
            output += data.toString();
            if (
              authRequired &&
              output.slice(-2, -1) === ":" &&
              output.indexOf("assword") > -1
            ) {
              (_spinner as { stop: () => void; start: () => void })?.stop();
              this.getSUPassword().then(() => {
                (_spinner as { stop: () => void; start: () => void })?.start();
                output = "";
                if (output_log) console.log(`Auth submitted`);
                stream.write(`${this.password}\n`);
              });
            }
          });
          stream.stderr.on("data", (data: Buffer) => {
            if (output_log) console.log(data.toString());
            output += data.toString();
          });
        }
      );
    });
  }

  async getSUPassword(): Promise<string> {
    if (!this.password) {
      const clientInput: SshClientInput = this;
      this.password = (await getInput(clientInput, {
        label: this.name + " sudo",
        name: "password",
        required: true,
        hidden: true,
      })) as string;
    }
    return this.password;
  }
}
