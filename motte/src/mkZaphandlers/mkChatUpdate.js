const fetch = require('node-fetch')
const FormData = require('form-data')
const fs = require('fs')

/**
 *  when a chat is updated (new message, updated message, deleted, pinned, presence updated etc)
 * on (event: 'chat-update', listener: (chat: Partial<WAChat> & { jid: string }) => void): this
 */
const chatUpdate = ({ shard, redis, connP }) => {
  const logKey = `zap:${shard}:log`
  const newsKey = `zap:${shard}:news`
  const markkey = `zap:${shard}:mark`
  const webhookkey = `zap:${shard}:webhook`

  return async (chat) => {
    const json = JSON.stringify({ event: 'chat-update', data: chat })
    const pipeline = redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 99)
    pipeline.publish(newsKey, json)
    pipeline.get(webhookkey)// 3

    const id = chat?.messages?.array[0]?.key?.id
    if (id) {
      pipeline.hget(markkey, id)// 4
    }
    const result = await pipeline.exec()

    const number = chat.jid.split('@s.whatsapp.net')[0]
    const webhook = result[3][1]

    if (
      number.indexOf('-') === -1 && // Não é um grupo
      !chat.presences && // não é uma presença
      chat.count > 0 // não é ver tudo
    ) {
      const message = chat.messages.array[0]
      const to = shard
      const from = number
      const id = message.key.id

      let msg = message.message.conversation
      const location = message.message.locationMessage
      const contact = message.message.contactMessage
      const image = message.message.imageMessage
      const document = message.message.documentMessage
      const audio = message.message.audioMessage
      const quoteMsg = message.message.extendedTextMessage

      let type
      let isQuoted = false
      let isForwarded = false
      if (msg) {
        type = 'textMessage'
      } else if (quoteMsg) {
        type = 'textMessage'
        msg = quoteMsg.text
        if (quoteMsg.contextInfo?.isForwarded) {
          isForwarded = true
        }
        if (quoteMsg.contextInfo?.stanzaId) {
          isQuoted = true
        }
      } else if (contact) {
        type = 'contactMessage'
        if (contact?.contextInfo?.isForwarded) {
          isForwarded = true
        }
        if (contact?.contextInfo?.stanzaId) {
          isQuoted = true
        }
      } else if (location) {
        type = 'locationMessage'
        if (location?.contextInfo?.isForwarded) {
          isForwarded = true
        }
        if (location?.contextInfo?.stanzaId) {
          isQuoted = true
        }
      } else if (image) {
        type = 'imageMessage'
        if (image?.contextInfo?.isForwarded) {
          isForwarded = true
        }
        if (image?.contextInfo?.stanzaId) {
          isQuoted = true
        }
      } else if (document) {
        type = 'documentMessage'
        if (document?.contextInfo?.isForwarded) {
          isForwarded = true
        }
        if (document?.contextInfo?.stanzaId) {
          isQuoted = true
        }
      } else if (audio) {
        type = 'audioMessage'
        if (audio?.contextInfo?.isForwarded) {
          isForwarded = true
        }
        if (audio?.contextInfo?.stanzaId) {
          isQuoted = true
        }
      }

      switch (type) {
        case 'textMessage':
          if (webhook) {
            const jsontosend = {
              type,
              to,
              from,
              msg,
              forwarded: isForwarded ? true : undefined,
              quoted: isQuoted ? quoteMsg.contextInfo.stanzaId : undefined,
              wid: id
            }
            fetch(webhook, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(jsontosend)
            }).catch(() => {})
          }
          break
        case 'locationMessage':
          if (webhook) {
            const jsontosend = {
              type,
              to,
              from,
              forwarded: isForwarded ? true : undefined,
              quoted: isQuoted ? location.contextInfo.stanzaId : undefined,
              wid: id,
              description: location.address,
              latitude: location.degreesLatitude,
              longitude: location.degreesLongitude
            }
            fetch(webhook, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(jsontosend)
            }).catch(() => {})
          }
          break
        case 'contactMessage':
          if (webhook) {
            const jsontosend = {
              type,
              to,
              from,
              forwarded: isForwarded ? true : undefined,
              quoted: isQuoted ? contact.contextInfo.stanzaId : undefined,
              vcard: contact.vcard,
              wid: id
            }
            fetch(webhook, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(jsontosend)
            }).catch(() => {})
          }
          break
        case 'imageMessage':
          if (webhook) {
            const url = new URL(webhook)
            url.searchParams.append('type', type)
            url.searchParams.append('to', to)
            url.searchParams.append('from', from)
            if (isForwarded) {
              url.searchParams.append('forwarded', 'true')
            }
            if (isQuoted) {
              url.searchParams.append('quoted', image.contextInfo.stanzaId)
            }
            url.searchParams.append('mimetype', image.mimetype)
            url.searchParams.append('size', image.fileLength)
            url.searchParams.append('wid', id)

            const conn = await connP
            const file = await conn.downloadAndSaveMediaMessage(message, `../uploads/${Date.now()}`)
            const form = new FormData()
            form.append('image', fs.createReadStream(file))

            await fetch(url.href, {
              method: 'POST', body: form
            }).catch(() => {})

            fs.unlinkSync(file)
          }
          break
        case 'documentMessage':
          if (webhook) {
            const url = new URL(webhook)
            url.searchParams.append('type', type)
            url.searchParams.append('to', to)
            url.searchParams.append('from', from)
            if (isForwarded) {
              url.searchParams.append('forwarded', 'true')
            }
            if (isQuoted) {
              url.searchParams.append('quoted', document.contextInfo.stanzaId)
            }
            url.searchParams.append('filename', document.fileName)
            url.searchParams.append('mimetype', document.mimetype)
            url.searchParams.append('size', document.fileLength)
            url.searchParams.append('wid', id)

            const conn = await connP
            const file = await conn.downloadAndSaveMediaMessage(message, `../uploads/${Date.now()}`)
            const form = new FormData()
            form.append('document', fs.createReadStream(file))

            await fetch(url.href, {
              method: 'POST', body: form
            }).catch(() => {})

            fs.unlinkSync(file)
          }
          break
        case 'audioMessage':
          if (webhook) {
            const url = new URL(webhook)
            url.searchParams.append('type', type)
            url.searchParams.append('to', to)
            url.searchParams.append('from', from)
            if (isForwarded) {
              url.searchParams.append('forwarded', 'true')
            }
            if (isQuoted) {
              url.searchParams.append('quoted', audio.contextInfo.stanzaId)
            }
            url.searchParams.append('seconds', audio.seconds)
            url.searchParams.append('mimetype', audio.mimetype)
            url.searchParams.append('size', audio.fileLength)
            url.searchParams.append('wid', id)

            const conn = await connP
            const file = await conn.downloadAndSaveMediaMessage(message, `../uploads/${Date.now()}`)
            const form = new FormData()
            form.append('audio', fs.createReadStream(file))

            await fetch(url.href, {
              method: 'POST', body: form
            }).catch(() => {})

            fs.unlinkSync(file)
          }
          break
        default:
          console.log('chat-update switch default')
          console.dir(message)
          break
      }
    }

    /*
    ** mensagens produzidas pela próprio api não disparam
    ** message-status-update do tipo sent
    */
    if (
      chat?.messages?.array[0]?.key?.id?.slice(0, 4) === '3EB0' && // produzido por mim
      number.indexOf('-') === -1 && // Não é um grupo
      !chat.presences && // não é uma presença
      typeof chat.count === 'undefined' // Não é mensagem recebida
    ) {
      const message = chat.messages.array[0]
      const to = number
      const from = shard
      const id = message.key.id
      const mark = await redis.hget(markkey, id)

      if (webhook) {
        fetch(webhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'sent',
            timestamp: Date.now(),
            to,
            from,
            wid: id,
            mark
          })
        }).catch(() => {})
      }
    }
  }
}

module.exports = chatUpdate
