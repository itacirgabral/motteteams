import S from 'fluent-json-schema'

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

export {
  signupconnection
} 