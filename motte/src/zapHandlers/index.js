const mkBlocklistUpdate = require('./mkBlocklistUpdate')
const mkChatNew = require('./mkChatNew')
const mkChatUpdate = require('./mkChatUpdate')
const mkChatsReceived = require('./mkChatsReceived')
const mkChatsUpdate = require('./mkChatsUpdate')
const mkClose = require('./mkClose')
const mkConnecting = require('./mkConnecting')
const mkConnectionPhoneChange = require('./mkConnectionPhoneChange')
const mkContactsReceived = require('./mkContactsReceived')
const mkContactUpdate = require('./mkContactUpdate')
const mkGroupParticipantsUpdate = require('./mkGroupParticipantsUpdate')
const mkGroupUpdate = require('./mkGroupUpdate')
const mkOpen = require('./mkOpen')
const mkReceivedPong = require('./mkReceivedPong')
const mkWsClose = require('./mkWsClose')

const mkConnectionValidated = require('./mkConnectionValidated')
const mkInitialDataReceived = require('./mkInitialDataReceived')
const mkMessageNew = require('./mkMessageNew')
const mkMessageStatusUpdate = require('./mkMessageStatusUpdate')
const mkMessageUpdate = require('./mkMessageUpdate')
const mkQr = require('./mkQr')
const mkUserPresenceUpdate = require('./mkUserPresenceUpdate')
const mkUserStatusUpdate = require('./mkUserStatusUpdate')

// const mkBattery = require('./mkBattery')

const appendHalders = ({ conn, seed }) => {
  conn.on('open', mkOpen(seed))
  conn.on('connecting', mkConnecting(seed))
  conn.on('close', mkClose(seed))
  conn.on('ws-close', mkWsClose(seed))
  conn.on('connection-phone-change', mkConnectionPhoneChange(seed))
  conn.on('contact-update', mkContactUpdate(seed))
  conn.on('chat-new', mkChatNew(seed))
  conn.on('contacts-received', mkContactsReceived(seed))
  conn.on('chats-received', mkChatsReceived(seed))
  conn.on('initial-data-received', mkInitialDataReceived(seed))
  conn.on('chats-update', mkChatsUpdate(seed))
  conn.on('chat-update', mkChatUpdate(seed))
  conn.on('group-participants-update', mkGroupParticipantsUpdate(seed))
  conn.on('group-update', mkGroupUpdate(seed))
  conn.on('received-pong', mkReceivedPong(seed))
  conn.on('blocklist-update', mkBlocklistUpdate(seed))

  // conn.on('message-new', mkMessageNew(seed)) // RECUPERAR
  // conn.on('message-status-update', mkMessageStatusUpdate(seed)) // RECUPERAR
  // conn.on('message-update', mkMessageUpdate(seed)) // RECUPERAR

  // conn.on('initial-data-received', mkInitialDataReceived(seed)) // LEVAR PRA initial-data-received
}

module.exports = appendHalders
