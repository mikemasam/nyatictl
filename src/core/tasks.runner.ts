import ora from "ora";
import prompt from "prompt";
import type { SshClient, Task, Argv } from "../types.js";

prompt.message = "Nyatictl";

export default async function tasker(
  clients: SshClient[],
  tasks: Task[],
  argv: Argv
): Promise<number> {
  let includeLib = 0;
  if (argv.task) {
    includeLib = 1;
    tasks = tasks.filter((t) => t.name === argv.task);
  }
  for (let t = 0; t < tasks.length; t++) {
    const task = tasks[t];
    if (task.lib && !includeLib) continue;
    const res = await taskRunner(clients, task, null, argv);
    if (res === -1) return -1;
  }
  return 0;
}

async function taskRunner(
  clients: SshClient[],
  task: Task,
  _clb: ((output: string) => void) | null,
  argv: Argv
): Promise<number> {
  for (let i = 0; i < clients.length; i++) {
    const client = clients[i];
    const result = await taskRunnerClient(client, task, _clb, argv);
    if (result === -1) return result;
  }
  return 0;
}

async function taskRunnerClient(
  client: SshClient,
  task: Task,
  _clb: ((output: string) => void) | null,
  argv: Argv
): Promise<number> {
  console.log(`🎐${client.name} ~ ${client.server.host}`);
  const spinner = ora(`🎲 ${task.name}`).start();
  const debugging = argv.debug || task.debug || client.server.debug;
  if (debugging) console.log(`🎲 ${task.cmd}`);
  const [code, output] = await client.exec(task, spinner, !!debugging);
  if (code === task.expect) {
    spinner.succeed(`🎲 ${task.name}`);
    if (task.message) console.log(`📗${task.message}`);
    if (client.server.output || task.output || debugging)
      console.log(`${output}`);
    if (_clb) _clb(output);
  } else {
    spinner.fail(`❌${task.name}: Failed`);
    if (task.error !== 0 || argv.debug) console.log(`\t${output}`);
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
      if (result.value == "y")
        return taskRunnerClient(client, task, _clb, argv);
    }
    return -1;
  }
  return 0;
}
