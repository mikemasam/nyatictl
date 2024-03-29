#!/usr/bin/env node
import getArgv from "./parse.argv.js";
import loadConfig from "./parse.config.js";
import printHelp from "./print.help.js";
import parseTasks from "./parse.tasks.js";
import tasksRunner from "./tasks.runner.js";
import clietsManager from "./clients.manager.js";
import { DateTime } from "luxon";
import fs from "fs";
import path from "path";

//only when breaking change has been added
const APP_VERSION_LOCK = 11;

const argv = await getArgv();
const config = await loadConfig(argv);
if (!config) printHelp(argv, config);
if (argv.h) printHelp(argv, config);
if (argv.help) printHelp(argv, config);
checkVersionNumber(config);
config.release_version = DateTime.now().toMillis();

const commands = [];
if (config?.tasks?.length) {
  const _commands = parseTasks(config, config.tasks);
  for (let i = 0; i < _commands.length; i++) {
    commands.push(_commands[i]);
  }
}
if (argv.scripts) await loadScripts();
exec(config, argv);

async function exec(config, argv) {
  const man = clietsManager(config, argv);
  await man.open();
  const code = await tasksRunner(man.clients, commands, argv);
  await man.close();
  return process.exit(code);
}

async function loadScripts() {
  const dir = path.resolve("./scripts");
  const scripts = fs.readdirSync(dir);
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    const tasks = await loadConfig(`${dir}/${script}`);
    const _commands = parseTasks(config, tasks);
    for (let i = 0; i < _commands.length; i++) {
      commands.push(_commands[i]);
    }
  }
}

function checkVersionNumber(config) {
  if (!config.version) {
    console.log("ERROR: Invalid config version number");
    return process.exit(0);
  }
  const v = parseInt((config.version + "")?.split(".")?.join(""));
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
