export default async function getArgs () {
  const args = { conf: './nyati.yaml' };
  const argv = process.argv.slice(2, process.argv.length);
  let i = 0;
  while(i < argv.length){
    const arg = argv[i];
    if(i % 2 == 0 || arg.slice(0,2) === '--'){
      const next = argv[i + 1];
      if(!next || next.slice(0,2) === '--'){
        args[arg.slice(2)] = true;
      }else{
        args[arg.slice(2)] = next;
        i++;
      }
    }else{
      console.log("❌ERROR: invalid option", arg);
      process.exit(2);
    }
    i++;
  }

  /*
  process.argv.slice(2, process.argv.length)
    .forEach( arg => {
      // long arg
      if (arg.slice(0,2) === '--') {
        const longArg = arg.split('=');
        const longArgFlag = longArg[0].slice(2,longArg[0].length);
        const longArgValue = longArg.length > 1 ? longArg[1] : true;
        args[longArgFlag] = longArgValue;
      }
  // flags
      else if (arg[0] === '-') {
        const flags = arg.slice(1,arg.length).split('');
        flags.forEach(flag => {
          args[flag] = true;
        });
      }
    });
    */
  return args;
}
