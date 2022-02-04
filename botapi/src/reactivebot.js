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

const { client: redis, mkbotkey, mkcacapakey, panopticbotkey, panoptickey, mkboxenginebotkey, mkattkey, mkattmetakey, mkchatkey } = require('@gmapi/redispack')
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

const reservaTemplate = new ACData.Template({
  type: 'AdaptiveCard',
  msteams: {
    width: "Full"
  },
  body: [
    {
        type: "TextBlock",
        text: "Escolha abaixo qual chat deve ter suas mensagens sincronizadas com este canal",
        wrap: true
    },
    {
        type: "Input.ChoiceSet",
        choices: [
            {
                title: "Administrativo",
                value: "adm"
            },
            {
                title: "Apenas Mensagens de Grupos",
                value: "grp"
            },
            {
                title: "Mensagens",
                value: "tds"
            }
        ],
        placeholder: "CHAT",
        id: "chatlist"
    }
  ],
  actions: [
    {
      type: "Action.Submit",
      title: "Reservar",
      data: {
        msteams: {
          type: "task/fetch"
        }
      }
    }
  ],
  $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
  version: '1.3'
})

const loginTemplate = new ACData.Template({
  type: 'AdaptiveCard',
  msteams: {
    width: "Full"
  },
  body: [
    {
      "type": "TextBlock",
      "size": "Medium",
      "weight": "Bolder",
      "text": "Preciso do seu login, clique no botão abaixo:"
    }
  ],
  actions: [
    {
      "type": "Action.Submit",
      "title": "login",
      "data": {
          "msteams": {
              "type": "signin",
              "value": "https://signin.com"
          }
      }
    }
  ],
  $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
  version: '1.3'
})

class TeamsConversationBot extends TeamsActivityHandler {
  constructor() {
      super();

      this.onConversationUpdate(async (context, next) => {
        const isTeams = context.activity?.channelId === 'msteams'
        const isAdd = context.activity?.channelData?.eventType === 'teamMemberAdded'
        const isGSADMIN = context.activity?.channelData?.team?.name === 'GSADMIN'

        const teamid = context.activity?.channelData?.team?.id
        const orgid = context.activity?.channelData?.tenant?.id
        const shard = `${orgid}_${teamid}`
        console.log(`bot=${shard}`)

        if (isTeams && isAdd && isGSADMIN) {
          const botkey = mkbotkey({ shard })

          const channelData = {
            teamsChannelId: teamid,
            teamsTeamId: teamid,
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

        const teamid = context.activity?.channelData?.team?.id
        const orgid = context.activity?.channelData?.tenant?.id
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
        const text = context.activity?.text?.trim() ?? ''
        console.log(`text=${text}`)

        const orgid = context.activity?.channelData?.tenant?.id
        const teamid = context.activity?.channelData?.team?.id

        const isChannel = context.activity.conversation.conversationType === 'channel'
        const isPersonal = context.activity.conversation.conversationType === 'personal'
        const firstBlank = text.indexOf(' ')
        const secondBlank = text.indexOf(' ', text.indexOf(' ') + 1)
        const cutarroba = secondBlank === -1 ? text.slice(firstBlank + 1) : text.slice(firstBlank + 1, secondBlank)
        const isCommand = cutarroba.indexOf(' ') === -1

        if (isCommand && isChannel) {
          const shard = `${orgid}_${teamid}`
          const botkey = mkbotkey({ shard })
          if (cutarroba === 'login') {
            console.log('login')
            const adaptiveCard = loginTemplate.expand()
            const card = CardFactory.adaptiveCard(adaptiveCard)
            const message = MessageFactory.attachment(card)
            await context.sendActivity(message)
          } else if (cutarroba === 'extrato') {
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

            const boxenginebotkey = mkboxenginebotkey({
              shard: context.activity.conversation.id
            })

            const boxenginebot = await redis.hmget(boxenginebotkey, 'whatsapp', 'chat')
            const [whatsapp, chat] = boxenginebot
            const msg = text.slice(text.indexOf(' ', text.indexOf(' ') + 1) + 1)

            if (!!whatsapp && !!chat) {
              await context.sendActivity(MessageFactory.text(`respondendo pelo whatsapp=${whatsapp} para o chat=${chat} a mensagem=${msg}`))
              setTimeout(async () => {
                const type = 'respondercomtextosimples'
                await redis.xadd(panoptickey, '*', 'hardid', hardid, 'type', type, 'shard', whatsapp, 'to', chat, 'msg', msg, 'cacap', 'random123')
                // console.log(`panoptickey=${panoptickey} shard=${whatsapp} chat=${chat} msg=${msg}`)
              }, 0)
            } else {
              await context.sendActivity(MessageFactory.text('Esta conversa já foi encerrada'))
            }
          } else if (cutarroba === 'finalizar') {
            console.log('finalizar')

            await context.sendActivity(MessageFactory.text('Ok humano, finalizar-lo-ei'))
            const conversationId = context.activity.conversation.id

            const teamid = context.activity?.channelData?.team?.id
            const orgid = context.activity?.channelData?.tenant?.id
            const shard = `${orgid}_${teamid}`

            console.dir(context.activity)

            setTimeout(async () => {
              const boxenginebotkey = mkboxenginebotkey({
                shard: conversationId
              })

              const boxenginebot = await redis.hmget(boxenginebotkey, 'whatsapp', 'chat')
              const [whatsapp, chat] = boxenginebot
              const attid = `${whatsapp}/${chat}`

              const attkey = mkattkey({
                shard,
                attid
              })
              const attmetakey = mkattmetakey({
                shard,
                attid
              })

              const result = await redis
                .multi()
                .del(boxenginebotkey)
                .del(attkey)
                .del(attmetakey)
                .exec()
            }, 0)
          } else if (cutarroba === 'reservar') {
            console.log('reservar')
            const adaptiveCard = reservaTemplate.expand()
            const card = CardFactory.adaptiveCard(adaptiveCard)
            const message = MessageFactory.attachment(card)
            await context.sendActivity(message)
          } else if (cutarroba === 'allchats') {

            // fix
            // apenas novas conversas, não em respostas

            const whatsapp = await redis.hget(botkey, 'whatsapp')
            if (whatsapp) {
              const chatkeys = mkchatkey({ shard: whatsapp, chatid: '*' })
              console.log(`chatkeys=${chatkeys}`)
              const keychatids = await redis.keys(chatkeys)
              const chatids = keychatids.map(el => el.split(':').pop())

              await context.sendActivities(chatids.map(chatid => MessageFactory.text(chatid)))
            } else {
              await context.sendActivity(MessageFactory.text('humano... aqui não tem whatsapp'))
            }

          } else if (cutarroba === 'chatinfo') {
            const type = 'getchatinfo'
            const chat = '556599375661'
            await redis.xadd(panoptickey, '*', 'hardid', hardid, 'type', type, 'shard', whatsapp, 'chat', chat)

          } else {
            console.dir(context.activity.attachments)
            console.log(`nenhum comando para ${cutarroba}`)
          }
        } else if (isCommand && isPersonal) {
          if (cutarroba === 'help') {
            const message = MessageFactory.text('Olá humano. Não compreendo!')
            await context.sendActivity(message)
          } else {
            console.dir(context.activity.attachments)
            console.log(`nenhum comando para ${cutarroba}`)
          }

        } else {
          console.log(`text=${text}`)
        }

        // AWAIT NEXT FOL ALL
        await next()
      })

      this.onTokenResponseEvent(async (context, next) => {
        console.log('SsoBot onTokenResponseEvent')
        // await this.dialog.run(context, this.dialogState)
        await next()
    });
  }

  handleTeamsTaskModuleFetch(context, taskModuleRequest) {
    console.log('handleTeamsTaskModuleFetch')
    //console.log(JSON.stringify(taskModuleRequest, null, 2))
    // https://docs.microsoft.com/en-us/microsoftteams/platform/task-modules-and-cards/cards/cards-actions?tabs=json#adaptive-cards-actions

    return {
      task: {
        type: 'continue',
        value: {
          card: CardFactory.adaptiveCard({
            version: '1.3',
            type: 'AdaptiveCard',
            body: [
              {
                type: 'TextBlock',
                text: 'Providenciarei'
              }
            ]
          })
        }
      }
    }
  }

  async handleTeamsSigninVerifyState(context, query) {
    console.log("SsoBot handleTeamsSigninVerifyState")
  }
  async handleTeamsSigninTokenExchange(context, query) {
    console.log("SsoBot handleTeamsSigninTokenExchange")
  }
}

module.exports.TeamsConversationBot = TeamsConversationBot;
