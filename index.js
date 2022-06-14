import getArgv from './parse.argv.js';
import loadConfig from './parse.config.js';
import printHelp from './print.help.js';
import parseTasks, { parseCommands } from './parse.tasks.js';
import tasksRunner,{ taskRunner }  from './tasks.runner.js';
import clietsManager from './clients.manager.js';
import { DateTime } from 'luxon';

const argv = await getArgv();
const config = await loadConfig(argv.conf);
if(argv.h) printHelp(argv, config);
if(argv.deploy) deploy(config, argv);
if(argv.version) printversions(config, argv);
const defaults = [{
  name: 'sysversions',
  cmd: 'ls /var/www/html/${appname}/releases',
  expect: 0,
  message: 'versions',
  output: 1,
  error: 0,
  auto: 0
}]
async function deploy(config, argv){
  const man = clietsManager(config, argv)
  await man.open();
  const tasks = parseTasks(config);
  const sys_defaults = parseCommands(config, defaults);
  for(let i = defaults.length -1; i >= 0; i--){
    tasks.unshift(sys_defaults[i]);
  }
  const code = await tasksRunner(man.clients, tasks, argv);
  await man.close();
  process.exit(code);
}

async function printversions(config, argv){
  const man = clietsManager(config, argv)
  await man.open();
  const tasks = parseCommands(config, defaults);
  const code = await taskRunner(man.clients, tasks[0], (output) => {
    const versions = output.toString().split('\n');
    for(let i = 0; i < versions.length; i++){
      const v = versions[i];
      const time = DateTime.fromSeconds(Number(v)).toRelative();
      console.log(`[${v}] ~ ${time}`);
    }
  });
  await man.close();
  process.exit(code);
}

