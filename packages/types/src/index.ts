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
  isConnAdm,
  Connect,
  Connectionstate,
  Disconnect,
  Signupconnection,
  isMessage,
  AudioMessage,
  ContactMessage,
  ImageMessage,
  LocationMessage,
  TextMessage,
  VideoMessage
}
