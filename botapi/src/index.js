require('dotenv').config({
  path: require('path').join(__dirname, '.env')
});

require('./activebot')
const restify = require('restify')
const { TeamsConversationBot } = require('./reactivebot')
const adapter = require('./msteamsAdapter')

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
