import S from 'fluent-json-schema'
import Ajv from 'ajv'

const mkQueuerestart = S.object()
  .id('queuerestart')
  .additionalProperties(false)
  .prop('type', S.enum(['queuerestart']).required())
  .prop('hardid', S.string().required())
  .prop('shard', S.string().required())
  .prop('cacapa', S.string().required())

const queuerestart = mkQueuerestart.valueOf()

const ajv = new Ajv()
const queuerestartValidate = ajv.compile(queuerestart)

export {
  queuerestart,
  queuerestartValidate
} 