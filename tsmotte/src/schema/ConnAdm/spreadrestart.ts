import S from 'fluent-json-schema'

const mkSpreadrestart = S.object()
  .id('spreadrestart')
  .additionalProperties(false)
  .prop('type', S.enum(['spreadrestart']).required())
  .prop('hardid', S.string().required())
  .prop('shard', S.string().required())
  .prop('url', S.string().required())
  .prop('mitochondria', S.string().required())
  .prop('cacapa', S.string().required())

const spreadrestart = mkSpreadrestart.valueOf()

export {
  spreadrestart
} 