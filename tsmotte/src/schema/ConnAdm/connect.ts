import S from 'fluent-json-schema'

const mkConnect = S.object()
  .id('connect')
  .additionalProperties(false)
  .prop('type', S.enum(['connect']).required())
  .prop('hardid', S.string().required())
  .prop('shard', S.string().required())
  .prop('cacapa', S.string().required())

const connect = mkConnect.valueOf()

export {
  connect
} 