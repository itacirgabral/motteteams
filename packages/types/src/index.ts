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

import {
  TextMessage,
  isTextMessage
} from './Message'

const isMessage = {
  isTextMessage
}

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
  isConnAdm,
  Connect,
  Connectionstate,
  Disconnect,
  Signupconnection,
  TextMessage,
  isMessage
}
