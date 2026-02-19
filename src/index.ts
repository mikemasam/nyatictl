#!/usr/bin/env node
import getArgv from "./parsers/parse.argv.js";
import loadConfig from "./parsers/parse.config.js";
import printHelp from "./print.help.js";
import parseTasks from "./parsers/parse.tasks.js";
import tasksRunner from "./core/tasks.runner.js";
import clietsManager from "./core/clients.manager.js";
import { logger } from "./lib/logger.js";
import { DateTime } from "luxon";
import fs from "fs";
import path from "path";
import type { Config, Argv, Task } from "./types.js";

const APP_VERSION_LOCK = 11;

const _argv: Argv = await getArgv();
if (_argv.h || _argv.help) {
  printHelp(_argv, null);
  process.exit(0);
}
const config: Config | null = await loadConfig(_argv);

if (!config) {
  printHelp(_argv, null);
  process.exit(0);
}
checkVersionNumber(config);
config.release_version = DateTime.now().toMillis();

const tasks: Task[] = config?.tasks;
if (config.argv.scripts) await loadScripts();
exec(config);

async function exec(config: Config): Promise<void> {
  const man = clietsManager(config);
  await man.open();
  const code = await tasksRunner(config, man.clients, tasks);
  await man.close();
  return process.exit(code);
}

async function loadScripts(): Promise<void> {
  const dir = path.resolve("./scripts");
  const scripts = fs.readdirSync(dir);
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    const scriptConfig = await loadConfig({ conf: `${dir}/${script}` } as Argv);
    if (!scriptConfig || !scriptConfig.tasks) continue;
    const _commands = scriptConfig.tasks;
    for (let j = 0; j < _commands.length; j++) {
      tasks.push(_commands[j]);
    }
  }
}

function checkVersionNumber(config: Config): void {
  if (!config.version) {
    logger.error("Invalid config version number");
    process.exit(0);
  }
  const v = parseInt((config.version + "").split(".").join(""));
  if (isNaN(v)) {
    logger.error("Invalid config version number");
    process.exit(0);
  }
  return;
  /*
  if (v < APP_VERSION_LOCK) {
    logger.error(`You are using an older version ${config.version} of nyatictl`);
    logger.info("Update nyati.yaml to latest version with:");
    logger.info("  npm i -g nyatictl");
    process.exit(0);
  }
  */
}
