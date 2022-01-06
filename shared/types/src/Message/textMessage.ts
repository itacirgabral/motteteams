import S from 'fluent-json-schema'
import Ajv from 'ajv'

const mkTextMessage = S.object()
  .id('textMessage')
  .additionalProperties(false)
  .prop('type', S.enum(['textMessage']).required())
  .prop('wid', S.string().required())
  .prop('from', S.string().required())
  .prop('to', S.string().required())
  .prop('timestamp', S.string().required())
  .prop('msg', S.string().required())
  .prop('author', S.string())
  .prop('reply', S.string())
  .prop('forward', S.boolean())

const textMessage = mkTextMessage.valueOf()

const ajv = new Ajv()
const textMessageValidate = ajv.compile(textMessage)

export {
  textMessage,
  textMessageValidate
}
