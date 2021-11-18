import S from 'fluent-json-schema'
import Ajv from 'ajv'

const mkVideoMessage = S.object()
  .id('videoMessage')
  .additionalProperties(false)
  .prop('type', S.enum(['videoMessage']).required())
  .prop('wid', S.string().required())
  .prop('from', S.string().required())
  .prop('to', S.string().required())
  .prop('timestamp', S.string().required())
  .prop('mimetype', S.string().required())
  .prop('bytes', S.string().required())
  .prop('seconds', S.string().required())
  .prop('gif', S.boolean().required())
  .prop('caption', S.string().required())
  .prop('author', S.string())
  .prop('reply', S.string())
  .prop('forward', S.boolean())

const videoMessage = mkVideoMessage.valueOf()

const ajv = new Ajv()
const videoMessageValidate = ajv.compile(videoMessage)

export {
  videoMessage,
  videoMessageValidate
}
