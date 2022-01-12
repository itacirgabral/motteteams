const {
  ActivityTypes,
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

const { client: redis, mkbotkey, mkcacapakey, panopticbotkey } = require('@gmapi/redispack')
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
const downloadJsonButton = new ACData.Template({
  type: 'AdaptiveCard',
  body: [{
    type: 'TextBlock',
    text: '${text}',
    'wrap': true
  }],
  'actions': [
    {
        'type': 'Action.OpenUrl',
        "title": "Download",
        "iconUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPOyiihETr7PTfqdd_1DPMJmGHv_ALrhLcYXHCCzmd3_UKcnCyE0_7OPfFRNJSLjjyTWY&usqp=CAU",
        'url': '${url}'
    }
  ],
  $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
  version: '1.3'
})

class TeamsConversationBot extends TeamsActivityHandler {
  constructor() {
      super();

      this.onConversationUpdate(async (context, next) => {
        const isTeams = context.activity.channelId === 'msteams'
        const isAdd = context.activity.channelData.eventType === 'teamMemberAdded'
        const isGSADMIN = context.activity.channelData.team.name === 'GSADMIN'

        const teamid = context.activity.channelData.team.id
        const orgid = context.activity.channelData.tenant.id
        const shard = `${orgid}_${teamid}`
        console.log(`bot=${shard}`)

        if (isTeams && isAdd && isGSADMIN) {
          const botkey = mkbotkey({ shard })

          const channelData = {
            teamsChannelId: context.activity.channelData.team.id,
            teamsTeamId: context.activity.channelData.team.id,
            ...context.activity.channelData,
            team: {
              ...context.activity.channelData.team,
              name: undefined,
              aadGroupId: undefined
            },
            eventType: undefined
          }
          const adminref = JSON.stringify(channelData)

          console.log(`Criando ${botkey} porque é GSADMIN`)
          await redis.set(botkey, adminref)
        }

        await next()
      })

      this.onInstallationUpdate(async (context, next) => {
        console.log('onInstallationUpdate')
        const isTeams = context.activity.channelId === 'msteams'
        const isAdd = context.activity.action === 'add'

        const teamid = context.activity.channelData.team.id
        const orgid = context.activity.channelData.tenant.id
        const shard = `${orgid}_${teamid}`

        if (isTeams && isAdd) {
          const hadBot = await redis.exists(mkbotkey({ shard }))

          const adaptiveCard = textBig.expand({
            $root: {
              text: `BOT instalado${hadBot ? ' e pronto!' : ', falta configurar.'}`
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
        const text = context.activity.text.trim()
        console.log(`text=${text}`)

        const cutarroba = text.slice(text.indexOf(' ') + 1).trim()
        const isCommand = cutarroba.lastIndexOf(' ') === -1
        if (isCommand) {
          if (cutarroba === 'extrato') {
            console.log('extrato')
            const [memberInfo, teamsInfo, teamsChannels, teamsMembers] = await Promise.all([
              TeamsInfo.getMember(context, context.activity.from.id),
              TeamsInfo.getTeamDetails(context, context.activity.channelData.teamsTeamId),
              TeamsInfo.getTeamChannels(context, context.activity.channelData.teamsTeamId),
              TeamsInfo.getTeamMembers(context, context.activity.channelData.teamsTeamId)
            ])
            const activity = context.activity
            const info = {
              memberInfo,
              teamsInfo,
              teamsChannels,
              teamsMembers,
              activity
            }

            const infoText = JSON.stringify(info, null, 2)
            const infofileBase64 = Buffer.from(infoText).toString('base64')
            const adaptiveCard = downloadJsonButton.expand({
              $root: {
                text: infoText,
                url: `data:text/plain;base64,${ infofileBase64 }`
              }
            })
            const card = CardFactory.adaptiveCard(adaptiveCard)
            const message = MessageFactory.attachment(card)

            await context.sendActivity(message)
          } else if (cutarroba === 'qrcode') {
            console.log('qrcode')
            const type = 'botCommandQRCODE'

            const teamid = context.activity.channelData.team.id
            const orgid = context.activity.channelData.tenant.id
            const shard = `${orgid}_${teamid}`
            console.log(`shard=${shard}`)

            const botkey = mkbotkey({ shard })
            const hadBot = await redis.exists(botkey)

            if (hadBot) {
              await Promise.all([
                redis.xadd(panopticbotkey, '*', 'type', 'botCommandQRCODE', 'shard', shard),
                context.sendActivity(MessageFactory.text('Solicitação enviada para GSADMIN'))
              ])
            } else {
              await context.sendActivity(MessageFactory.text('Sem bots disponíves...'))
            }
          } else if (cutarroba === 'fim') {
            console.log('fim')
          } else if (cutarroba === 'fix') {
            console.log('fix')
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