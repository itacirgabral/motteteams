import { AudioMessage } from './AudioMessage'
import { ContactMessage } from './ContactMessage'
import { ImageMessage } from './ImageMessage'
import { LocationMessage } from './LocationMessage'
import { TextMessage } from './TextMessage.d'
import { VideoMessage } from './VideoMessage'

import { audioMessageValidate } from './audioMessage'
import { contactMessageValidate } from './contactMessage'
import { imageMessageValidate } from './imageMessage'
import { locationMessageValidate } from './locationMessage'
import { textMessageValidate } from './textMessage'
import { videoMessageValidate } from './videoMessage'

const isAudioMessageValidate = function isAudioMessageValidate (x: unknown) : x is AudioMessage {
  return !!audioMessageValidate(x)
}
const isContactMessageValidate = function isContactMessageValidate (x: unknown) : x is ContactMessage {
  return !!contactMessageValidate(x)
}
const isImageMessageValidate = function isImageMessageValidate (x: unknown) : x is ImageMessage {
  return !!imageMessageValidate(x)
}
const isLocationMessageValidate = function isLocationMessageValidate (x: unknown) : x is LocationMessage {
  return !!locationMessageValidate(x)
}
const isTextMessage = function isTextMessage (x: unknown): x is TextMessage {
  return !!textMessageValidate(x)
}
const isVideoMessageValidate = function isVideoMessageValidate (x: unknown) : x is VideoMessage {
  return !!videoMessageValidate(x)
}

export {
  AudioMessage,
  isAudioMessageValidate,
  ContactMessage,
  isContactMessageValidate,
  ImageMessage,
  isImageMessageValidate,
  LocationMessage,
  isLocationMessageValidate,
  TextMessage,
  isTextMessage,
  VideoMessage,
  isVideoMessageValidate
}
