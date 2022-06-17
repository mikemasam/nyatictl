import ora from 'ora';
import prompt from 'prompt';

export default async function(clients, tasks, argv){
  let includeLib = 0;
  if(argv.task){
    includeLib = 1;
    tasks = tasks.filter(t => t.name == argv.task);
  }
  for(let t = 0; t < tasks.length; t++){
    const task = tasks[t];
    if(task.lib && !includeLib) continue;
    const res = await taskRunner(clients, task, null, argv);
    if(res == -1) return -1;
  }
  return 0;
}


async function taskRunner(clients, task, clb, argv){
  for(let i = 0; i < clients.length; i++){
    const client = clients[i];
    const result = await taskRunnerClient(client, task, clb, argv);
    if(result == -1) return result;
  }
  return 0;
}


async function taskRunnerClient(client, task, clb, argv){
  console.log(`🎐${client.name} ~ ${client.server.host}`);
  const spinner = ora(`🎲 ${task.name}`).start();
  if(argv.debug) 
    console.log(`🎲 ${task.cmd}`);
  const [code, output] = await client.exec(task, argv);
  if(code == task.expect) {
    spinner.succeed(`🎲 ${task.name}`);
    if(task.message)
      console.log(`📗${task.message}`);
    if(task.output || argv.debug)
      console.log(`${output}`);
    if(clb) clb(output);
  }else{
    spinner.fail(`❌${task.name}: Failed`);
    if(task.error !== 0 || argv.debug)
      console.log(`\t${output}`);
    if(task.retry){
      const result = await prompt.get([{ 
        name: "value",
        description: `Retry '${task.name}' [t/f]`,
        required: true,
        type: "boolean"
      }]).catch(err => ({ value: false }));
      if(result.value) return taskRunnerClient(client, task, clb, argv);
    }
    return -1;
  }
  return 0;
}
