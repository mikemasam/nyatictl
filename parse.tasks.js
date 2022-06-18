import { DateTime } from 'luxon';
import parseLiteral from './parse.literal.js';
export default function(config, tasks){
  const commands = [];
  for(let i = 0; i < tasks.length; i++){
    const task = tasks[i];
    const command  = {
      name: task.name,
      cmd: task.cmd,
      expect: task.expect,
      message: task.message,
      output: task.output,
      dir: task.dir,
      lib: task.lib,
      retry: task.retry,
      askpass: task.askpass
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

