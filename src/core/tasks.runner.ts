import ora from "ora";
import prompt from "prompt";
import type { SshClient, Task, Argv, Config } from "../types.js";
import { logger } from "../lib/logger.js";
import parseTaskTemplate from "../parsers/parse.tasks.js";

prompt.message = "Nyatictl";

export default async function tasksRunner(
  config: Config,
  clients: SshClient[],
  tasks: Task[],
): Promise<number> {
  if (config.argv.debug) {
    logger.setLevel(0);
    //logger.setTimestamps(true);
  }

  let includeLib = 0;
  if (config.argv.task) {
    includeLib = 1;
    tasks = tasks.filter((t) => t.name === config.argv.task);
    if (tasks.length === 0) {
      logger.error(`Task not found: ${config.argv.task}`);
      return 1;
    }
  }
  for (let t = 0; t < tasks.length; t++) {
    const task = tasks[t];
    if (task.lib && !includeLib) continue;
    const res = await taskRunner(clients, task, config);
    if (res === -1) return -1;
  }
  return 0;
}

async function taskRunner(
  clients: SshClient[],
  task: Task,
  config: Config,
): Promise<number> {
  for (let i = 0; i < clients.length; i++) {
    const client = clients[i];
    if (task.hosts !== undefined) {
      if (!task.hosts.includes(client.name)) {
        logger.warn(`Task :${task.name} skipped for host :${client.name}`);
        continue;
      }
    }
    const result = await taskRunnerClient(client, task, config);
    if (result === -1) return result;
  }
  return 0;
}

async function taskRunnerClient(
  client: SshClient,
  _task: Task,
  config: Config,
): Promise<number> {
  const task = parseTaskTemplate(config, client, _task);
  const spinner = ora(`Running: ${task.name}`).start();
  const [code, output, cmd] = await client.exec(task, spinner, config);
  if (code === task.expect) {
    spinner.stop();
    logger.taskSuccess(client, task.name, code, task.message);
    if (task.output || config.argv.debug)
      logger.debug(
        `----------------Start Output---------------\n${output}\n-------------End Output--------------`,
      );
    if (task.output || config.argv.debug) {
      logger.consoleOutput(cmd, output);
    }
  } else {
    spinner.stop();
    logger.taskFail(client, task.name, code, task.message);
    logger.consoleOutput(cmd, output);
    if (config.argv.debug) {
      logger.debug(
        `----------------Start Error Output---------------\n${output}\n-------------End Error Output--------------`,
      );
    }
    if (task.retry) {
      const result = await prompt
        .get([
          {
            name: "value",
            description: `Retry '${task.name}' [y/n]`,
            required: true,
            type: "string",
          },
        ])
        .catch(() => ({ value: false }));
      if (result.value == "y") return taskRunnerClient(client, task, config);
    }
    return -1;
  }
  return 0;
}
