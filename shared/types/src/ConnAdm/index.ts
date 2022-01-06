import { Connect } from './Connect.d'
import { Connectionstate } from './Connectionstate.d'
import { Disconnect } from './Disconnect.d'
import { Signupconnection } from './Signupconnection.d'

import { connectValidate } from './connect'
import { connectionstateValidate } from './connectionstate'
import { disconnectValidate } from './disconnect'
import { signupconnectionValidate } from './signupconnection'

const isConnect = function isConnect (x: unknown): x is Connect {
  return !!connectValidate(x)
}
const isConnectionstate = function isConnectionstate (x: unknown): x is Connectionstate {
  return !!connectionstateValidate(x)
}
const isDisconnect = function isDisconnect (x: unknown): x is Disconnect {
  return !!disconnectValidate(x)
}
const isSignupconnection = function isSignupconnection (x: unknown): x is Signupconnection {
  return !!signupconnectionValidate(x)
}

export { Connect, isConnect }
export { Connectionstate, isConnectionstate }
export { Disconnect, isDisconnect }
export { Signupconnection, isSignupconnection }
