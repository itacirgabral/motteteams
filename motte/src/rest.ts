import express from 'express'
import { wacPC  } from './wac'

const httpPassword =  process.env.HTTP_PASSWORD
const app = express()

app.get('/', (req, res) => res.send('Hello World!'))

app.get(`/${httpPassword}`, async (req, res) => {
  const wacs = await wacPC({ type: 'waclist' })
  res.status(200)
  res.contentType('application/json')
  res.send(wacs)
})

export default app
