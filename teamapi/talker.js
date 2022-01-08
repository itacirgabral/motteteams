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
})

const image64 = new ACData.Template({
type: 'AdaptiveCard',
body: [
    {
        type: 'Image',
        url: '${uri}'
    }
],
$schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
version: '1.3'
})

class TeamsConversationBot extends TeamsActivityHandler {
  constructor() {
      super();

      this.onConversationUpdate(async (context, next) => {
        console.log('onConversationUpdate')
        const isTeams = context.activity.channelId === 'msteams'
        const recipient =  context.activity.recipient.id.split(':')[1]
        const isMe = recipient === process.env.MicrosoftAppId
        const isAdd = context.activity.channelData.eventType === 'teamMemberAdded'
        const isAdmin = context.activity.channelData.team.name === 'GSADMIN'

        // app foi instalado numa equipe chamado GSADMIN ?
        if (isTeams && isAdd && isAdmin && isMe) {
          console.log('ready')
          const readykey = mkreadykey({ shard: recipient })
          console.log(`libera o admin ${readykey}`)
          await redis.set(readykey, true)
        }

        await next()
      })

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

      this.onMessage(async (context, next) => {
        const message = MessageFactory.text(`Olá vc`)
        await context.sendActivity(message)
        await next()
      })
  }
}

module.exports.TeamsConversationBot = TeamsConversationBot;
