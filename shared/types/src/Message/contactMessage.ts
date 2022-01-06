import S from 'fluent-json-schema'
import Ajv from 'ajv'

const mkContactMessage = S.object()
  .id('contactMessage')
  .additionalProperties(false)
  .prop('type', S.enum(['contactMessage']).required())
  .prop('wid', S.string().required())
  .prop('from', S.string().required())
  .prop('to', S.string().required())
  .prop('timestamp', S.string().required())
  .prop('vcard', S.string().required())
  .prop('author', S.string())
  .prop('reply', S.string())
  .prop('forward', S.boolean())

const contactMessage = mkContactMessage.valueOf()

const ajv = new Ajv()
const contactMessageValidate = ajv.compile(contactMessage)

export {
  contactMessage,
  contactMessageValidate
}
