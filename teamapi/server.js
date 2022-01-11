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
} = require('botbuilder');
const { TeamsConversationBot } = require('./talker');
const { setTimeout } = require('timers');

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

// adapter.createConversationAsync()
// createConversation

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

