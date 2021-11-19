import fs from 'fs'
import path from 'path'
import { compile } from 'json-schema-to-typescript'

import { connect } from './src/ConnAdm/connect'
import { connectionstate } from './src/ConnAdm/connectionstate'
import { disconnect } from './src/ConnAdm/disconnect'
import { signupconnection } from './src/ConnAdm/signupconnection'

import { audioMessage } from './src/Message/audioMessage'
import { contactMessage } from './src/Message/contactMessage'
import { imageMessage } from './src/Message/imageMessage'
import { locationMessage } from './src/Message/locationMessage'
import { textMessage } from './src/Message/textMessage'
import { videoMessage } from './src/Message/videoMessage'
import { documentMessage } from './src/Message/documentMessage'

const bannerCommentPre = '/**\n* '
const bannerCommentPos = '\n*/ '

/**
 * CONNADM
 */
compile(connect, 'Connect', {
  bannerComment: `${bannerCommentPre}${'* Tipo Connect, requisita a conexão de uma instância'}${bannerCommentPos}`
}).then(ts => {
  fs.writeFile(path.join(__dirname, 'src', 'ConnAdm', 'Connect.d.ts'), ts, err => {
    if (err) {
      console.error(err)
    }
  })
})
compile(connectionstate, 'Connectionstate', {
  bannerComment: `${bannerCommentPre}${'* Tipo Connectionstate, requisita o estado de uma conexão'}${bannerCommentPos}`
}).then(ts => {
  fs.writeFile(path.join(__dirname, 'src', 'ConnAdm', 'Connectionstate.d.ts'), ts, err => {
    if (err) {
      console.error(err)
    }
  })
})
compile(disconnect, 'Disconnect', {
  bannerComment: `${bannerCommentPre}${'* Tipo Disconnect, requisita para se desconectar'}${bannerCommentPos}`
}).then(ts => {
  fs.writeFile(path.join(__dirname, 'src', 'ConnAdm', 'Disconnect.d.ts'), ts, err => {
    if (err) {
      console.error(err)
    }
  })
})
compile(signupconnection, 'Signupconnection', {
  bannerComment: `${bannerCommentPre}${'* Tipo Signupconnection, requisita a leitura de um novo QR Code'}${bannerCommentPos}`
}).then(ts => {
  fs.writeFile(path.join(__dirname, 'src', 'ConnAdm', 'Signupconnection.d.ts'), ts, err => {
    if (err) {
      console.error(err)
    }
  })
})

/**
 * MESSAGE
 */
compile(audioMessage, 'AudioMessage', {
  bannerComment: `${bannerCommentPre}${'* Tipo AudioMessage, mensagem de audiuo'}${bannerCommentPos}`
}).then(ts => {
  fs.writeFile(path.join(__dirname, 'src', 'Message', 'AudioMessage.d.ts'), ts, err => {
    if (err) {
      console.error(err)
    }
  })
})
compile(contactMessage, 'ContactMessage', {
  bannerComment: `${bannerCommentPre}${'* Tipo ContactMessage, mensagem de contato'}${bannerCommentPos}`
}).then(ts => {
  fs.writeFile(path.join(__dirname, 'src', 'Message', 'ContactMessage.d.ts'), ts, err => {
    if (err) {
      console.error(err)
    }
  })
})
compile(imageMessage, 'ImageMessage', {
  bannerComment: `${bannerCommentPre}${'* Tipo ImageMessage, mensagem de imagem'}${bannerCommentPos}`
}).then(ts => {
  fs.writeFile(path.join(__dirname, 'src', 'Message', 'ImageMessage.d.ts'), ts, err => {
    if (err) {
      console.error(err)
    }
  })
})
compile(locationMessage, 'LocationMessage', {
  bannerComment: `${bannerCommentPre}${'* Tipo LocationMessage, mensagem de localização'}${bannerCommentPos}`
}).then(ts => {
  fs.writeFile(path.join(__dirname, 'src', 'Message', 'LocationMessage.d.ts'), ts, err => {
    if (err) {
      console.error(err)
    }
  })
})
compile(textMessage, 'TextMessage', {
  bannerComment: `${bannerCommentPre}${'* Tipo TextMessage, mensagem de texto'}${bannerCommentPos}`
}).then(ts => {
  fs.writeFile(path.join(__dirname, 'src', 'Message', 'TextMessage.d.ts'), ts, err => {
    if (err) {
      console.error(err)
    }
  })
})
compile(videoMessage, 'VideoMessage', {
  bannerComment: `${bannerCommentPre}${'* Tipo TextMessage, mensagem de video'}${bannerCommentPos}`
}).then(ts => {
  fs.writeFile(path.join(__dirname, 'src', 'Message', 'VideoMessage.d.ts'), ts, err => {
    if (err) {
      console.error(err)
    }
  })
})

compile(documentMessage, 'DocumentMessage', {
  bannerComment: `${bannerCommentPre}${'* Tipo DocumentMessage, mensagem de documento'}${bannerCommentPos}`
}).then(ts => {
  fs.writeFile(path.join(__dirname, 'src', 'Message', 'DocumentMessage.d.ts'), ts, err => {
    if (err) {
      console.error(err)
    }
  })
})
