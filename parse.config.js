import fs from 'fs'
import YAML from 'yaml'
export default async function loadConfig(argv){
  const cfile = argv.conf;
  if(!cfile) return null;
  return new Promise((relv) => {
    fs.stat(cfile, function(err, stat) {
      if(err == null){
        const file = fs.readFileSync(cfile, 'utf8')
        const config = YAML.parse(file)
        if(!config) {
          console.log(`❌ERROR: config not found ${argv.conf}\n`);
        }
        if(!config.appname) {
          console.log(`❌ERROR: config.appname not defined ${argv.conf}\n`);
          process.exit(0);
        }
        if(!Object.keys(config.hosts || {}).length) {
          console.log(`❌ERROR: config.hosts not defined or empty list ${argv.conf}\n`);
          process.exit(0);
        }
        if(!config.tasks?.length) {
          console.log(`❌ERROR: config.tasks not defined or empty list ${argv.conf}\n`);
          process.exit(0);
        }
        relv(config);
      }else{
        relv(null);
      }
    })
  });
}
