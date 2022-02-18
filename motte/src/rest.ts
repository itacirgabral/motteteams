import express from 'express'
import { client as redis, panoptickey } from '@gmapi/redispack'
import { wacPC  } from './wac'

const httpPassword =  process.env.HTTP_PASSWORD
const hardid = process.env.HARDID

const app = express()

app.get('/', (req, res) => res.send('Hello World!'))

const router = express.Router()
router.get(`/`, async (req, res) => {
  const wacs = await wacPC({ type: 'waclist' })
  res.status(200)
  res.contentType('application/json')
  res.send(wacs)
})
router.post('/respondercomtextosimples', async (req, res) => {
  const { whatsapp, to, msg } = req.body

  const type = 'respondercomtextosimples'
  await redis.xadd(panoptickey, '*',
  'hardid', hardid,
  'type', type,
  'shard', whatsapp,
  'to', to,
  'msg', msg,
  'cacapa', 'random123')

  res.status(200)
  res.json({ to, msg, whatsapp })
})
router.post('/respondercomarquivo', async (req, res) => {
  const { whatsapp, to, link, mimetype, filename } = req.body

  const type = 'respondercomarquivo'
  await redis.xadd(panoptickey, '*',
    'hardid', hardid,
    'type', type,
    'shard', whatsapp,
    'to', to,
    'link', link,
    'mimetype', mimetype,
    'filename', filename,
    'cacapa', 'random123')

  res.status(200)
  res.json({ to, link, whatsapp })
})

app.use(express.json())
app.use(`/${httpPassword}/`, router)


export default app
