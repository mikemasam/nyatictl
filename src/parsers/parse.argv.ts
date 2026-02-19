import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import type { Argv } from "../types.js";

export default async function getArgs(): Promise<Argv> {
  const args = await yargs(hideBin(process.argv))
    .scriptName("nyatictl")
    .option("conf", {
      alias: "c",
      type: "string",
      description: "Config file path",
      default: "./nyati.yaml",
    })
    .option("debug", {
      alias: "d",
      type: "boolean",
      description: "Enable debug output",
      default: false,
    })
    .option("help", {
      alias: "h",
      type: "boolean",
      description: "Show help",
      default: false,
    })
    .option("task", {
      alias: "t",
      type: "string",
      description: "Run specific task",
    })
    .option("exec", {
      alias: "e",
      type: "string",
      description: "Execute on host(s): <hostname>, all",
    })
    .option("scripts", {
      alias: "s",
      type: "boolean",
      description: "Load scripts from ./scripts directory",
      default: false,
    })
    .exitProcess(false)
    .parseAsync();

  const result: Argv = {
    conf: args.conf,
    debug: args.debug,
    help: args.help,
    task: args.task,
    exec: args.exec,
    scripts: args.scripts,
  };

  const positional = args._;
  for (const pos of positional) {
    result[pos as string] = true;
  }

  return result;
}
