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

/**
 * Chave para as credenciais de uma instancia
 *
 * @example
 * ```
 * "hardid:xyz:zap:ijk:creds"
 * ```
 */
const mkcredskey = function mkcredskey ({ shard }: { shard: string }) {
  return `hardid:${hardid}:zap:${shard}:creds`
}

/**
 * Chave para as grupos e contatos agendados
 * É um hashmap
 *
 * @example
 * ```
 * "hardid:xyz:zap:ijk:bookphone"
 * ```
 */
const mkbookphonekey = function mkbookphonekey ({ shard }: { shard: string; }) {
  return `hardid:${hardid}:zap:${shard}:bookphone`
}

/**
 * Chave para as conversas disponíveis
 * É um hashmap
 *
 * @example
 * ```
 * "hardid:xyz:zap:ijk:chat"
 * ```
 */
const mkchatkey = function mkchatkey ({ shard }: { shard: string; }) {
  return `hardid:${hardid}:zap:${shard}:chat`
}

/**
 * Chave para o webhook da instância
 * É um hashmap
 *
 * @example
 * ```
 * "hardid:xyz:zap:ijk:chat:bookphone"
 * ```
 */
const mkwebhookkey = function mkwebhookkey ({ shard }: { shard: string; }) {
  return `hardid:${hardid}:zap:${shard}:webhook`
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
  mkbookphonekey,
  mkchatkey,
  mkstatekey,
  mkstmkey,
  mktskey,
  mkqrcodekey,
  mkpongkey,
  mkfifokey,
  mkofifkey,
  mkwebhookkey
}
