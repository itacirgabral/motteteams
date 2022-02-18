import fs from 'fs'
import { json2office, client, GestorSistemasOffice } from '@gmapi/redispack'

require('dotenv').config({
  path: require('path').join(__dirname, '.env')
})

const hardid = process.env.HARDID

const json = fs.readFileSync('./dumpup/office.json', 'utf8')

if (json) {
  const obj = JSON.parse(json) as {
    data: Array<GestorSistemasOffice>
  }

  const prefix = `hardid:${hardid}`

  json2office({
    redis: client,
    prefix,
    data: obj.data
  }).then(console.dir)
} else {
  console.log('./dumpup/office.json not found')
}
