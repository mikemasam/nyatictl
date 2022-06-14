import fs from 'fs'
import YAML from 'yaml'
export default async function loadConfig(cfile){
  if(!cfile) return null;
  return new Promise((relv) => {
    fs.stat(cfile, function(err, stat) {
      if(err == null){
        const file = fs.readFileSync(cfile, 'utf8')
        const config = YAML.parse(file)
        relv(config);
      }else{
        relv(null);
      }
    })
  });
}
