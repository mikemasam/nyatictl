export default async function getArgs() {
  const args = { conf: "./nyati.yaml" };
  const argv = process.argv.slice(2, process.argv.length);
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg.slice(0, 2) === "--") {
      const next = argv[i + 1];
      if (!next || next.slice(0, 2) === "--") {
        args[arg.slice(2)] = true;
      } else {
        args[arg.slice(2)] = next;
        i++;
      }
    } else if (arg.slice(0, 1) === "-") {
      const next = argv[i + 1];
      if (!next || next.slice(0, 1) === "-") {
        args[arg.slice(1)] = true;
      } else {
        args[arg.slice(1)] = next;
        i++;
      }
    } else {
      args[arg] = true;
    }
    i++;
  }
  return args;
}
