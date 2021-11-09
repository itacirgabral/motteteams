import {
  Connect,
  Connectionstate,
  Disconnect,
  Queuerestart,
  Signupconnection,
  Spreadrestart,
} from './ConnAdm'

import {
  isConnect,
  isConnectionstate,
  isDisconnect,
  isQueuerestart,
  isSignupconnection,
  isSpreadrestart
} from './ConnAdm'

/**
 * Tipo ConnAdm, conjunto de tipos que controla a conexão
 */
type ConnAdm = Connect | Connectionstate | Disconnect | Queuerestart | Signupconnection | Spreadrestart
type ConnectionSwitch = Connect | Disconnect | Connectionstate


const isConnAdm = {
  isConnect,
  isConnectionstate,
  isDisconnect,
  isQueuerestart,
  isSignupconnection,
  isSpreadrestart
}

export {
  ConnAdm,
  ConnectionSwitch,
  isConnAdm
}