const {
  client: redis,
  panoptickey,
  panopticbotkey,
  trafficwand,
  mkbotkey,
  mkattkey,
  mkattmetakey,
  mkcacapakey,
  mkboxenginebotkey
} = require('@gmapi/redispack')

const {
  CardFactory,
  MessageFactory,
  TurnContext
} = require('botbuilder')

const adapter = require('./msteamsAdapter')

const ACData = require('adaptivecards-templating')
const QRCode = require('qrcode')

const image64T = new ACData.Template({
  type: 'AdaptiveCard',
  body: [{
    type: 'TextBlock',
    text: 'QR Code',
    'wrap': true
  },{
    type: 'Image',
    url: '${url}'
  }],
  $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
  version: '1.3'
})

const capaAtendimentoTemplate = new ACData.Template({
  'type': 'AdaptiveCard',
  'body': [
      {
          'type': 'TextBlock',
          'weight': 'Bolder',
          'size': 'Medium',
          'text': '${title}'
      },
      {
          'type': 'ColumnSet',
          'columns': [
              {
                  'type': 'Column',
                  'items': [
                      {
                          'type': 'Image',
                          'style': 'Person',
                          'url': 'https://app.gestorsistemas.com/assets/icons/icon-192x192.png',
                          'size': 'Small'
                      }
                  ],
                  'width': 'auto'
              },
              {
                  'type': 'Column',
                  'items': [
                      {
                          'type': 'TextBlock',
                          'weight': 'Bolder',
                          'wrap': true,
                          'text': '${subtitle}'
                      },
                      {
                          'type': 'TextBlock',
                          'spacing': 'None',
                          'isSubtle': true,
                          'wrap': true,
                          'text': 'Em 01/01/2022 00:00:00'
                      }
                  ],
                  'width': 'stretch'
              }
          ]
      },
      {
          'type': 'FactSet',
          'facts': [
              {
                  'title': 'Whatsapp:',
                  'value': '${whatsapp}'
              },
              {
                  'title': 'Documento:',
                  'value': '${documento}'
              }
          ]
      }
  ],
  '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
  'version': '1.3'
})

const appId = process.env.MicrosoftAppId
const channelId = 'msteams'
const serviceUrl = 'https://smba.trafficmanager.net/br/'
const audience = undefined

const replay = false
const observable = trafficwand({ redis, streamkey: panopticbotkey, replay })

const it = observable.subscribe({
  next:  async bread => {
    if (bread.type === 'botCommandQRCODE') {
      console.log('botCommandQRCODE')
      const { shard, cacapa } = bread

      const mitochondria = 'TEAMSBOT'
      const type = 'signupconnection'
      const cacapaListResponse = mkcacapakey()

      const botkey = mkbotkey({ shard })
      const whatsapp = await redis.hget(botkey, 'whatsapp')

      const url = ' '
      await redis.xadd(panoptickey, '*', 'hardid', hardid, 'type', type, 'shard', whatsapp, 'mitochondria', mitochondria, 'cacapa', cacapaListResponse, 'url', url)

      // espera na caçapa pelo código
      const listResponde = await redis.blpop(cacapaListResponse, 40)
      const listDate = JSON.parse(listResponde[1])
      console.dir(listDate)

      const urlData64 = await QRCode.toDataURL(listDate.qr)

      const adaptiveCard = image64T.expand({
        $root: {
          url: urlData64
        }
      })
      const card = CardFactory.adaptiveCard(adaptiveCard)
      const message = MessageFactory.attachment(card)

      // criado em cima para pegar o zap da equipe
      // const botkey = mkbotkey({ shard })
      const botref = await redis.hget(botkey, 'ref')
      const conversationParameters = {
        isGroup: true,
        channelData: JSON.parse(botref),
        activity: message
      }

      await adapter.createConversationAsync(appId, channelId, serviceUrl, audience, conversationParameters, async context => {
        // espera na caçapa pela leitura do qrcode pelo celular
        const [, listResponde] = await redis.blpop(cacapaListResponse, 40)
        const listDate = JSON.parse(listResponde)
        const boxenginebotkey = mkboxenginebotkey({ shard: listDate.shard })

        // listDate.shard whatsapp, vem do l push pop
        // shard team bot instalação

        const pipeline2 = redis.pipeline()
        pipeline2.hset(botkey, 'whatsapp', listDate.shard)
        pipeline2.hset(boxenginebotkey, 'gsadmin', shard)

        await Promise.all([
          pipeline2.exec(),
          context.sendActivity(MessageFactory.text(`WhatsApp [${listDate.shard}](https://wa.me/${listDate.shard}) leu o qrcode.`))
        ])

        // dar essa noticia pelo avisador geral no toggle do baileys
        // const [, c1json] = await redis.blpop(cacapaListResponse, 40)
        // //const c1 = JSON.parse(c1json)
        // const[, c2json] = await redis.blpop(cacapaListResponse, 40)
        // //const c2 = JSON.parse(c2json)
        // await context.sendActivity(MessageFactory.text(`Conectado!`))
      })
    } else if (bread.type === 'zaphook') {
      const hook = JSON.parse(bread.data)
      const attid = `${bread.whatsapp}/${hook.from}`
      const boxenginebotkey = mkboxenginebotkey({ shard: bread.whatsapp })

      console.log(`attid=${attid}`)

      const [gsadminId, subchannelId] = await redis.hmget(boxenginebotkey, 'gsadmin', bread.data.from)
      const attkey = mkattkey({ shard: gsadminId, attid })
      const attmetakey = mkattmetakey({ shard: gsadminId, attid })

      const pipeline = redis.pipeline()
      pipeline.xadd(attkey, '*', 'type', 'zapfront', 'data', JSON.stringify(hook))
      pipeline.hsetnx(attmetakey, 'status', JSON.stringify({ stage: 0 }))
      pipeline.hget(attmetakey, 'ref')

      const [[err0, _xid], [err2, isFirst], [err3, refJSON]] = await pipeline.exec()
      if (isFirst) {
        const appId = process.env.MicrosoftAppId
        const channelId = 'msteams'
        const serviceUrl = 'https://smba.trafficmanager.net/br/'
        const audience = undefined

        const botkey = mkbotkey({ shard: gsadminId})
        const botref = await redis.hget(botkey, 'ref')

        const adaptiveCard = capaAtendimentoTemplate.expand({
          $root: {
            title: bread.whatsapp,
            subtitle: hook.from,
            whatsapp: '+55-65-9999-9999',
            documento: '00.000.000/0000-00'
          }
        })
        const card = CardFactory.adaptiveCard(adaptiveCard)
        const message = MessageFactory.attachment(card)

        const conversationParameters = {
          isGroup: true,
          channelData: JSON.parse(botref),
          //activity: MessageFactory.text(`${attid}\n${JSON.stringify(hook, null, 2)}`)
          activity: message
        }

        await adapter.createConversationAsync(appId, channelId, serviceUrl, audience, conversationParameters, async turnContext => {
          const ref = TurnContext.getConversationReference(turnContext.activity)
          const boxenginebotkey = mkboxenginebotkey({ shard: ref.activityId })

          await turnContext.sendActivity(MessageFactory.text(JSON.stringify(hook, null, 2)))

          const pipeline = redis.pipeline()
          pipeline.hmset(boxenginebotkey, 'whatsapp', bread.whatsapp, 'chat', hook.from) // const attid = `${bread.whatsapp}/${hook.from}`
          pipeline.hset(attmetakey, 'ref', JSON.stringify(ref))
          await pipeline.exec()
        })
      } else {
        const ref = JSON.parse(refJSON)
        await adapter.continueConversationAsync(process.env.MicrosoftAppId, ref, async turnContext => {
          await turnContext.sendActivity(MessageFactory.text(JSON.stringify(hook, null, 2)))
        })
      }
    } else if (bread.type === 'zuckershark') {
      const connection = bread.connection
      const whatsapp = bread.whatsapp
      const boxenginebotkey = mkboxenginebotkey({ shard: whatsapp })

      const orgaid_teamid = await redis.hget(boxenginebotkey, 'gsadmin')
      const botkey = mkbotkey({ shard: orgaid_teamid })

      const botref = await redis.hget(botkey, 'ref')
      const conversationParameters = {
        isGroup: true,
        channelData: JSON.parse(botref),
        activity: MessageFactory.text(`${whatsapp} ${connection}`)
      }

      await adapter.createConversationAsync(appId, channelId, serviceUrl, audience, conversationParameters, async context => {
        //
      })
    }
  },
  error: console.error,
  complete: () => console.log('done')
})

module.exports = it
