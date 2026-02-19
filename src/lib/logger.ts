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

  private format(level: string, message: string): string {
    const timestamp = this.timestamps
      ? `${DateTime.now().toFormat("HH:mm:ss")} `
      : "";
    const prefix = this.color ? level : level.replace(/\[\d+m/g, "");
    return `${timestamp}${prefix}${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.level > LogLevel.DEBUG) return;
    const msg = this.format(chalk.gray("💡"), message);
    console.log(msg, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    if (this.level > LogLevel.INFO) return;
    const msg = this.format(chalk.blue("!"), " " + message);
    console.log(msg, ...args);
  }

  success(message: string, ...args: unknown[]): void {
    if (this.level > LogLevel.SUCCESS) return;
    const msg = this.format(chalk.green("✔"), " " + message);
    console.log(msg, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.level > LogLevel.WARN) return;
    const msg = this.format(chalk.yellow("⚠️"), " " + message);
    console.warn(msg, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    if (this.level > LogLevel.ERROR) return;
    const msg = this.format(chalk.red("✗"), " " + message);
    console.error(msg, ...args);
  }

  consoleOutput(command: string | null, output: string): void {
    const cmd = this.format(chalk.cyan("$ "), `${command}`);
    console.log(cmd + "\n" + output);
  }

  taskSuccess(
    client: SshClient,
    taskName: string,
    code: number,
    message?: string,
  ): void {
    if (this.level > LogLevel.SUCCESS) return;
    const codeMsg = chalk.gray(`code: ${code} -`);
    const msg = this.format(
      chalk.green(`✔ [${client.name}:${client.server.host}]`),
      ` ${codeMsg} ${taskName}: ${message ?? "..."}`,
    );
    console.log(msg);
  }

  taskFail(
    client: SshClient,
    taskName: string,
    code: number,
    message?: string,
  ): void {
    const codeMsg = chalk.gray(`code: ${code} -`);
    const msg = this.format(
      chalk.red(`✗ [${client.name}:${client.server.host}]`),
      ` ${codeMsg} ${taskName}: ${message}`,
    );
    console.error(msg);
  }

  serverConnect(name: string, host: string): void {
    if (this.level > LogLevel.INFO) return;
    const msg = this.format(chalk.magenta("🖥"), ` ${name}@${host}`);
    console.log(msg);
  }

  serverError(name: string, message: string): void {
    const msg = this.format(chalk.red("🖥✗"), ` ${name}: ${message}`);
    console.error(msg);
  }

  configError(message: string): void {
    const msg = this.format(chalk.red("⚙✗"), " " + message);
    console.error(msg);
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
