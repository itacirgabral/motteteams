import S from 'fluent-json-schema'
import Ajv from 'ajv'

const mkDocumentMessage = S.object()
  .id('documentMessage')
  .additionalProperties(false)
  .prop('type', S.enum(['documentMessage']).required())
  .prop('wid', S.string().required())
  .prop('from', S.string().required())
  .prop('to', S.string().required())
  .prop('timestamp', S.string().required())
  .prop('mimetype', S.string().required())
  .prop('bytes', S.string().required())
  .prop('filename', S.string().required())
  .prop('url', S.string())
  .prop('author', S.string())
  .prop('reply', S.string())
  .prop('forward', S.boolean())

const documentMessage = mkDocumentMessage.valueOf()

const ajv = new Ajv()
const documentMessageValidate = ajv.compile(documentMessage)

export {
  documentMessage,
  documentMessageValidate
}
