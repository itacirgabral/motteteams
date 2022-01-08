const {
    CardFactory,
    MessageFactory,
    TeamsActivityHandler,
    teamsGetChannelId,
    TurnContext,
    TeamsInfo
} = require('botbuilder');
const ACData = require('adaptivecards-templating');
const minimist = require('minimist');

const { client: redis, mkreadykey, mkcacapakey, panoptickey } = require('@gmapi/redispack')
const QRCode = require('qrcode')

const hardid = process.env.HARDID

const textBig = new ACData.Template({
    type: 'AdaptiveCard',
    body: [
        {
            type: 'TextBlock',
            size: 'extraLarge',
            weight: 'Bolder',
            text: '${text}'
        }
    ],
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.3'
});

class TeamsConversationBot extends TeamsActivityHandler {
    constructor() {
        super();
        this.onInstallationUpdate(async (context, next) => {
          console.log('onInstallationUpdate')
          const isTeams = context.activity.channelId === 'msteams'
          const isAdd = context.activity.action === 'add'
          const recipient =  context.activity.recipient.id.split(':')[1]
          const isMe = recipient === process.env.MicrosoftAppId
          if (isTeams && isAdd && isMe) {
            const readykey = mkreadykey({ shard: recipient })
            const isReady = await redis.get(readykey)

            const adaptiveCard = textBig.expand({
              $root: {
                text: isReady ? 'pode pah' : 'app instalado'
              }
            })
            const card = CardFactory.adaptiveCard(adaptiveCard)
            const message = MessageFactory.attachment(card)
            const conversationParameters = {
              isGroup: true,
              channelData: context.activity.channelData,
              activity: message
            }

            const connectorFactory = context.turnState.get(context.adapter.ConnectorFactoryKey)
            const connectorClient = await connectorFactory.create(context.activity.serviceUrl)

            await connectorClient.conversations.createConversation(conversationParameters)
          } else {
            console.log(`channel=${context.activity.channelId} action=${context.activity.action} recipient=${context.activity.recipient.id}`)
          }

          await next()
        })

        this.onConversationUpdate(async (context, next) => {
          console.log('onConversationUpdate')
          const isTeams = context.activity.channelId === 'msteams'
          const recipient =  context.activity.recipient.id.split(':')[1]
          const isMe = recipient === process.env.MicrosoftAppId
          const isAdd = context.activity.channelData.eventType === 'teamMemberAdded'
          const isAdmin = context.activity.channelData.team.name === 'GSADMIN'

          // app foi instalado numa equipe chamado GSADMIN ?
          if (isTeams && isAdd && isAdmin && isMe) {
            const readykey = mkreadykey({ shard: recipient })
            console.log(`libera o admin ${readykey}`)
            await redis.set(readykey, true)
          }
        })

        this.onMessage(async (context, next) => {
          const text = context.activity.text.trim()
          console.log(`text=${text}`)

          const pointer = text.split(' ')[1]
          const isCli = pointer === 'cli'
          const isQrcode = pointer === 'qrcode'
          console.log(`pointer="${pointer}"`)

          if (isCli) {
            const arg = text
            .slice(idxAt)
            .match(/\\?.|^$/g)
            .reduce((p, c) => {
              if(c === '"'){
                  p.quote ^= 1;
              }else if(!p.quote && c === ' '){
                  p.a.push('');
              }else{
                  p.a[p.a.length-1] += c.replace(/\\(.)/,"$1");
              }
              return  p;
            },
            {a: ['']}
            ).a

            const conf = minimist(arg)
            switch (conf._[1]) {
              case 'chama':
                const adaptiveCardChama = textBig.expand({
                  $root: {
                    text: 'chamou chamou'
                  }
                })
                const cardChama = CardFactory.adaptiveCard(adaptiveCardChama)
                const messageChama = MessageFactory.attachment(cardChama)
                await context.sendActivity(messageChama)
                break
              case 'botao':
                const adaptiveCard = textBig.expand({
                  $root: {
                    text: conf.text
                  }
                })
                const card = CardFactory.adaptiveCard(adaptiveCard)
                const message = MessageFactory.attachment(card)
                await context.sendActivity(message)

                // 1 fazer o turn com o adaptive card
                // 2 retornar um card com botao
                break
              default:
                console.dir(conf)
            }
          } else if (isQrcode) {
            const teamDetails = await TeamsInfo.getTeamDetails(context)
            console.dir(teamDetails)
            const recipient =  context.activity.recipient.id.split(':')[1]
            console.dir(context.activity.recipient.id)

            const isReady = await redis.get(mkreadykey({ shard: recipient }))
            if (isReady) {
              console.log("# READY #")
              const cacapakey = mkcacapakey()
              const mitochondria = 'teamsapp_DEMO'
              const webhook = undefined
              await redis.xadd(panoptickey, '*', 'hardid', hardid, 'type', 'signupconnection', 'shard', recipient, 'url', webhook, 'mitochondria', mitochondria, 'cacapa', cacapakey)
              // BUG shard = recipient should be overhided by shard = whatsappid

              // const qrcode = "2@sr6qeveE65RKLFfIYGjJ8hhLWtZ+NjfdBC/H0VoTA+w340r4WlTKGPj/l02CyXHmukyWR8VaAfkPZw==,waSTjqha7w756Sdzh2WYYHglnu9bjZuXYL9ZVMYPUwg=,2NnZLsvbmLO5WpElUOfDU8jx7RRlRA1yv5z9/pgEbx4=,7pYEpG3W5RtcgdL0aYfHlRKoysmxihtymb9W7RsK0e8="
              // QRCode.toDataURL(qrcode, function (err, url) {
              //   // console.log(`url=${url}`)
              // })
            }
          }
        })
    }
}

module.exports.TeamsConversationBot = TeamsConversationBot;
