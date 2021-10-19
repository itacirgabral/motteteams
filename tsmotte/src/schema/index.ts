import {
  Connect,
  Connectionstate,
  Disconnect,
  Queuerestart,
  Signupconnection,
  Spreadrestart
} from './ConnAdm'

type ConnAdm = Connect | Connectionstate | Disconnect | Queuerestart | Signupconnection | Spreadrestart

export {
  ConnAdm
}