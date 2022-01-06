import S from 'fluent-json-schema'
import Ajv from 'ajv'

const mkSignupconnection = S.object()
  .id('signupconnection')
  .additionalProperties(false)
  .prop('type', S.enum(['signupconnection']).required())
  .prop('hardid', S.string().required())
  .prop('shard', S.string().required())
  .prop('url', S.string().required())
  .prop('mitochondria', S.string().required())
  .prop('cacapa', S.string().required())

const signupconnection = mkSignupconnection.valueOf()

const ajv = new Ajv()
const signupconnectionValidate = ajv.compile(signupconnection)

export {
  signupconnection,
  signupconnectionValidate
}
