export interface Task {
  name: string;
  cmd: string;
  expect: number;
  message?: string;
  output?: number;
  dir?: string;
  lib?: number;
  retry?: number;
  askpass?: number;
  error?: number;
  hosts?: string[];
}

export interface Server {
  host: string;
  username: string;
  port?: number;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  envpath?: string;
  envfile?: string;
  output?: boolean;
}

export interface Config {
  version: string | number;
  appname: string;
  dir?: string;
  params?: Record<string, string>;
  hosts: Record<string, Server>;
  tasks: Task[];
  argv: Argv;
  release_version?: number;
}

export interface Argv {
  conf?: string;
  h?: boolean;
  help?: boolean;
  debug?: boolean;
  task?: string;
  exec?: string | boolean;
  scripts?: boolean;
  all?: boolean;
  [key: string]: string | boolean | undefined;
}

export interface ClientsManager {
  clients: SshClient[];
  open: () => Promise<void>;
  close: () => Promise<void>;
}

export interface SshClient {
  name: string;
  server: Server;
  connected: boolean;
  password: string;
  env: Record<string, string> | null;
  connect: () => Promise<[boolean, unknown]>;
  disconnect: () => Promise<void>;
  exec: (
    task: Task,
    spinner: unknown,
    config: Config,
  ) => Promise<[number, string]>;
}
