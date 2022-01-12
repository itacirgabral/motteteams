require('dotenv').config({
  path: require('path').join(__dirname, '.env')
});

const restify = require('restify');
const {
    CloudAdapter,
    ConfigurationServiceClientCredentialFactory,
    createBotFrameworkAuthenticationFromConfiguration,
    MessageFactory,
    TurnContext
} = require('botbuilder')
const { client: redis, panopticbotkey, trafficwand, mkbotkey } = require('@gmapi/redispack')

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

const bot = new TeamsConversationBot()
server.post('/api/messages', async (req, res) => {
  console.log(`<<\n${JSON.stringify(req.body)}\n>>`)
  await adapter.process(req, res, (context) => bot.run(context))
})

let first = false

server.get('/pah', async (req, res) => {
  console.log('pah')

  if (first) {
    // first = !first
    const appId = process.env.MicrosoftAppId
    const channelId = 'msteams'
    const serviceUrl = 'https://smba.trafficmanager.net/br/'
    const audience = undefined
    const message = MessageFactory.text("Vou mandar um QRCODE")
    const channelData = {
      "teamsChannelId": "19:9QpYcadzIqX4rNhoaZ3lRyTaLIaHoURuUR3A2RHpr0U1@thread.tacv2",
      "teamsTeamId": "19:9QpYcadzIqX4rNhoaZ3lRyTaLIaHoURuUR3A2RHpr0U1@thread.tacv2",
      "team": {
        "id": "19:9QpYcadzIqX4rNhoaZ3lRyTaLIaHoURuUR3A2RHpr0U1@thread.tacv2"
      },
      "tenant": {
        "id": "a9e299eb-5fa6-4173-8b91-8906bb8a7d92"
      },
      "channel": {
        "id": "19:9QpYcadzIqX4rNhoaZ3lRyTaLIaHoURuUR3A2RHpr0U1@thread.tacv2"
      }
    }
    const conversationParameters = {
      isGroup: true,
      channelData,
      activity: message
    }

    console.log('pah 1')
    await adapter.createConversationAsync(appId, channelId, serviceUrl, audience, conversationParameters, async context => {
      console.log('turnado')

      const ref = TurnContext.getConversationReference(context.activity)
      console.dir(ref)
      console.log(JSON.stringify(ref, null, 2))
    })

    console.log('pum')
    res.status(200)
    res.json({ status: 200, ok: true })
  } else {
    const ref = {
      "activityId": "19:9QpYcadzIqX4rNhoaZ3lRyTaLIaHoURuUR3A2RHpr0U1@thread.tacv2;messageid=1641866695072",
      "conversation": {
        "id": "19:9QpYcadzIqX4rNhoaZ3lRyTaLIaHoURuUR3A2RHpr0U1@thread.tacv2;messageid=1641866695072",
        "isGroup": true
      },
      "channelId": "msteams",
      "serviceUrl": "https://smba.trafficmanager.net/br/"
    }

    await adapter.continueConversationAsync(process.env.MicrosoftAppId, ref, async turnContext => {
      await turnContext.sendActivity(MessageFactory.text('Resposta pra thread'))
    })
  }
})

server.get('/activebot', async (req, res) => {
  res.status(200)
  console.log(`panopticbotkey=${panopticbotkey}`)

  const observable = trafficwand({ redis, streamkey: panopticbotkey, replay: true })
  observable.subscribe({
    next:  async bread => {
      console.dir(bread)
      if (bread.type === 'botCommandQRCODE') {
        const { shard, cacapa } = bread
        const appId = process.env.MicrosoftAppId
        const channelId = 'msteams'
        const serviceUrl = 'https://smba.trafficmanager.net/br/'
        const audience = undefined
        const message = MessageFactory.text("Leia este QRCODE")

        const botkey = mkbotkey({ shard })
        const botref = await redis.get(botkey)
        const conversationParameters = {
          isGroup: true,
          channelData: JSON.parse(botref),
          activity: message
        }

        await adapter.createConversationAsync(appId, channelId, serviceUrl, audience, conversationParameters, async context => {
          console.log('turnado')

          const ref = TurnContext.getConversationReference(context.activity)
          console.dir(ref)
          console.log(JSON.stringify(ref, null, 2))
        })
        // - [ ] envia qrcode card exemplo
        // - [ ] espera na cacapa
        // - [ ] envia sucesso reply
      }
    },
    error: console.error,
    complete: () => console.log('done')
  })

  res.json({
    ok: true
  })
})

/*


https://zapbridge.gestormessenger.team/activebot/a9e299eb-5fa6-4173-8b91-8906bb8a7d92_19:9QpYcadzIqX4rNhoaZ3lRyTaLIaHoURuUR3A2RHpr0U1@thread.tacv2

9QpYcadzIqX4rNhoaZ3lRyTaLIaHoURuUR3A2RHpr0U1
const cacapakey = mkcacapakey()
const mitochondria = 'teamsapp_DEMO'
const webhook = undefined
const type = 'botCommandQRCODE'
*/