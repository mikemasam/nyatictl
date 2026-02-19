import chalk from "chalk";
import type { Config, Argv } from "./types.js";

export default function printHelp(argv: Argv, config: Config | null): void {
  console.log(chalk.bold.underline("\nUsage:"));
  console.log("  nyatictl <host> [options]");
  console.log("  nyatictl --exec <host|all> [options]");
  
  console.log(chalk.bold.underline("\nOptions:"));
  console.log("  -c, --conf <path>   Config file path (default: ./nyati.yaml)");
  console.log("  -d, --debug         Enable debug output");
  console.log("  -h, --help          Show this help message");
  console.log("  -t, --task <name>   Run specific task (default: all tasks)");
  console.log("  -e, --exec <host>   Execute on host(s): <hostname> or 'all'");
  console.log("  -s, --scripts       Load scripts from ./scripts directory");

  console.log(chalk.bold.underline("\nExamples:"));
  console.log("  nyatictl web01                  # Run all tasks on web01");
  console.log("  nyatictl all                    # Run all tasks on all hosts");
  console.log("  nyatictl web01 --task deploy    # Run only 'deploy' task");
  console.log("  nyatictl --exec all             # Run all tasks on all hosts (alt)");
  console.log("  nyatictl web01 --debug          # Run with debug output");

  if (config) {
    console.log(chalk.bold.underline("\nConfig:"));
    console.log(`  Config file: ${chalk.cyan(argv.conf || "./nyati.yaml")}`);
    
    console.log(chalk.bold.underline("  Hosts:"));
    if (Object.keys(config.hosts).length === 0) {
      console.log("    (none defined)");
    } else {
      Object.keys(config.hosts).forEach((key) => {
        const host = config.hosts[key];
        console.log(`    ${chalk.green(key)}: ${chalk.green(host.username)}@${chalk.blue(host.host)}${host.port ? ":" + host.port : ""}`);
      });
    }

    console.log(chalk.bold.underline("  Tasks:"));
    if (config.tasks.length === 0) {
      console.log("    (none defined)");
    } else {
      config.tasks.forEach((task) => {
        const taskDesc = task.message || task.cmd.substring(0, 50);
        console.log(`    ${chalk.cyan(task.name)}`);
        console.log(`      ${taskDesc}${task.cmd.length > 50 ? "..." : ""}`);
      });
    }
  }
}
