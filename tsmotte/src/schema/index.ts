import {
  Connect, isConnect,
  Connectionstate, isConnectionstate,
  Disconnect, isDisconnect,
  Queuerestart, isQueuerestart,
  Signupconnection, isSignupconnection,
  Spreadrestart, isSpreadrestart
} from './ConnAdm'

type ConnAdm = Connect | Connectionstate | Disconnect | Queuerestart | Signupconnection | Spreadrestart

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
  isConnAdm
}