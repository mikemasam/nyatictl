import type { Config } from "../types.js";

export default function parseLiteral(
  config: Config,
  _literal: string | undefined
): string | undefined {
  if (!_literal) return _literal;
  let literal = "" + _literal;
  const params = [...literal.matchAll(/\$\{([a-z_]*)\}/g)];
  const paramKeys = Object.keys(config.params || {});
  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    let value = "";
    if (param[1] === "appname") value = config.appname;
    else if (param[1] === "dir") value = config.dir || "";
    else if (param[1] === "release_version")
      value = String(config.release_version);
    else if (paramKeys.indexOf(param[1]) > -1) {
      value = config.params?.[param[1]] || "";
    } else {
      console.log(`❌ERROR: invalid config param ${param[0]}`);
      process.exit(0);
    }
    literal = literal.replaceAll(param[0], value);
  }
  return literal;
}
