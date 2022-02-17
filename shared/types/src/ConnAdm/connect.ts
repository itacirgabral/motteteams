import S from 'fluent-json-schema'
import Ajv from 'ajv'

const mkConnect = S.object()
  .id('connect')
  .additionalProperties(false)
  .prop('type', S.enum(['connect']).required())
  .prop('hardid', S.string().required())
  .prop('shard', S.string().required())
  .prop('cacapa', S.string().required())
  .prop('auth', S.string())
  .prop('drummerStartAt', S.string())
  .prop('drummerStartAt', S.string())

const connect = mkConnect.valueOf()

const ajv = new Ajv()
const connectValidate = ajv.compile(connect)

export {
  connect,
  connectValidate
}
