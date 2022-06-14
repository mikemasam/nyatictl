export default function help(argv, config){
  console.log(`   -^- Nyatictl -^-    \n`);
  if(!config) {
    console.log(`❌ERROR: config not found ${argv.conf}\n`);
    return;
  }
  console.log(`file: ${argv.conf}`);
  console.log(`name: ${config.appname}`);
  console.log(`dir: ${config.dir}`);
  console.log(`config version: ${config.version}`);
  console.log(`tasks: ${config.tasks.length}`);
  console.log(`servers:`);
  Object.keys(config.servers).forEach(key => {
    console.log(` ${key}:`);
    console.log(`   ${config.servers[key].username}@${config.servers[key].ip}`);
  })
  console.log(`params:`);
  console.log(`   appname           = \${appname}`);
  console.log(`   unix milliseconds timestamp    = \${release_version}`);
  process.exit(0);
}
