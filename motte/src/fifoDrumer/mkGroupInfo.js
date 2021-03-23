const delay = require('./delay')

const mkGroupInfo = ({
  panoptickey,
  lastRawKey
}) => async ({ crumb, seed, healthcare }) => {
  if (seed.conn.contacts[crumb.jid]) {
    const info = await seed.conn.groupMetadataMinimal(crumb.jid).catch(() => false)

    console.log(JSON.stringify(info, null, 2))

    const notifysent = {
      type: 'sendhook',
      hardid: seed.hardid,
      shard: seed.shard,
      json: JSON.stringify({
        type: 'group',
        from: seed.shard,
        number: crumb.jid.split('@s.whatsapp.net')[0]
      })
    }

    seed.redis.publish(panoptickey, JSON.stringify(notifysent))

    await delay(250 * (1 + Math.random()))
  }

  await seed.redis.ltrim(lastRawKey, 0, -2)
}

module.exports = mkGroupInfo
