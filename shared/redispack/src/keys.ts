const crypto = require('crypto')
const hardid = process.env.HARDID || 'dev'

/**
 * Chave principal de monitoramento e controle do condado.
 * É um stream
 *
 * @example
 * ```
 * "hardid:xyz:whatsapp:panoptic"
 * ```
 */
const panoptickey = `hardid:${hardid}:whatsapp:panoptic`

/**
 * Chave onde as certidões de nascimento do condado são estodas.
 * É um set
 *
 * @example
 * ```
 * "hardid:xyz:borns"
 * ```
 */
const bornskey = `hardid:${hardid}:whatsapp:borns`

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
 * "hardid:xyz:whatsapp:ijk:creds"
 * ```
 */
const mkcredskey = function mkcredskey ({ shard }: { shard: string }) {
  return `hardid:${hardid}:whatsapp:${shard}:creds`
}

/**
 * Chave para as grupos e contatos agendados
 * É um hashmap
 *
 * @example
 * ```
 * "hardid:xyz:whatsapp:ijk:bookphone"
 * ```
 */
const mkbookphonekey = function mkbookphonekey ({ shard, cid }: { shard: string; cid: string; }) {
  return `hardid:${hardid}:whatsapp:${shard}:bookphone:${cid}`
}

/**
 * Chave para as conversas disponíveis
 * É um hashmap
 *
 * @example
 * ```
 * "hardid:xyz:whatsapp:ijk:chat"
 * ```
 */
const mkchatkey = function mkchatkey ({ shard, chatid }: { shard: string; chatid: string}) {
  return `hardid:${hardid}:whatsapp:${shard}:chat:${chatid}`
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
 * "hardid:xyz:whatsapp:ijk:chat:bookphone"
 * ```
 */
const mkwebhookkey = function mkwebhookkey ({ shard }: { shard: string; }) {
  return `hardid:${hardid}:whatsapp:${shard}:webhook`
}

const mkstatekey = function mkstatekey ({ shard }: { shard: string }) {
  return `hardid:${hardid}:whatsapp:${shard}:state`
}

const mkstmkey = function mkstmkey ({ shard }: { shard: string }) {
  return `hardid:${hardid}:whatsapp:${shard}:stm`
}

const mktskey = function mktskey ({ shard, type }: { shard: string; type: string }) {
  return `hardid:${hardid}:whatsapp:${shard}:timeserie:${type}`
}

const mkqrcodekey = function mkqrcodekey ({ shard, qrcode }: { shard: string; qrcode: string }) {
  return `hardid:${hardid}:whatsapp:${shard}:qrcode:${qrcode}`
}

const mkpongkey = function mkpongkey ({ shard }: { shard: string }) {
  return `hardid:${hardid}:whatsapp:${shard}:pong`
}

const mkfifokey = function mkfifokey ({ shard }: { shard: string }) {
  return `hardid:${hardid}:whatsapp:${shard}:fifo`
}

const mkofifkey = function mkofifkey ({ shard }: { shard: string }) {
  return `hardid:${hardid}:whatsapp:${shard}:ofif`
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
 * "hardid:xyz:msteams:panoptic"
 * ```
 */
const panopticbotkey = `hardid:${hardid}:msteams:panoptic`

/**
 * Chave de relacionamento entre instancias do whatsapp e equipes do teams
 * É um HashMaps com chaves identificando o chatID
 *
 *  * @example
 * ```
 * hardid:hlhlny83jghtfbtv:msteams:boxengine:556599887766
 * ```
 */
const mkboxenginebotkey = ({ shard }: { shard: string }) => `hardid:${hardid}:msteams:boxengine:${shard}`

/**
  * Chave onde as certidões de nascimento do condado são estodas.
  * É um set
  *
  * @example
  * ```
  * "hardid:xyz:msteams:borns"
  * ```
  */
const bornsbotkey = `hardid:${hardid}:msteams:borns`

/**
 * Chave para marcar instância como pronta
 *
 * @example
 * ```
 * "hardid:xyz:msteams:ijk"
 * ```
 */
const mkbotkey = function mkbotkey ({ shard }: { shard: string; }) {
  return `hardid:${hardid}:msteams:${shard}`
}

/**
 * Chave para o baterista do teams
 *
 * supondo já está com a instancia determinada
 * cbd pode ser codigo do chat no whatsapp
 *
 * @example
 * ```
 * "hardid:xyz:whatsapp:ijk:atende:bcd"
 * ```
 */
const mkattkey = function mkattkey ({ shard, attid }: { shard: string; attid: string }) {
  return `hardid:${hardid}:msteams:${shard}:atende:${attid}`
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
 * "hardid:xyz:whatsapp:ijk:atende:bcd:meta"
 * ```
 */
const mkattmetakey = function mkattmetakey ({ shard, attid }: { shard: string; attid: string }) {
  return `hardid:${hardid}:msteams:${shard}:atende:${attid}:meta`
}

/**
 * GESTOR SISTEMAS
 */
/**
 * Chave para os escritórios
 * É um hashmap
 *
 * @example
 * ```
 * "hardid:xyz:office:oid"
 * ```
 */
const mkofficekey = function mkofficekey ({ shard, oid }: { shard: string; oid: string }) {
  return `hardid:${hardid}:office:${oid}`
}
/**
 * Chave para as empresas
 * É um hashmap
 *
 * @example
 * ```
 * "hardid:xyz:company:cio"
 * ```
 */
const mkcompanykey = function mkcompanykey ({ shard, cid }: { shard: string; cid: string }) {
  return `hardid:${hardid}:company:${cid}`
}
/**
 * Chave para as empresas
 * É um hashmap
 * fields
 *  - tenant
 *  - oid
 *  - email
 *  - appid
 *  - accessTk
 *  - refreshTk
 *
 * @example
 * ```
 * "hardid:xyz:user:oid"
 * ```
 */
const mkuserkey = function mkcompanykey ({ oid }: { oid: string; }) {
  return `hardid:${hardid}:user:${oid}`
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
  mkwebhookkey,
  mkofficekey,
  mkcompanykey,
  mkuserkey
}
