import SshClient from './ssh.client.js';

export default function(config, argv){
  let clients = [];
  return {
    clients,
    open: async () => {
      if(!config.hosts) return;
      const hosts = Object.keys(config.hosts);
      if(argv.exec == "all" || argv.exec === true){
        for(let i = 0; i < hosts.length; i++){
          clients.push(new SshClient(hosts[i], config.hosts[hosts[i]]));
        }
      }else if(config.hosts[argv.exec]){
        clients.push(new SshClient(argv.exec, config.hosts[argv.exec]));
      }else{
        console.log(`❌ ERROR: server not found: ${argv.exec}`);
      }
      console.log(`👓 Servers : ${clients.length} hosts`);
      for(let i = 0; i < clients.length; i++){
        const client = clients[i];
        const [res, err] = await client.connect();
        if(!res) {
          console.log(`❌ ERROR: connection failed ${client.name} - ${client.server.host}`);
          console.log(`       ${err?.message}`);
          process.exit(1);
        }else{
          console.log(`📡 Found : ${client.name}`);
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
