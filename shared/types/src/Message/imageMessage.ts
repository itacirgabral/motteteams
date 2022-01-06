import S from 'fluent-json-schema'
import Ajv from 'ajv'

const mkImageMessage = S.object()
  .id('imageMessage')
  .additionalProperties(false)
  .prop('type', S.enum(['imageMessage']).required())
  .prop('wid', S.string().required())
  .prop('from', S.string().required())
  .prop('to', S.string().required())
  .prop('timestamp', S.string().required())
  .prop('mimetype', S.string().required())
  .prop('bytes', S.string().required())
  .prop('caption', S.string().required())
  .prop('author', S.string())
  .prop('reply', S.string())
  .prop('forward', S.boolean())

const imageMessage = mkImageMessage.valueOf()

const ajv = new Ajv()
const imageMessageValidate = ajv.compile(imageMessage)

export {
  imageMessage,
  imageMessageValidate
}
