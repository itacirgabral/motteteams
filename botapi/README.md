# ZAPBRIDGE
- [How Microsoft Teams bots work](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-basics-teams?view=azure-bot-service-4.0&tabs=javascript)
- [Proactive message](https://stackoverflow.com/questions/62034876/using-the-bot-framework-to-post-to-a-microsoft-teams-channel-with-nodejs#answer-62041785)

# DOC
- [microsoftteams](https://docs.microsoft.com/pt-br/microsoftteams/platform/bots/what-are-bots?view=msteams-client-js-latest)
# SAMPLE
- [botbuilder](https://github.com/microsoft/botbuilder-samples)

# teams bot
- cloudflared tunnel --hostname betabot.gestormessenger.team --url localhost:3978 --name betaorgbot
- cloudflared tunnel --hostname alfabot.gestormessenger.team --url localhost:3978 --name alfakitbot

# docker build
```
verdaccio -l 0.0.0.0:4873
```
```
docker build -t cloud.canister.io:5000/itacirgabral/botapi ./
docker run cloud.canister.io:5000/itacirgabral/botapi
docker push cloud.canister.io:5000/itacirgabral/botapi
```