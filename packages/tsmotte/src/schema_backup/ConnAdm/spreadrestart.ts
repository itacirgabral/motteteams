import S from 'fluent-json-schema'
import Ajv from 'ajv'

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

const ajv = new Ajv()
const spreadrestartValidate = ajv.compile(spreadrestart)

export {
  spreadrestart,
  spreadrestartValidate
} 