import S from 'fluent-json-schema'

const mkConnectionstate = S.object()
  .id('connectionstate')
  .additionalProperties(false)
  .prop('type', S.enum(['connectionstate']).required())
  .prop('hardid', S.string().required())
  .prop('shard', S.string().required())
  .prop('url', S.string().required())
  .prop('mitochondria', S.string().required())
  .prop('cacapa', S.string().required())

const connectionstate = mkConnectionstate.valueOf()

export {
  connectionstate
} 