import { DateTime } from 'luxon';
const release_version = DateTime.now().toMillis();
export default function(config){
  const commands = [];
  for(let i = 0; i < config.tasks.length; i++){
    const task = config.tasks[i];
    const command  = {
      name: task.name,
      cmd: task.cmd,
      expect: task.expect,
      message: task.message,
      output: task.output,
      dir: task.dir
    }
    commands.push(command);
  }
  return parseCommands(config, commands);
}

export function parseCommands(config, commands){
  for(let i = 0; i < commands.length; i++){
    commands[i].cmd = parseLiteral(config, commands[i].cmd);
    commands[i].dir = parseLiteral(config, commands[i].dir);
    commands[i].message = parseLiteral(config, commands[i].message);
  }
  return commands;
}

export function parseLiteral(config, _literal){
  if(!_literal) return _literal;
  let literal = '' + _literal;
  const params = [...literal.matchAll(/\$\{([a-z_]*)\}/g)];
  for(let i = 0; i < params.length; i++){
    const param = params[i];
    let value = '';
    if(param[1] == 'appname') value = config.appname;
    else if(param[1] == 'dir') value = config.dir;
    else if(param[1] == 'release_version') value = release_version;
    else {
      console.log(`❌ERROR: invalid config param ${param[0]}`)
      process.exit(0);
    }
    literal = literal.replaceAll(param[0], value);
  }
  return literal;
}
