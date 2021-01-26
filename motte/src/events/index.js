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

module.exports = (seed) => ({
  blocklistUpdate: mkBlocklistUpdate(seed),
  chatNew: mkChatNew(seed),
  chatUpdate: mkChatUpdate(seed),
  chatsReceived: mkChatsReceived(seed),
  chatsUpdate: mkChatsUpdate(seed),
  close: mkClose(seed),
  connecting: mkConnecting(seed),
  connectionPhoneChange: mkConnectionPhoneChange(seed),
  connectionValidated: mkConnectionValidated(seed),
  contactsReceived: mkContactsReceived(seed),
  contactUpdate: mkContactUpdate(seed),
  credentialsUpdated: mkCredentialsUpdated(seed),
  groupParticipantsUpdate: mkGroupParticipantsUpdate(seed),
  groupUpdate: mkGroupUpdate(seed),
  messageNew: mkMessageNew(seed),
  messageStatusUpdate: mkMessageStatusUpdate(seed),
  messageUpdate: mkMessageUpdate(seed),
  open: mkOpen(seed),
  qr: mkQr(seed),
  receivedPong: mkReceivedPong(seed),
  userPresenceUpdate: mkUserPresenceUpdate(seed),
  userStatusUpdate: mkUserStatusUpdate(seed),
  wsClose: mkWsClose(seed)
})
