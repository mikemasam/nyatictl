import prompt from "prompt";
import type { Server } from "../types.js";
import { logger } from "./logger.js";

prompt.message = "Nyatictl";

interface GetInputOptions {
  label: string;
  name: string;
  required?: boolean;
  hidden?: boolean;
}

interface SshClientLike {
  server: Server;
  env: Record<string, string> | null;
}

const isEmpty = (str: string | null | undefined): boolean => {
  return str === "" || str === null || str === undefined;
};

export default async function getInput(
  client: SshClientLike,
  opt: GetInputOptions
): Promise<string | undefined> {
  const { label, name, required = true, hidden = false } = opt;
  let value: string | undefined = client.server[name as keyof typeof client.server] as string | undefined;
  const [next_value, optional] = await parseEnv(client, name, value);
  value = next_value;
  if (!isEmpty(value)) return value;
  if (optional) return undefined;
  value = await readInput(label, name, required, hidden);
  return value;
}

async function readInput(
  label: string,
  name: string,
  required: boolean,
  hidden: boolean
): Promise<string> {
  const options = {
    name: "value" as const,
    description: `Enter '${label}' ${name}`,
    hidden: !!hidden,
    replace: hidden ? "*" : undefined,
    required: required,
    type: "string" as const,
  };
  const result = await prompt.get([options]) as { value: string };
  return result.value;
}

async function parseEnv(
  client: SshClientLike,
  name: string,
  value: string | undefined
): Promise<[string | undefined, boolean]> {
  let _env_name: string | null = null;
  let optional = false;
  if (isEmpty(value)) _env_name = `NYATI_${name}`;
  else if (value && value.toLowerCase().indexOf("#env:") === 0) {
    _env_name = `NYATI_${value.split("#env:")[1]}`;
  } else if (value && value.toLowerCase().indexOf("#env?:") === 0) {
    _env_name = `NYATI_${value.split("#env?:")[1]}`;
    optional = true;
  } else {
    return [value, optional];
  }
  const nvalue = client.env?.[_env_name as string];
  if (nvalue === undefined && !optional)
    logger.warn(`Environment variable not defined: ${_env_name}`);
  return [nvalue, optional];
}
