import parseLiteral from "./parse.literal.js";
import type { Config, Task, Command } from "../types.js";

export default function taskparser(config: Config, tasks: Task[]): Command[] {
  const commands: Command[] = [];
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const command: Command = {
      name: task.name,
      cmd: task.cmd,
      expect: task.expect,
      message: task.message,
      output: task.output,
      dir: task.dir,
      lib: task.lib,
      retry: task.retry,
      askpass: task.askpass,
    };
    commands.push(command);
  }
  return parseCommands(config, commands);
}

export function parseCommands(config: Config, commands: Command[]): Command[] {
  for (let i = 0; i < commands.length; i++) {
    commands[i].cmd = parseLiteral(config, commands[i].cmd) || "";
    commands[i].dir = parseLiteral(config, commands[i].dir);
    commands[i].message = parseLiteral(config, commands[i].message);
  }
  return commands;
}
