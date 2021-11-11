import { Connect } from './Connect.d'
import { Connectionstate } from './Connectionstate.d'
import { Disconnect } from './Disconnect.d'
import { Queuerestart } from './Queuerestart.d'
import { Signupconnection } from './Signupconnection.d'
import { Spreadrestart } from './Spreadrestart.d'

import { connectValidate } from './connect'
import { connectionstateValidate } from './connectionstate'
import { disconnectValidate } from './disconnect'
import { queuerestartValidate } from './queuerestart'
import { signupconnectionValidate } from './signupconnection'
import { spreadrestartValidate } from './spreadrestart'

const isConnect = function isConnect(x: unknown): x is Connect {
  return !!connectValidate(x)
}
const isConnectionstate = function isConnectionstate(x: unknown): x is Connectionstate {
  return !!connectionstateValidate(x)
}
const isDisconnect = function isDisconnect(x: unknown): x is Disconnect {
  return !!disconnectValidate(x)
}
const isQueuerestart = function isQueuerestart(x: unknown): x is Queuerestart {
  return !!queuerestartValidate(x)
}
const isSignupconnection = function isSignupconnection(x: unknown): x is Signupconnection {
  return !!signupconnectionValidate(x)
}
const isSpreadrestart = function isSpreadrestart(x: unknown): x is Spreadrestart {
  return !!spreadrestartValidate(x)
}

export { Connect, isConnect }
export { Connectionstate, isConnectionstate }
export { Disconnect, isDisconnect }
export { Queuerestart, isQueuerestart }
export { Signupconnection, isSignupconnection }
export { Spreadrestart, isSpreadrestart }