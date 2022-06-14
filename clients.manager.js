import SshClient from './ssh.client.js';

export default function(config, argv){
  let clients = [];
  return {
    clients,
    open: async () => {
      const servers = Object.keys(config.servers);
      if(argv.env == "all"){
        for(let i = 0; i < servers.length; i++){
          clients.push(new SshClient(servers[i], config.servers[servers[i]]));
        }
      }else if(config.servers[argv.env]){
        clients.push(new SshClient(argv.env, config.servers[argv.env]));
      }else{
        console.log(`ERROR: server not found: ${argv.env}`);
      }
      for(let i = 0; i < clients.length; i++){
        const client = clients[i];
        const [res, err] = await client.connect();
        if(!res) {
          console.log(`❌ERROR: connection failed ${client.name} - ${client.server.host}`);
          console.log(`       ${err?.message}`);
          process.exit(1);
        }else{
          console.log(`✅Connected: ${client.name}`);
        }
      }
    },
    close: async () => {
      for(let i = 0; i < clients.length; i++){
        const client = clients[i];
        await client.disconnect();
      }
    }
  }
}
