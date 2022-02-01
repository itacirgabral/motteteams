import S from 'fluent-json-schema'
import Ajv from 'ajv'

const mkAudioMessage = S.object()
  .id('audioMessage')
  .additionalProperties(false)
  .prop('type', S.enum(['audioMessage']).required())
  .prop('wid', S.string().required())
  .prop('from', S.string().required())
  .prop('to', S.string().required())
  .prop('timestamp', S.string().required())
  .prop('mimetype', S.string().required())
  .prop('bytes', S.string().required())
  .prop('url', S.string())
  .prop('author', S.string())
  .prop('reply', S.string())
  .prop('forward', S.boolean())

const audioMessage = mkAudioMessage.valueOf()

const ajv = new Ajv()
const audioMessageValidate = ajv.compile(audioMessage)

export {
  audioMessage,
  audioMessageValidate
}
