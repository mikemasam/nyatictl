export default function help(argv, config){
  console.log(`   -^- Nyatictl -^-    \n`);
  console.log(`file: ${argv.conf}`);
  if(!config) {
    console.log(`❌ERROR: config not found ${argv.conf}\n`);
  }else{
    console.log(`name: ${config.appname}`);
    console.log(`dir: ${config.dir || ''}`);
    console.log(`config version: ${config.version}`);
    console.log(`tasks: ${config.tasks.length}`);
    console.log(`hosts:`);
    Object.keys(config.hosts).forEach(key => {
      console.log(` ${key}:`);
      console.log(`   ${config.hosts[key].username}@${config.hosts[key].ip}`);
    })
  }
  console.log(`default params:`);
  console.log(`   appname           = \${appname}`);
  console.log(`   unix milliseconds timestamp    = \${release_version}`);
  process.exit(0);
}
