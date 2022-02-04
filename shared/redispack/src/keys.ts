const crypto = require('crypto')
const hardid = process.env.HARDID || 'dev'

/**
 * Chave principal de monitoramento e controle do condado.
 * É um stream
 *
 * @example
 * ```
 * "hardid:xyz:zap:panoptic"
 * ```
 */
const panoptickey = `hardid:${hardid}:zap:panoptic`

/**
 * Chave onde as certidões de nascimento do condado são estodas.
 * É um set
 *
 * @example
 * ```
 * "hardid:xyz:borns"
 * ```
 */
const bornskey = `hardid:${hardid}:zap:borns`

/**
 * Cria uma chave aleatória para
 * cacapacomunication
 *
 * @example
 * ```
 * "hardid:xyz:cacapa:xxx"
 * ```
 */
const mkcacapakey = () => `hardid:${hardid}:cacapa:${crypto.randomBytes(16).toString('base64')}`

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
const mkchatkey = function mkchatkey ({ shard, chatid }: { shard: string; chatid: string}) {
  return `hardid:${hardid}:zap:${shard}:chat:${chatid}`
}

/**
 * Chave para o webhook da instância
 * É um hashmap
 *
 * fields
 *  - main
 *  - teams
 *  - spy
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

/**
 * TEAMS BOT
 */

/**
 * Chave principal de monitoramento e controle do condado.
 * É um stream
 *
 * @example
 * ```
 * "hardid:xyz:bot:panoptic"
 * ```
 */
const panopticbotkey = `hardid:${hardid}:bot:panoptic`

/**
 * Chave de relacionamento entre instancias do whatsapp e equipes do teams
 * É um HashMaps com chaves identificando o chatID
 *
 *  * @example
 * ```
 * hardid:hlhlny83jghtfbtv:bot:boxengine:556599887766
 * ```
 */
const mkboxenginebotkey = ({ shard }: { shard: string }) => `hardid:${hardid}:bot:boxengine:${shard}`

/**
  * Chave onde as certidões de nascimento do condado são estodas.
  * É um set
  *
  * @example
  * ```
  * "hardid:xyz:bot:borns"
  * ```
  */
const bornsbotkey = `hardid:${hardid}:bot:borns`

/**
 * Chave para marcar instância como pronta
 *
 * @example
 * ```
 * "hardid:xyz:bot:ijk"
 * ```
 */
const mkbotkey = function mkbotkey ({ shard }: { shard: string; }) {
  return `hardid:${hardid}:bot:${shard}`
}

/**
 * Chave para o baterista do teams
 *
 * supondo já está com a instancia determinada
 * cbd pode ser codigo do chat no whatsapp
 *
 * @example
 * ```
 * "hardid:xyz:zap:ijk:atende:bcd"
 * ```
 */
const mkattkey = function mkattkey ({ shard, attid }: { shard: string; attid: string }) {
  return `hardid:${hardid}:bot:${shard}:atende:${attid}`
}
/**
 * Chave para as metainformações do atendimento
 * É um hashmap
 *
 * chaves
 * - vincula
 *
 * @example
 * ```
 * "hardid:xyz:zap:ijk:atende:bcd:meta"
 * ```
 */
const mkattmetakey = function mkattmetakey ({ shard, attid }: { shard: string; attid: string }) {
  return `hardid:${hardid}:bot:${shard}:atende:${attid}:meta`
}

export {
  panoptickey,
  bornskey,
  mkcacapakey,
  mkcredskey,
  mkbookphonekey,
  mkchatkey,
  mkattkey,
  mkattmetakey,
  mkstatekey,
  mkbotkey,
  panopticbotkey,
  mkboxenginebotkey,
  bornsbotkey,
  mkstmkey,
  mktskey,
  mkqrcodekey,
  mkpongkey,
  mkfifokey,
  mkofifkey,
  mkwebhookkey
}
