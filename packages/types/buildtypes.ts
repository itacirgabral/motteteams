import fs from 'fs'
import path from 'path'
import { compile } from 'json-schema-to-typescript'

import { connect } from './src/ConnAdm/connect'
import { connectionstate } from './src/ConnAdm/connectionstate'
import { disconnect } from './src/ConnAdm/disconnect'
import { signupconnection } from './src/ConnAdm/signupconnection'

const bannerCommentPre = '/**\n* '
const bannerCommentPos = '\n*/ '

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
