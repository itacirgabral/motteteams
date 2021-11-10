import { ChildProcess } from "child_process"

interface BlueCable {
  connected: boolean;
  connecting: boolean;
  wacP: ChildProcess
}

type shard = string;

/**
 * Painel de conexões
 * @key     string cellphone number
 * @value   string n kown yet
 */
const patchpanel = new Map<shard, BlueCable>()

export {
  patchpanel
}