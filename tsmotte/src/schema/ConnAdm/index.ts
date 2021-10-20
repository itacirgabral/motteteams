import { Connect } from './Connect.d'
import { Connectionstate } from './Connectionstate.d'
import { Disconnect } from './Disconnect.d'
import { Queuerestart } from './Queuerestart.d'
import { Signupconnection } from './Signupconnection.d'
import { Spreadrestart } from './Spreadrestart.d'

import { connect } from './connect'
import { connectionstate } from './connectionstate'
import { disconnect } from './disconnect'
import { queuerestart, queuerestartValidate } from './queuerestart'
import { signupconnection } from './signupconnection'
import { spreadrestart } from './spreadrestart'

const isQueuerestart = function isQueuerestart(x: unknown): x is Queuerestart {
  return !!queuerestartValidate(x)
}

export { Connect }
export { Connectionstate }
export { Disconnect }
export { Queuerestart, isQueuerestart }
export { Signupconnection }
export { Spreadrestart }