import S from 'fluent-json-schema'
import Ajv from 'ajv'

const mkLocationMessage = S.object()
  .id('locationMessage')
  .additionalProperties(false)
  .prop('type', S.enum(['locationMessage']).required())
  .prop('wid', S.string().required())
  .prop('from', S.string().required())
  .prop('to', S.string().required())
  .prop('timestamp', S.string().required())
  .prop('description', S.string().required())
  .prop('latitude', S.string().required())
  .prop('longitude', S.string().required())
  .prop('author', S.string())
  .prop('reply', S.string())
  .prop('forward', S.boolean())

const locationMessage = mkLocationMessage.valueOf()

const ajv = new Ajv()
const locationMessageValidate = ajv.compile(locationMessage)

export {
  locationMessage,
  locationMessageValidate
}
