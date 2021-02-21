const sortingMessages = ({
  conversation,
  quoteMsg,
  location,
  contact,
  image,
  document,
  audio
}) => {
  let type
  let isQuoted = false
  let isForwarded = false
  let msg

  if (conversation) {
    type = 'textMessage'
    msg = conversation
  } else if (quoteMsg) {
    type = 'textMessage'
    msg = quoteMsg.text
    if (quoteMsg.contextInfo?.isForwarded) {
      isForwarded = true
    }
    if (quoteMsg.contextInfo?.stanzaId) {
      isQuoted = true
    }
  } else if (contact) {
    type = 'contactMessage'
    if (contact?.contextInfo?.isForwarded) {
      isForwarded = true
    }
    if (contact?.contextInfo?.stanzaId) {
      isQuoted = true
    }
  } else if (location) {
    type = 'locationMessage'
    if (location?.contextInfo?.isForwarded) {
      isForwarded = true
    }
    if (location?.contextInfo?.stanzaId) {
      isQuoted = true
    }
  } else if (image) {
    type = 'imageMessage'
    if (image?.contextInfo?.isForwarded) {
      isForwarded = true
    }
    if (image?.contextInfo?.stanzaId) {
      isQuoted = true
    }
  } else if (document) {
    type = 'documentMessage'
    if (document?.contextInfo?.isForwarded) {
      isForwarded = true
    }
    if (document?.contextInfo?.stanzaId) {
      isQuoted = true
    }
  } else if (audio) {
    type = 'audioMessage'
    if (audio?.contextInfo?.isForwarded) {
      isForwarded = true
    }
    if (audio?.contextInfo?.stanzaId) {
      isQuoted = true
    }
  }

  return { type, isForwarded, isQuoted, msg }
}

module.exports = sortingMessages
