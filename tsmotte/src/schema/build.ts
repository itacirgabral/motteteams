import fs from 'fs'
import { compile } from 'json-schema-to-typescript'

import { connect } from './ConnAdm/connect'
import { connectionstate } from './ConnAdm/connectionstate'
import { disconnect } from './ConnAdm/disconnect'
import { queuerestart } from './ConnAdm/queuerestart'
import { signupconnection } from './ConnAdm/signupconnection'
import { spreadrestart } from './ConnAdm/spreadrestart'

compile(connect, 'Connect').then(ts => {
  fs.writeFile('./ConnAdm/Connect.d.ts', ts, err => {
    if (err) {
      console.error(err)
    }
  })
})

compile(connectionstate, 'Connectionstate').then(ts => {
  fs.writeFile('./ConnAdm/Connectionstate.d.ts', ts, err => {
    if (err) {
      console.error(err)
    }
  })
})

compile(disconnect, 'Disconnect').then(ts => {
  fs.writeFile('./ConnAdm/Disconnect.d.ts', ts, err => {
    if (err) {
      console.error(err)
    }
  })
})

compile(queuerestart, 'Queuerestart').then(ts => {
  fs.writeFile('./ConnAdm/Queuerestart.d.ts', ts, err => {
    if (err) {
      console.error(err)
    }
  })
})

compile(signupconnection, 'Signupconnection').then(ts => {
  fs.writeFile('./ConnAdm/Signupconnection.d.ts', ts, err => {
    if (err) {
      console.error(err)
    }
  })
})

compile(spreadrestart, 'Spreadrestart').then(ts => {
  fs.writeFile('./ConnAdm/Spreadrestart.d.ts', ts, err => {
    if (err) {
      console.error(err)
    }
  })
})