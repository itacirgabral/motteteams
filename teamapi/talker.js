const {
  CardFactory,
  MessageFactory,
  TeamsActivityHandler,
  teamsGetChannelId,
  TurnContext,
  TeamsInfo
} = require('botbuilder');
const ACData = require('adaptivecards-templating');

const {
  setTimeout,
} = require('timers/promises')

const { client: redis, mkreadykey, mkcacapakey, panoptickey } = require('@gmapi/redispack')
const QRCode = require('qrcode')

const hardid = process.env.HARDID

const textBig = new ACData.Template({
  type: 'AdaptiveCard',
  body: [{
    type: 'TextBlock',
    size: 'extraLarge',
    weight: 'Bolder',
    text: '${text}'
  }],
  $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
  version: '1.3'
})

const image64T = new ACData.Template({
  type: 'AdaptiveCard',
  body: [{
    type: 'Image',
    url: '${url}'
  }],
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
        const teamsChannelId = teamsGetChannelId(context.activity)
        const text = context.activity.text.trim()
        console.log(`text=${text}`)

        const cutarroba = text.slice(text.indexOf(' ') + 1).trim()
        const isCommand = cutarroba.lastIndexOf(' ') === -1
        if (isCommand) {
          if (cutarroba === 'qrcode') {
            const cacapakey = mkcacapakey()
            const mitochondria = 'teamsapp_DEMO'
            const webhook = undefined
            const recipient = context.activity.recipient.id || 'teamsapp_dev'

            const message = MessageFactory.attachment(CardFactory.heroCard(
              'QRCODE',
              'Ligar novo dispositivo'
            ))

            const xaddP = redis.xadd(panoptickey, '*', 'hardid', hardid, 'type', 'signupconnection', 'shard', recipient, 'url', webhook, 'mitochondria', mitochondria, 'cacapa', cacapakey)
  
            const conversationParameters = {
              isGroup: true,
              channelData: {
                  channel: {
                      id: teamsChannelId
                  }
              },
              activity: message
            }

            const connectorFactory = context.turnState.get(context.adapter.ConnectorFactoryKey)
            const connectorClient = await connectorFactory.create(context.activity.serviceUrl)
            const conversationResourceResponse = await connectorClient.conversations.createConversation(conversationParameters)
            const conversationReference = TurnContext.getConversationReference(context.activity)
            conversationReference.conversation.id = conversationResourceResponse.id
            const newConversation = [conversationReference, conversationResourceResponse.activityId]
  
            await context.adapter.continueConversationAsync(process.env.MicrosoftAppId, newConversation[0], async turnContext => {
              await xaddP
              const [_key, el] = await redis.blpop(cacapakey, 90)
              const { type, qr } = JSON.parse(el)
              if (type === 'qr') {
                const url = await QRCode.toDataURL(qr)
                const adaptiveCard = image64T.expand({ $root: { url } })
                const card = CardFactory.adaptiveCard(adaptiveCard)
                const message2 = MessageFactory.attachment(card)

                // ao invés de responder, atualizar ?
                // await context.updateActivity(message)
                await turnContext.sendActivity(message2)
              }
            })
          } else if (cutarroba === 'vincula') {
            const [memberTeamsInfo, teamsInfo] = await Promise.all([
              TeamsInfo.getMember(context, context.activity.from.id),
              TeamsInfo.getTeamDetails(context, context.activity.channelData.teamsTeamId)
            ])

            const card = CardFactory.heroCard('VINCULA', `${memberTeamsInfo.name} ${teamsInfo.name} ${teamsInfo.id}`)
            const message = MessageFactory.attachment(card)

            console.log("pre 0 sendActivity")
            await context.sendActivity(message)
            console.log("pos 0 sendActivity")
            // await setTimeout(1000)
            // console.log("pre 1 sendActivity")
            // await context.sendActivity(message)
            // console.log("pos 1 sendActivity")

          } else {
            console.log('nenhum comando')
          }
        } else {
          console.log(`cutarroba=${cutarroba}`)
        }

        await next()
      })
  }
}

module.exports.TeamsConversationBot = TeamsConversationBot;
