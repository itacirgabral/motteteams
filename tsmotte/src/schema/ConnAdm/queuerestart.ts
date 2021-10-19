import S from 'fluent-json-schema'

const mkQueuerestart = S.object()
  .id('queuerestart')
  .additionalProperties(false)
  .prop('type', S.enum(['queuerestart']).required())
  .prop('hardid', S.string().required())
  .prop('shard', S.string().required())
  .prop('cacapa', S.string().required())

const queuerestart = mkQueuerestart.valueOf()

export {
  queuerestart
} 