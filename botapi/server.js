require('dotenv').config({
  path: require('path').join(__dirname, '.env')
});

const hardid = process.env.HARDID

const restify = require('restify')
const {
    CardFactory,
    CloudAdapter,
    ConfigurationServiceClientCredentialFactory,
    createBotFrameworkAuthenticationFromConfiguration,
    MessageFactory,
    TurnContext
} = require('botbuilder')
const { client: redis, panoptickey, panopticbotkey, trafficwand, mkbotkey, mkattkey, mkattmetakey, mkcacapakey, mkboxenginebotkey } = require('@gmapi/redispack')

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

const { TeamsConversationBot } = require('./reactivebot')

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId: process.env.MicrosoftAppId,
    MicrosoftAppPassword: process.env.MicrosoftAppPassword,
    MicrosoftAppType: process.env.MicrosoftAppType,
    MicrosoftAppTenantId: process.env.MicrosoftAppTenantId
});
const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);

const adapter = new CloudAdapter(botFrameworkAuthentication);
adapter.onTurnError = async (context, error) => {
    console.log('\n [onTurnError] unhandled error:')
    console.dir(error)

    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    await context.sendActivity('The bot encountered an error or bug.')

    await context.sendActivity('To continue to run this bot, please fix the bot source code.')
}

const server = restify.createServer()
server.use(restify.plugins.bodyParser())
server.listen(process.env.port || process.env.PORT || 3978, function() {
  console.log(`\n${ server.name } listening to ${ server.url }`);
})

let n = 0
server.get('/health', async (req, res) => {
  res.status(200)
  res.json({ status: 200, ok: true, n: n++ })
})

// reactive bot
const bot = new TeamsConversationBot()
server.post('/api/messages', async (req, res) => {
  console.log(`<< /api/messages >>`)
  console.dir(req.body)
  await adapter.process(req, res, (context) => bot.run(context))
})

let replyQty = 1
let lastAttmetakey
server.get('/pah', async (req, res) => {
  console.log('pah')

  res.status(200)
  if (lastAttmetakey) {
    const refJSON = await redis.hget(lastAttmetakey, 'ref')
    const ref = JSON.parse(refJSON)

    await adapter.continueConversationAsync(process.env.MicrosoftAppId, ref, async turnContext => {
      await turnContext.sendActivity(MessageFactory.text(`Resposta ${replyQty} pra thread`))
      res.json({ replyQty })
      replyQty++
    })

  } else {
    res.json({ noTo: true })
  }
})

// active bot
const replay = false
const observable = trafficwand({ redis, streamkey: panopticbotkey, replay })
observable.subscribe({
  next:  async bread => {
    if (bread.type === 'botCommandQRCODE') {
      console.log('botCommandQRCODE')
      const { shard, cacapa } = bread
      const appId = process.env.MicrosoftAppId
      const channelId = 'msteams'
      const serviceUrl = 'https://smba.trafficmanager.net/br/'
      const audience = undefined

      const mitochondria = 'TEAMSBOT'
      const type = 'signupconnection'
      const cacapaListResponse = mkcacapakey()
      const instancia = '556584469827'
      const url = ' '
      await redis.xadd(panoptickey, '*', 'hardid', hardid, 'type', type, 'shard', instancia, 'mitochondria', mitochondria, 'cacapa', cacapaListResponse, 'url', url)

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

      const botkey = mkbotkey({ shard })
      const botref = await redis.hget(botkey, 'ref')
      const conversationParameters = {
        isGroup: true,
        channelData: JSON.parse(botref),
        activity: message
      }

      await adapter.createConversationAsync(appId, channelId, serviceUrl, audience, conversationParameters, async context => {
        console.log('CARD CONVERSA OK')

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
          context.sendActivity(MessageFactory.text(`WhatsApp ${listDate.shard} leu o qrcode.`))
        ])

        const [, c1json] = await redis.blpop(cacapaListResponse, 40)
        //const c1 = JSON.parse(c1json)
        const[, c2json] = await redis.blpop(cacapaListResponse, 40)
        //const c2 = JSON.parse(c2json)

        await context.sendActivity(MessageFactory.text(`Conectado!`))
      })
    } else if (bread.type === 'zaphook') {
      const hook = JSON.parse(bread.data)
      const attid = `${bread.whatsapp}/${hook.from}`
      const boxenginebotkey = mkboxenginebotkey({ shard: bread.whatsapp })

      const [gsadminId, subchannelId] = await redis.hmget(boxenginebotkey, 'gsadmin', bread.data.from)

      const attkey = mkattkey({ shard: gsadminId, attid })
      const attmetakey = mkattmetakey({ shard: gsadminId, attid })
      
      const pipeline = redis.pipeline()
      pipeline.xadd(attkey, '*', 'type', 'zapfront', 'data', JSON.stringify(hook))
      pipeline.hsetnx(attmetakey, 'status', JSON.stringify({ stage: 0 }))
      pipeline.hget(attmetakey, 'ref')
      
      const [[err0, _xid], [err2, isFirst], [err3, refJSON]] = await pipeline.exec()
      if (isFirst) {
        console.log(`iniciando atendimento ${gsadminId}:${attid}`)
        const appId = process.env.MicrosoftAppId
        const channelId = 'msteams'
        const serviceUrl = 'https://smba.trafficmanager.net/br/'
        const audience = undefined

        const botkey = mkbotkey({ shard: gsadminId})
        const botref = await redis.hget(botkey, 'ref')
        const conversationParameters = {
          isGroup: true,
          channelData: JSON.parse(botref),
          activity: MessageFactory.text(`${attid}\n${JSON.stringify(hook, null, 2)}`)
        }

        await adapter.createConversationAsync(appId, channelId, serviceUrl, audience, conversationParameters, async turnContext => {
          const ref = TurnContext.getConversationReference(turnContext.activity)
          await redis.hset(attmetakey, 'ref', JSON.stringify(ref))
        })
      } else {
        const ref = JSON.parse(refJSON)
        await adapter.continueConversationAsync(process.env.MicrosoftAppId, ref, async turnContext => {
          await turnContext.sendActivity(MessageFactory.text(JSON.stringify(hook, null, 2)))
        })

      }
    }
  },
  error: console.error,
  complete: () => console.log('done')
})

/*


https://zapbridge.gestormessenger.team/activebot/a9e299eb-5fa6-4173-8b91-8906bb8a7d92_19:9QpYcadzIqX4rNhoaZ3lRyTaLIaHoURuUR3A2RHpr0U1@thread.tacv2

9QpYcadzIqX4rNhoaZ3lRyTaLIaHoURuUR3A2RHpr0U1
const cacapakey = mkcacapakey()
const mitochondria = 'teamsapp_DEMO'
const webhook = undefined
const type = 'botCommandQRCODE'
*/