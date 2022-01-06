import S from 'fluent-json-schema'
import Ajv from 'ajv'

const mkDisconnect = S.object()
  .id('disconnect')
  .additionalProperties(false)
  .prop('type', S.enum(['disconnect']).required())
  .prop('hardid', S.string().required())
  .prop('shard', S.string().required())
  .prop('cacapa', S.string().required())

const disconnect = mkDisconnect.valueOf()

const ajv = new Ajv()
const disconnectValidate = ajv.compile(disconnect)

export {
  disconnect,
  disconnectValidate
}
