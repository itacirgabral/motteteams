import fs from 'fs'
import { client as redis, json2office, GestorSistemasOffice } from '@gmapi/redispack'

const hardid = process.env.HARDID

const json = fs.readFileSync('./dumpup/office.json', 'utf8')

if (json) {
  const obj = JSON.parse(json) as {
    data: Array<GestorSistemasOffice>
  }
  const data = obj.data
  const prefix = `hardid:${hardid}`

  console.log(`prefix=${prefix}`)
  json2office({ redis, prefix, data }).then(console.dir)
} else {
  console.log('./dumpup/office.json not found')
}

console.dir(redis)
