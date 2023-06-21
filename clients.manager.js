import dotenv from "dotenv";
import path from "path";
import { readFileSync, existsSync } from "fs";
import SshClient from "./ssh.client.js";

export default function (config, argv) {
  let clients = [];
  const add_client = async (host, config_host) => {
    const client = new SshClient(host, config_host);
    const [env, msg] = await loadEnv(config_host);
    if (!env) {
      console.log(
        `❌ ERROR: connection failed ${client.name} - ${client.server.host}`
      );
      console.log(`       ${msg}`);
      process.exit(0);
    }
    client.loadEnv(env);
    return client;
  };
  return {
    clients,
    open: async () => {
      if (!config.hosts) return;
      const hosts = Object.keys(config.hosts);
      if (argv.exec && argv.exec == true) {
        console.log(
          `💀 --exec has changed to support -> \n\t'nyatictl --exec hostname' \n\t'nyatictl hostname' \n\t'nyatictl --exec all'`
        );
        return;
      }
      const selected_server = argv.exec || hosts.find((h) => argv[h]);
      if (argv.exec == "all") {
        for (let i = 0; i < hosts.length; i++) {
          clients.push(await add_client(hosts[i], config.hosts[hosts[i]]));
        }
      } else if (config.hosts[selected_server]) {
        clients.push(
          await add_client(selected_server, config.hosts[selected_server])
        );
      } else if (selected_server) {
        console.log(`❌ ERROR: server not found: ${selected_server}`);
      }
      console.log(`👓 Servers : ${clients.length} hosts`);
      for (let i = 0; i < clients.length; i++) {
        const client = clients[i];
        const [res, err] = await client.connect();
        if (!res) {
          console.log(
            `❌ ERROR: connection failed ${client.name} - ${client.server.host}`
          );
          console.log(`       ${err?.message}`);
          process.exit(1);
        } else {
          console.log(`📡 Found : ${client.name}`);
        }
      }
    },
    close: async () => {
      for (let i = 0; i < clients.length; i++) {
        const client = clients[i];
        await client.disconnect();
      }
    },
  };
}
async function loadEnv(server) {
  let env_path = null;
  let required = server.envpath || server.envfile;
  env_path = server.envpath ? path.resolve(server.envpath) : process.cwd();
  //console.log("env_path", env_path);
  env_path = path.join(env_path, server.envfile || ".env");
  if (!existsSync(env_path)) {
    if (required) return [false, `file ${env_path} not found.`];
    return [{}, `env not found ${env_path}`];
  }
  const content = readFileSync(env_path);
  const env = dotenv.parse(content);
  return [env, `env load ${env_path}`];
}
