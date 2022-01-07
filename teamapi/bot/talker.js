const {
    CardFactory,
    MessageFactory,
    TeamsActivityHandler,
    teamsGetChannelId,
    TurnContext
} = require('botbuilder');
const ACData = require('adaptivecards-templating');
const minimist = require('minimist');

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
          const isMe = recipient === process.env.ZAPBRIDGE_BOT_ID
          if (isTeams && isAdd && isMe) {

            const adaptiveCard = textBig.expand({
              $root: {
                text: 'ae galera cheguei'
              }
            })
            const card = CardFactory.adaptiveCard(adaptiveCard)
            const message = MessageFactory.attachment(card)
            const conversationParameters = {
              isGroup: true,
              channelData: context.activity.channelData,
              activity: message
            };

            const connectorFactory = context.turnState.get(context.adapter.ConnectorFactoryKey);
            const connectorClient = await connectorFactory.create(context.activity.serviceUrl);

            const conversationResourceResponse = await connectorClient.conversations.createConversation(conversationParameters);
          } else {
            console.log(`channel=${context.activity.channelId} action=${context.activity.action} recipient=${context.activity.recipient.id}`)
          }

          await next()
        })

        this.onMessage(async (context, next) => {
          // turn off notifications
          // TurnContext.removeRecipientMention(context.activity)

          const text = context.activity.text.trim()
          console.log(`text=${text}`)

          // https://stackoverflow.com/questions/16261635/javascript-split-string-by-space-but-ignore-space-in-quotes-notice-not-to-spli#answer-46946490
          const idxAt = text.indexOf(' ') + 1
          const idxAt2 = text.indexOf(' ', idxAt)

          const isCli = text.slice(idxAt, idxAt2) === 'cli'
          console.log(`isCli="${isCli}"`)

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
          }
        })
    }
}

module.exports.TeamsConversationBot = TeamsConversationBot;
