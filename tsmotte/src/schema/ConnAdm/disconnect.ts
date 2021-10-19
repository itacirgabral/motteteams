import S from 'fluent-json-schema'

const mkDisconnect = S.object()
  .id('disconnect')
  .additionalProperties(false)
  .prop('type', S.enum(['disconnect']).required())
  .prop('hardid', S.string().required())
  .prop('shard', S.string().required())
  .prop('url', S.string().required())
  .prop('mitochondria', S.string().required())
  .prop('cacapa', S.string().required())

const disconnect = mkDisconnect.valueOf()

export {
  disconnect
} 