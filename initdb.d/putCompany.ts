import { client as redis, json2company, GestorSistemasCompany } from '@gmapi/redispack'
import fs from 'fs'

const hardid = process.env.HARDID
const json = fs.readFileSync('./dumpup/company.json', 'utf8')
if (json) {
  const obj = JSON.parse(json) as {
    data: Array<GestorSistemasCompany>
  }
  const data = obj.data
  const prefix = `hardid:${hardid}`

  console.log(`prefix=${prefix}`)
  json2company({ redis, prefix, data }).then(console.dir)
} else {
  console.log('./dumpup/company.json not found')
}
