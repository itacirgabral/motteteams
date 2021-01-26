const mkBlocklistUpdate = require('./mkBlocklistUpdate')
const mkChatNew = require('./mkChatNew')
const mkChatUpdate = require('./mkChatUpdate')
const mkChatsReceived = require('./mkChatsReceived')
const mkChatsUpdate = require('./mkChatsUpdate')
const mkClose = require('./mkClose')
const mkConnecting = require('./mkConnecting')
const mkConnectionPhoneChange = require('./mkConnectionPhoneChange')
const mkConnectionValidated = require('./mkConnectionValidated')
const mkContactsReceived = require('./mkContactsReceived')
const mkContactUpdate = require('./mkContactUpdate')
const mkCredentialsUpdated = require('./mkCredentialsUpdated')
const mkGroupParticipantsUpdate = require('./mkGroupParticipantsUpdate')
const mkGroupUpdate = require('./mkGroupUpdate')
const mkMessageNew = require('./mkMessageNew')
const mkMessageStatusUpdate = require('./mkMessageStatusUpdate')
const mkMessageUpdate = require('./mkMessageUpdate')
const mkOpen = require('./mkOpen')
const mkQr = require('./mkQr')
const mkReceivedPong = require('./mkReceivedPong')
const mkUserPresenceUpdate = require('./mkUserPresenceUpdate')
const mkUserStatusUpdate = require('./mkUserStatusUpdate')
const mkWsClose = require('./mkWsClose')

module.exports = ({ shard, redis, connP }) => ({
  blocklistUpdate: mkBlocklistUpdate({ shard, redis, connP }),
  chatNew: mkChatNew({ shard, redis, connP }),
  chatUpdate: mkChatUpdate({ shard, redis, connP }),
  chatsReceived: mkChatsReceived({ shard, redis, connP }),
  chatsUpdate: mkChatsUpdate({ shard, redis, connP }),
  close: mkClose({ shard, redis, connP }),
  connecting: mkConnecting({ shard, redis, connP }),
  connectionPhoneChange: mkConnectionPhoneChange({ shard, redis, connP }),
  connectionValidated: mkConnectionValidated({ shard, redis, connP }),
  contactsReceived: mkContactsReceived({ shard, redis, connP }),
  contactUpdate: mkContactUpdate({ shard, redis, connP }),
  credentialsUpdated: mkCredentialsUpdated({ shard, redis, connP }),
  groupParticipantsUpdate: mkGroupParticipantsUpdate({ shard, redis, connP }),
  groupUpdate: mkGroupUpdate({ shard, redis, connP }),
  messageNew: mkMessageNew({ shard, redis, connP }),
  messageStatusUpdate: mkMessageStatusUpdate({ shard, redis, connP }),
  messageUpdate: mkMessageUpdate({ shard, redis, connP }),
  open: mkOpen({ shard, redis, connP }),
  qr: mkQr({ shard, redis, connP }),
  receivedPong: mkReceivedPong({ shard, redis, connP }),
  userPresenceUpdate: mkUserPresenceUpdate({ shard, redis, connP }),
  userStatusUpdate: mkUserStatusUpdate({ shard, redis, connP }),
  wsClose: mkWsClose({ shard, redis, connP })
})
