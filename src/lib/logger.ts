import chalk from "chalk";
import { DateTime } from "luxon";
import { SshClient } from "../types";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARN = 3,
  ERROR = 4,
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private timestamps: boolean = false;
  private color: boolean = true;

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setTimestamps(enabled: boolean): void {
    this.timestamps = enabled;
  }

  setColor(enabled: boolean): void {
    this.color = enabled;
  }

  private writeln(level: string, message: string, ...args: any[]) {
    console.log(`${level} ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (this.level > LogLevel.DEBUG) return;
    this.writeln(chalk.gray("💡"), message, ...args);
  }

  info(message: string, ...args: any[]): void {
    if (this.level > LogLevel.INFO) return;
    this.writeln(chalk.blue("!"), chalk.blue(message), ...args);
  }

  success(message: string, ...args: any[]): void {
    if (this.level > LogLevel.SUCCESS) return;
    this.writeln(chalk.green("✔"), chalk.green(message), ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.level > LogLevel.WARN) return;
    this.writeln("⚠️", chalk.yellow(message), ...args);
  }

  error(message: string, ...args: unknown[]): void {
    if (this.level > LogLevel.ERROR) return;
    this.writeln(chalk.red("✗"), chalk.red(message), ...args);
  }

  consoleOutput(command: string, output: string): void {
    this.writeln(chalk.blue("$ "), command, "\n" + output);
  }

  taskSuccess(
    client: SshClient,
    taskName: string,
    code: number,
    message?: string,
  ): void {
    if (this.level > LogLevel.SUCCESS) return;
    const codeMsg = chalk.gray(`code: ${code} -`);
    this.writeln(
      chalk.green(`✔ [${client.name}:${client.server.host}]`),
      ` ${codeMsg} ${taskName}:`,
      chalk.gray(message ?? "..."),
    );
  }

  taskFail(
    client: SshClient,
    taskName: string,
    code: number,
    message?: string,
  ): void {
    const codeMsg = chalk.gray(`code: ${code} -`);
    this.writeln(
      chalk.red(`✗ [${client.name}:${client.server.host}]`),
      ` ${codeMsg} ${taskName}:`,
      chalk.gray(message ?? "..."),
    );
  }

  help(lines: string[]): void {
    console.log(chalk.bold.underline("\nUsage:"));
    console.log("  nyatictl <host> [options]");
    console.log("  nyatictl --exec <host|all> [options]");
    console.log(chalk.bold.underline("\nOptions:"));
    for (const line of lines) {
      console.log(`  ${line}`);
    }
  }
}

export const logger = new Logger();
