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

const { client: redis, mkbotkey, mkcacapakey, panopticbotkey, panoptickey } = require('@gmapi/redispack')
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
          await Promise.all([
            redis.hsetnx(botkey, 'ref', adminref),
            redis.hsetnx(botkey, 'plan', 'free')
          ])
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

        const firstBlank = text.indexOf(' ')
        const secondBlank = text.indexOf(' ', text.indexOf(' ') + 1)
        const cutarroba = secondBlank === -1 ? text.slice(firstBlank + 1) : text.slice(firstBlank + 1, secondBlank)
        const isCommand = cutarroba.indexOf(' ') === -1
        if (isCommand) {
          if (cutarroba === 'extrato') {
            console.log('extrato')
            const [memberInfo, teamsInfo, teamsChannels, teamsMembers] = await Promise.all([
              TeamsInfo.getMember(context, context.activity.from.id),
              TeamsInfo.getTeamDetails(context, context.activity.channelData.teamsTeamId),
              TeamsInfo.getTeamChannels(context, context.activity.channelData.teamsTeamId),
              TeamsInfo.getTeamMembers(context, context.activity.channelData.teamsTeamId),
              context.sendActivity(MessageFactory.text('Buscando pelo extrato'))
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
            await context.sendActivity(MessageFactory.text('Buscando pelo whatsapp associado'))

            const teamid = context.activity.channelData.team.id
            const orgid = context.activity.channelData.tenant.id
            const shard = `${orgid}_${teamid}`

            const botkey = mkbotkey({ shard })
            const[plan, whatsapp] = await redis.hmget(botkey, 'plan', 'whatsapp')

            let textMessage
            if (whatsapp) {
              const type = 'connect'
              console.log(`panoptickey=${panoptickey} shard=${whatsapp}`)
              redis.xadd(panoptickey, '*', 'hardid', hardid, 'type', type, 'shard', whatsapp, 'cacapa', 'random123')
              // TODO enviar para panoptictBOTkey
              textMessage = `${whatsapp} Mandando conectar`
            } else if (plan === 'free') {
              textMessage = 'Sem bots no momento'
            } else {
              textMessage = `Solicitação enviada para [GSADMIN](https://teams.microsoft.com/l/team/${
                teamid
              }/conversations?tenantId=${
                orgid
              }) PEGA O CELULAR!!!`

              setTimeout(() => {
                const type = 'botCommandQRCODE'
                redis.xadd(panopticbotkey, '*', 'type', type, 'shard', shard)
              }, 0)
            }

            await context.sendActivity(MessageFactory.text(textMessage))
          } else if (cutarroba === 'respondercomtextosimples:') {
            console.log('respondercomtextosimples:')
            // - [ ] descobrir pra quem tá respondendo
            // - [ ] enviar comando no redis e avisar no canal

            console.log('context.activity.conversation')
            console.log(JSON.stringify(context.activity.conversation, null, 2))

          } else if (cutarroba === 'fix') {
            console.log('fix')
          } else {
            console.log(`nenhum comando para ${cutarroba}`)
          }
        } else {
          console.log(`text=${text}`)
        }
        await next()
      })
  }
}

module.exports.TeamsConversationBot = TeamsConversationBot;
