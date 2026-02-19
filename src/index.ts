#!/usr/bin/env node
import getArgv from "./parsers/parse.argv.js";
import loadConfig from "./parsers/parse.config.js";
import printHelp from "./print.help.js";
import parseTasks from "./parsers/parse.tasks.js";
import tasksRunner from "./core/tasks.runner.js";
import clietsManager from "./core/clients.manager.js";
import { DateTime } from "luxon";
import fs from "fs";
import path from "path";
import type { Config, Argv, Command } from "./types.js";

const APP_VERSION_LOCK = 11;

const argv: Argv = await getArgv();
const config: Config | null = await loadConfig(argv);
if (!config) {
  printHelp(argv, config);
  process.exit(0);
}
if (argv.h) printHelp(argv, config);
if (argv.help) printHelp(argv, config);
checkVersionNumber(config);
config.release_version = DateTime.now().toMillis();

const commands: Command[] = [];
if (config?.tasks?.length) {
  const _commands = parseTasks(config, config.tasks);
  for (let i = 0; i < _commands.length; i++) {
    commands.push(_commands[i]);
  }
}
if (argv.scripts) await loadScripts();
exec(config, argv);

async function exec(config: Config, argv: Argv): Promise<void> {
  const man = clietsManager(config, argv);
  await man.open();
  const code = await tasksRunner(man.clients, commands, argv);
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
    const _commands = parseTasks(config!, scriptConfig.tasks);
    for (let j = 0; j < _commands.length; j++) {
      commands.push(_commands[j]);
    }
  }
}

function checkVersionNumber(config: Config): void {
  if (!config.version) {
    console.log("ERROR: Invalid config version number");
    return process.exit(0);
  }
  const v = parseInt((config.version + "").split(".").join(""));
  if (isNaN(v)) {
    console.log("ERROR: Invalid config version number");
    return process.exit(0);
  }
  if (v < APP_VERSION_LOCK) {
    console.log("ERROR: you are using an version of nyatictl");
    console.log("\t update to lastest version with:");
    console.log("\t npm i -g nyatictl");
    return process.exit(0);
  }
}
