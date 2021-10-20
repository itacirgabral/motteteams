import fs from 'fs'
import path from 'path'
import { compile } from 'json-schema-to-typescript'

import { connect } from './ConnAdm/connect'
import { connectionstate } from './ConnAdm/connectionstate'
import { disconnect } from './ConnAdm/disconnect'
import { queuerestart } from './ConnAdm/queuerestart'
import { signupconnection } from './ConnAdm/signupconnection'
import { spreadrestart } from './ConnAdm/spreadrestart'

const bannerCommentPre = '/**\n* '
const bannerCommentPos = '\n*/ '

compile(connect, 'Connect', {
  bannerComment: `${bannerCommentPre}${'* Tipo Connect, requisita a conexão de uma instância'}${bannerCommentPos}`
}).then(ts => {
  fs.writeFile(path.join(__dirname, 'ConnAdm', 'Connect.d.ts'), ts, err => {
    if (err) {
      console.error(err)
    }
  })
})

compile(connectionstate, 'Connectionstate', {
  bannerComment: `${bannerCommentPre}${'* Tipo Connectionstate, requisita o estado de uma conexão'}${bannerCommentPos}`
}).then(ts => {
  fs.writeFile(path.join(__dirname, 'ConnAdm', 'Connectionstate.d.ts'), ts, err => {
    if (err) {
      console.error(err)
    }
  })
})

compile(disconnect, 'Disconnect', {
  bannerComment: `${bannerCommentPre}${'* Tipo Disconnect, requisita para se desconectar'}${bannerCommentPos}`
}).then(ts => {
  fs.writeFile(path.join(__dirname, 'ConnAdm', 'Disconnect.d.ts'), ts, err => {
    if (err) {
      console.error(err)
    }
  })
})

compile(queuerestart, 'Queuerestart',{
  bannerComment: `${bannerCommentPre}${'* Tipo Queuerestart, requisita pra se reiniciar o baterista'}${bannerCommentPos}`
}).then(ts => {
  fs.writeFile(path.join(__dirname, 'ConnAdm', 'Queuerestart.d.ts'), ts, err => {
    if (err) {
      console.error(err)
    }
  })
})

compile(signupconnection, 'Signupconnection', {
  bannerComment: `${bannerCommentPre}${'* Tipo Signupconnection, requisita a leitura de um novo QR Code'}${bannerCommentPos}`
}).then(ts => {
  fs.writeFile(path.join(__dirname, 'ConnAdm', 'Signupconnection.d.ts'), ts, err => {
    if (err) {
      console.error(err)
    }
  })
})

compile(spreadrestart, 'Spreadrestart', {
  bannerComment: `${bannerCommentPre}${'* Tipo Spreadrestart, requisita pra se reiniciar o baterista reverso'}${bannerCommentPos}`
}).then(ts => {
  fs.writeFile(path.join(__dirname, 'ConnAdm', 'Spreadrestart.d.ts'), ts, err => {
    if (err) {
      console.error(err)
    }
  })
})