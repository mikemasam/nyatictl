import { logger } from "../lib/logger.js";
import type { Config, Task, SshClient } from "../types.js";

export default function parseTaskTemplate(
  config: Config,
  client: SshClient,
  task: Task,
): Task {
  const command: Task = {
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
  command.cmd = parseLiteral(config, client, command.cmd) || "";
  command.dir = parseLiteral(config, client, command.dir);
  command.message = parseLiteral(config, client, command.message);
  return command;
}

function parseLiteral(
  config: Config,
  client: SshClient,
  _literal: string | undefined,
): string | undefined {
  if (!_literal) return _literal;
  let literal = "" + _literal;
  const params = [...literal.matchAll(/\$\{([a-z_]*)\}/g)];
  const configParamKeys = Object.keys(config.params || {});
  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    let value: any = "";
    if (param[1] === "appname") value = config.appname;
    else if (param[1] === "dir")
      value = parseLiteral(config, client, config.dir);
    else if (param[1] === "host") value = client.name;
    else if (param[1] === "release_version")
      value = String(config.release_version);
    else if (configParamKeys.indexOf(param[1]) > -1) {
      value = config.params?.[param[1]] || "";
    } else {
      logger.configError(`Invalid config param: ${param[0]}`);
      process.exit(0);
    }
    literal = literal.replaceAll(param[0], value);
  }
  return literal;
}
