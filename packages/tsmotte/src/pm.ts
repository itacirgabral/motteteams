import { ChildProcess } from 'child_process'

interface ProcessManagerADM {
  id: string;
}

const pm = new WeakMap<ChildProcess, ProcessManagerADM>()

export {
  pm
}