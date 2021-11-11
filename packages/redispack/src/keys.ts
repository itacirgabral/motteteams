const hardid = process.env.HARDID || 'dev'

/**
 * Chave principal de monitoramento e controle do condado.
 * É um stream
 *
 * @example
 * ```
 * "hardid:xyz:panoptic"
 * ```
 */
const panoptickey = `hardid:${hardid}:panoptic`

/**
 * Chave onde as certidões de nascimento do condado são estodas.
 * É um set
 *
 * @example
 * ```
 * "hardid:xyz:borns"
 * ```
 */
const bornskey = `hardid:${hardid}:borns`

const mkcredskey = function mkcredskey ({ shard }: { shard: string }) {
  return `hardid:${hardid}:zap:${shard}:creds`
}

const mkstatekey = function mkstatekey ({ shard }: { shard: string }) {
  return `hardid:${hardid}:zap:${shard}:state`
}

const mkstmkey = function mkstmkey ({ shard }: { shard: string }) {
  return `hardid:${hardid}:zap:${shard}:stm`
}

const mktskey = function mktskey ({ shard, type }: { shard: string; type: string }) {
  return `hardid:${hardid}:zap:${shard}:timeserie:${type}`
}

const mkqrcodekey = function mkqrcodekey ({ shard, qrcode }: { shard: string; qrcode: string }) {
  return `hardid:${hardid}:zap:${shard}:qrcode:${qrcode}`
}

const mkpongkey = function mkpongkey ({ shard }: { shard: string }) {
  return `hardid:${hardid}:zap:${shard}:pong`
}

const mkfifokey = function mkfifokey ({ shard }: { shard: string }) {
  return `hardid:${hardid}:zap:${shard}:fifo`
}

const mkofifkey = function mkofifkey ({ shard }: { shard: string }) {
  return `hardid:${hardid}:zap:${shard}:ofif`
}

export {
  panoptickey,
  bornskey,
  mkcredskey,
  mkstatekey,
  mkstmkey,
  mktskey,
  mkqrcodekey,
  mkpongkey,
  mkfifokey,
  mkofifkey
}
