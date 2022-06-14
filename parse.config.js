import fs from 'fs'
import YAML from 'yaml'
export default async function loadConfig(file){
  return new Promise((relv) => {
    const cfile = file || './nyati.yaml';
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
