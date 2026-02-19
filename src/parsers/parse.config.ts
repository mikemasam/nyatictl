import fs from "fs";
import YAML from "yaml";
import type { Config, Argv } from "../types.js";

export default async function loadConfig(argv: Argv): Promise<Config | null> {
  const cfile = argv.conf;
  if (!cfile) return null;
  return new Promise((relv) => {
    fs.stat(cfile, function (err) {
      if (err) {
        console.log(`❌ERROR: config not found ${argv.conf}\n`, err);
        return relv(null);
      }
      const file = fs.readFileSync(cfile, "utf8");
      let config: Config | null = null;
      try {
        config = YAML.parse(file, {});
      } catch (e) {
        console.log(`❌ERROR: failed to load ${argv.conf}\n`, e);
        return relv(null);
      }
      if (!config) {
        console.log(`❌ERROR: config not found ${argv.conf}\n`);
        return relv(null);
      }
      if (!config.appname) {
        console.log(`❌ERROR: config.appname not defined ${argv.conf}\n`);
        return relv(null);
      }
      if (!Object.keys(config.hosts || {}).length) {
        console.log(
          `❌ERROR: config.hosts not defined or empty list ${argv.conf}\n`,
        );
        return relv(null);
      }
      if (!config.tasks?.length) {
        console.log(
          `❌ERROR: config.tasks not defined or empty list ${argv.conf}\n`,
        );
        return relv(null);
      }
      relv(config);
    });
  });
}
