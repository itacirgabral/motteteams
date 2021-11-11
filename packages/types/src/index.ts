import {
  Connect,
  Connectionstate,
  Disconnect,
  Signupconnection,
  isConnect,
  isConnectionstate,
  isDisconnect,
  isSignupconnection
} from './ConnAdm'

/**
 * Tipo ConnAdm, conjunto de tipos que controla a conexão
 */
type ConnAdm = Connect | Connectionstate | Disconnect | Signupconnection
type ConnectionSwitch = Connect | Disconnect | Connectionstate

const isConnAdm = {
  isConnect,
  isConnectionstate,
  isDisconnect,
  isSignupconnection
}

export {
  ConnAdm,
  ConnectionSwitch,
  isConnAdm
}
