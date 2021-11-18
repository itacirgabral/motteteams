import { TextMessage } from './TextMessage.d'

import { textMessageValidate } from './textMessage'

const isTextMessage = function isTextMessage (x: unknown): x is TextMessage {
  return !!textMessageValidate(x)
}

export {
  TextMessage,
  isTextMessage
}
