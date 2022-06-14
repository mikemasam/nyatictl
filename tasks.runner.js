import ora from 'ora';

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
  const spinner = ora(`🎲 ${task.name}`).start();
  for(let i = 0; i < clients.length; i++){
    const client = clients[i];
    const [code, output] = await client.exec(task, argv);
    if(code == task.expect) {
      spinner.succeed(`🎐${client.name}:[${client.server.host}]: OK`);
      console.log(`🎲 ${task.name}`);
      if(task.message)
        console.log(`📗${task.message}`);
      if(task.output || argv.debug)
        console.log(`${output}`);
      if(clb) clb(output);
    }else{
      spinner.fail(`❌${client.name}:[${client.server.host}]: Failed`);
      if(task.error !== 0 || argv.debug)
        console.log(`\t${output}`);
      return -1;
    }
  }
  return 0;
}
