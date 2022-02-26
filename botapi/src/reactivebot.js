const {
  CardFactory,
  MessageFactory,
  TeamsActivityHandler,
  tokenExchangeOperationName,
  TeamsInfo
} = require('botbuilder');
const ACData = require('adaptivecards-templating');

const { client: redis, mkbotkey, mkcacapakey, panopticbotkey, panoptickey, mkboxenginebotkey, mkattkey, mkattmetakey, mkchatkey, mkofficekey } = require('@gmapi/redispack')
const QRCode = require('qrcode');
const adapter = require('./msteamsAdapter');

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

let msGraphClient
const microsoft = require('@microsoft/microsoft-graph-client')
require('isomorphic-fetch')

class TeamsConversationBot extends TeamsActivityHandler {
  constructor() {
      super();

      this.onConversationUpdate(async (context, next) => {
        const isTeams = context.activity.conversation.conversationType === 'channel'
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
        const isTeams = context.activity.conversation.conversationType === 'channel'
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
        const inplacearroba = text.slice(0, firstBlank)
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

            await context.sendActivity(MessageFactory.text('Buscando pelo extrato'))

            const oidP = redis.hget(botkey, 'office')
            const megainfoP = Promise.all([
              TeamsInfo.getMember(context, context.activity.from.id),
              TeamsInfo.getTeamDetails(context, context.activity.channelData.teamsTeamId),
              TeamsInfo.getTeamChannels(context, context.activity.channelData.teamsTeamId),
              TeamsInfo.getTeamMembers(context, context.activity.channelData.teamsTeamId)
            ])

            const oid = await oidP

            const officeKey = mkofficekey({ shard, oid })
            const office = await redis.hgetall(officeKey)
            context.sendActivity(MessageFactory.text(JSON.stringify(office, null, 2)))

            const [memberInfo, teamsInfo, teamsChannels, teamsMembers] = await megainfoP
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
                await redis.xadd(panoptickey, '*', 'hardid', hardid, 'type', type, 'shard', whatsapp, 'to', chat, 'msg', msg, 'cacapa', 'random123')
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

              // // avisa que terminou o atendimento
              const type = 'respondercomtextosimples'
              const sendEnd = redis.xadd(panoptickey, '*',
              'hardid', hardid,
              'type', type,
              'shard', whatsapp,
              'to', chat,
              'msg', '_atendimento finalizado_',
              'cacapa', 'random123')

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
            const chatid = text.slice(secondBlank + 1)
            console.log(`chatid=${chatid}`)
            if (Number.isInteger(parseInt(chatid))) {
              const type = 'getchatinfo'
              const whatsapp = await redis.hget(botkey, 'whatsapp')
              if (whatsapp) {
                const cacapa = mkcacapakey()
                await redis.xadd(panoptickey, '*', 'hardid', hardid, 'type', type, 'shard', whatsapp, 'chat', chatid, 'cacapa', cacapa)
                const [_key, chatinfoResponse] = await redis.blpop(cacapa, 40)

                if (chatinfoResponse) {
                  await context.sendActivity(MessageFactory.text(chatinfoResponse))
                } else {
                  await context.sendActivity(MessageFactory.text(`chatinfo ${chatid} timeout`))
                }
              } else {
                const textMessage = 'Sem bots no momento'
                await context.sendActivity(MessageFactory.text(textMessage))
              }

            }
          } else if (cutarroba === 'setoffice') {
            const oid = text.slice(secondBlank + 1)

            await redis.hset(botkey, 'office', oid)
            await context.sendActivity(MessageFactory.text(`botkey=${botkey} office=${oid}`))

          } else {
            console.dir(context.activity.attachments)
            console.log(`nenhum comando para ${cutarroba}`)
          }
        } else if (isCommand && isPersonal) {
          if (inplacearroba === 'help') {
            const connectionName = process.env.SSO_CONNECTION_NAME
            const appId = process.env.MicrosoftAppId

            const oauthCard = await CardFactory.oauthCard(connectionName, undefined, undefined, undefined, {
              id: 'noidea_random65jHf9276hDy47',
              uri: `api://botid-${appId}`
            })

            const message = MessageFactory.attachment(oauthCard)
            await context.sendActivity(message)
          } else if (inplacearroba === 'token') {
            if (msGraphClient) {
              const me = await msGraphClient.api("me").get()

              console.dir(me)

              await context.sendActivity(MessageFactory.text(`me=${me}`))
            } else {
              await context.sendActivity(MessageFactory.text('no token'))
            }
            //
          } else if (inplacearroba === 'setoffice') {
            // const oid = text.slice(firstBlank + 1)
            // const teamid = context.activity?.channelData?.team?.id
            // const orgid = context.activity?.channelData?.tenant?.id
            // const shard = `${orgid}_${teamid}`

            // const botkey = mkbotkey({ shard })

            // await redis.hset(botkey, 'office', oid)

            // await context.sendActivity(MessageFactory.text(`botkey=${botkey} office=${oid}`))
          } else {
            console.log(`nenhum comando para ${inplacearroba}`)
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

  async handleTeamsTabFetch(context, tabRequest) {
    console.log('handleTeamsTabFetch')

    const tabName = tabRequest?.tabContext?.tabEntityId
    switch (tabName) {
      case 'GestorMessengerEscritorio':

        return {
          tab: {
            type: "continue",
            value: {
                cards: [
                    {
                        "card": {
                          "type": "AdaptiveCard",
                          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                          "version": "1.3",
                          "body": [
                            {
                              "type": "TextBlock",
                              "text": "ESCRITóRIO",
                              "horizontalAlignment": "Center",
                              "fontType": "Monospace",
                              "size": "ExtraLarge",
                              "weight": "Bolder",
                              "color": "Default",
                              "separator": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "uuid",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "status",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "xNome",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "xFant",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "IE",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "IEST",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "IM",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "CNAE",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "CRT",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "CNPJ",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "CPF",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "xLgr",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "nro",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "xCpl",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "xBairro",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "cMun",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "xMun",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "UF",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "CEP",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "cPais",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "xPais",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "fone",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "code",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "key_xml",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "automation",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "document",
                              "wrap": true
                            }
                          ]
                      }
                    }
                ]
            },
        },
        responseType: "tab"
        }
        break;
      case 'GestorMessengerClientes':
        return {
          tab: {
            type: "continue",
            value: {
                cards: [
                    {
                        "card": {
                          "type": "AdaptiveCard",
                          "body": [
                              {
                                  "type": "TextBlock",
                                  "size": "Medium",
                                  "weight": "Bolder",
                                  "text": "Publish Adaptive Card Schema"
                              },
                              {
                                  "type": "ColumnSet",
                                  "columns": [
                                      {
                                          "type": "Column",
                                          "items": [
                                              {
                                                  "type": "Image",
                                                  "style": "Person",
                                                  "url": "https://pbs.twimg.com/profile_images/3647943215/d7f12830b3c17a5a9e4afcc370e3a37e_400x400.jpeg",
                                                  "size": "Small"
                                              }
                                          ],
                                          "width": "auto"
                                      },
                                      {
                                          "type": "Column",
                                          "items": [
                                              {
                                                  "type": "TextBlock",
                                                  "weight": "Bolder",
                                                  "text": "Paulo Paixao",
                                                  "wrap": true
                                              }
                                          ],
                                          "width": "stretch"
                                      }
                                  ]
                              },
                              {
                                  "type": "TextBlock",
                                  "text": "ow that we have defined the main rules and features of the format, we need to produce a schema and publish it to GitHub. The schema will be the starting point of our reference documentation",
                                  "wrap": true
                              }
                          ],
                          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                          "version": "1.5"
                      }
                    }
                ]
            },
        },
        responseType: "tab"
        }
        break;
      case 'GestorMessengerEquipes':
        return {
          tab: {
            type: "continue",
            value: {
                cards: [
                    {
                        "card": {
                          "type": "AdaptiveCard",
                          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                          "version": "1.3",
                          "body": [
                            {
                              "type": "TextBlock",
                              "text": "ABA DE EQUIPES",
                              "horizontalAlignment": "Center",
                              "fontType": "Monospace",
                              "size": "ExtraLarge",
                              "weight": "Bolder",
                              "color": "Default",
                              "separator": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "Em quais equipes você está?",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "Quais instâncias estão em quais equipes?",
                              "wrap": true
                            },
                            {
                              "type": "TextBlock",
                              "text": "Qual canal está associado a qual remetente?",
                              "wrap": true
                            }
                          ]
                      }
                    }
                ]
            },
        },
        responseType: "tab"
        }
        break;
      default:
        break;
    }
  }

  async handleTeamsSigninVerifyState(context, query) {
    console.log("SsoBot handleTeamsSigninVerifyState")
  }
  async handleTeamsSigninTokenExchange(context, query) {
    console.log("SsoBot handleTeamsSigninTokenExchange");
    if (context?.activity?.name === tokenExchangeOperationName) {
      console.dir(context?.activity?.value)

      const token = context?.activity?.value?.token

      msGraphClient = microsoft.Client.init({
        debugLogging: true,
        authProvider: done => {
          done(null, token)
        }
      })

    } else {
      console.log(`${context?.activity?.name} !== ${tokenExchangeOperationName}`)
    }
  }
}

module.exports.TeamsConversationBot = TeamsConversationBot;
