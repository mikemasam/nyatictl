import fs from "fs";
import YAML from "yaml";
import type { Config, Argv } from "../types.js";
import { logger } from "../lib/logger.js";

export default async function loadConfig(argv: Argv): Promise<Config | null> {
  const cfile = argv.conf;
  if (!cfile) return null;
  return new Promise((relv) => {
    fs.stat(cfile, function (err) {
      if (err) {
        logger.configError(`Config file not found: ${argv.conf}`);
        return relv(null);
      }
      const file = fs.readFileSync(cfile, "utf8");
      let config: Config | null = null;
      try {
        config = YAML.parse(file, {});
      } catch (e) {
        logger.configError(`Failed to parse ${argv.conf}: ${e}`);
        return relv(null);
      }
      if (!config) {
        logger.configError(`Config is empty: ${argv.conf}`);
        return relv(null);
      }
      if (!config.appname) {
        logger.configError(`config.appname not defined in ${argv.conf}`);
        return relv(null);
      }
      if (!Object.keys(config.hosts || {}).length) {
        logger.configError(`config.hosts not defined or empty in ${argv.conf}`);
        return relv(null);
      }
      if (!config.tasks?.length) {
        logger.configError(`config.tasks not defined or empty in ${argv.conf}`);
        return relv(null);
      }
      config.argv = argv;
      relv(config);
    });
  });
}
