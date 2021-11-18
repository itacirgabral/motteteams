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
  AudioMessage,
  isAudioMessageValidate,
  ContactMessage,
  isContactMessageValidate,
  ImageMessage,
  isImageMessageValidate,
  LocationMessage,
  isLocationMessageValidate,
  TextMessage,
  VideoMessage,
  isTextMessage,
  isVideoMessageValidate
} from './Message'

type Message = AudioMessage | ContactMessage | ImageMessage | LocationMessage | TextMessage | VideoMessage

const isMessage = {
  isAudioMessageValidate,
  isContactMessageValidate,
  isImageMessageValidate,
  isLocationMessageValidate,
  isTextMessage,
  isVideoMessageValidate
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
  Message,
  isConnAdm,
  isMessage,
  Connect,
  Connectionstate,
  Disconnect,
  Signupconnection,
  AudioMessage,
  ContactMessage,
  ImageMessage,
  LocationMessage,
  TextMessage,
  VideoMessage
}
