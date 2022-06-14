#!/usr/bin/env node
import getArgv from './parse.argv.js';
import loadConfig from './parse.config.js';
import printHelp from './print.help.js';
import parseTasks from './parse.tasks.js';
import tasksRunner from './tasks.runner.js';
import clietsManager from './clients.manager.js';
import { DateTime } from 'luxon';
import fs from 'fs';
import path from 'path';

const argv = await getArgv();
const config = await loadConfig(argv.conf);
if(!config) printHelp(argv, config);
if(argv.h) printHelp(argv, config);

const commands = [];
if(config?.tasks?.length){
  const _commands = parseTasks(config, config.tasks);
  for(let i = 0; i < _commands.length; i++){
    commands.push(_commands[i]);
  }
}

await loadScripts();
if(argv.exec) exec(config, argv);

async function exec(config, argv){
  const man = clietsManager(config, argv)
  await man.open();
  const code = await tasksRunner(man.clients, commands, argv);
  await man.close();
  process.exit(code);
}

async function loadScripts(){
  const dir = path.resolve('./scripts');
  const scripts = fs.readdirSync(dir);
  for(let i = 0; i < scripts.length; i++){
    const script = scripts[i];
    const tasks = await loadConfig(`${dir}/${script}`);
    const _commands = parseTasks(config, tasks);
    for(let i = 0; i < _commands.length; i++){
      commands.push(_commands[i]);
    }
  }
}

/*
  //if(argv.version) printversions(config, argv);
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

  const sys_defaults = parseCommands(config, defaults);
  for(let i = defaults.length -1; i >= 0; i--){
    tasks.unshift(sys_defaults[i]);
  }
const defaults = [{
  name: 'sysversions',
  cmd: 'ls /var/www/html/${appname}/releases',
  expect: 0,
  message: 'versions',
  output: 1,
  error: 0,
  auto: 0
}]
*/
