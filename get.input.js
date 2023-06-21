import prompt from "prompt";
prompt.message = "Nyatictl";
const cache = {};
const isEmpty = (str) => {
  return str === "" || str === null || str === undefined;
};
export default async function getInput(client, opt) {
  const { label, name, required = true, hidden = false } = opt;
  let value = client.server[name];
  value = await parseEnv(client, name, value);
  //console.log(name, value);
  if (!isEmpty(value)) return value;
  value = await readInput(label, name, required, hidden);
  return value;
}

async function readInput(label, name, required, hidden) {
  const options = {
    name: "value",
    description: `Enter '${label}' ${name}`,
    hidden: !!hidden,
    replace: hidden ? "*" : undefined,
    required: required,
    type: "string",
  };
  const result = await prompt.get([options]).catch((err) => false);
  if (result == false) {
    console.log("");
    process.exit(0);
  }
  return result.value;
}

async function parseEnv(client, name, value) {
  let _env_name = null;
  if (isEmpty(value)) _env_name = `NYATI_${name}`;
  if (!isEmpty(value) && value.toLowerCase().indexOf("#env:") == 0) {
    _env_name = `NYATI_${value.split("#env:")[1]}`;
  } else {
    return value;
  }
  let nvalue = client.env[_env_name];
  if (nvalue == undefined) console.log(` ${_env_name} not defined`);
  //  console.log(
  //    "get: ",
  //    name,
  //    ", env_name:",
  //    _env_name,
  //    ", client:",
  //    client.env,
  //    " value: ",
  //    nvalue
  //  );
  return nvalue;
}
