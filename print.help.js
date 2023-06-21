export default function help(argv, config) {
  console.log(`   -^- Nyatictl -^-    \n`);

  console.log(
    `💀 How to use -> \n\t'nyatictl --exec hostname' \n\t'nyatictl hostname' \n\t'nyatictl --exec all' \n\n`
  );

  console.log(`#-------------START_CONFIG------------#`);
  console.log(`version: ${config.version}`);
  console.log(`file: ${argv.conf}`);
  if (!config) {
    console.log(`❌ERROR: config not found ${argv.conf}\n`);
  } else {
    console.log(`name: ${config.appname}`);
    console.log(`dir: ${config.dir || ""}`);
    console.log(`tasks: ${config.tasks.length}`);
    console.log(`hosts:`);
    Object.keys(config.hosts).forEach((key) => {
      console.log(` ${key}:`);
      console.log(`   ${config.hosts[key].username}@${config.hosts[key].host}`);
    });
  }
  console.log(`default params:`);
  console.log(`   appname           = \${appname}`);
  console.log(`   unix milliseconds timestamp    = \${release_version}`);
  console.log(`#-------------END_CONFIG------------#`);
  process.exit(0);
}
