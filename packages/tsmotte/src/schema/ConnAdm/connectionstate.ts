import S from 'fluent-json-schema'
import Ajv from 'ajv'

const mkConnectionstate = S.object()
  .id('connectionstate')
  .additionalProperties(false)
  .prop('type', S.enum(['connectionstate']).required())
  .prop('hardid', S.string().required())
  .prop('shard', S.string().required())
  .prop('cacapa', S.string().required())

const connectionstate = mkConnectionstate.valueOf()

const ajv = new Ajv()
const connectionstateValidate = ajv.compile(connectionstate)

export {
  connectionstate,
  connectionstateValidate
} 