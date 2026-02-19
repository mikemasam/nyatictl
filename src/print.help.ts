import type { Config, Argv } from "./types.js";

export default function printHelp(argv: Argv, config: Config | null): void {
  console.log("\nnyatictl <host> [options]");
  console.log("nyatictl --exec <host|all> [options]");
  if (config) {
    console.log(`tasks: ${config.tasks.length}`);
    console.log("hosts:");
    Object.keys(config.hosts).forEach((key) => {
      const host = config.hosts[key];
      console.log(`   ${host.username}@${host.host}`);
    });
  }
}
