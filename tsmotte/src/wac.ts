import { Connect, Disconnect, Connectionstate} from './schema/ConnAdm'

type ConnectionSwitch = Connect | Disconnect | Connectionstate

const wac = (connectionSwitch: ConnectionSwitch) => {
  //
}

const wacPC = (connectionSwitch: ConnectionSwitch) => {
  console.dir(connectionSwitch)
  // - [ ] siwtch pra separar connect, disconnect e connectionState
  // (...)
}

export {
  wac,
  wacPC
}