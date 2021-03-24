const delay = require('./delay')

const mkGroupInfo = ({
  panoptickey,
  lastRawKey
}) => async ({ crumb, seed, healthcare }) => {
  if (seed.conn.contacts[crumb.jid]) {
    const info = await seed.conn.groupMetadataMinimal(crumb.jid).catch(() => false)

    const notifysent = {
      type: 'sendhook',
      hardid: seed.hardid,
      shard: seed.shard,
      json: JSON.stringify({
        type: 'group',
        from: seed.shard,
        number: (crumb.jid || '@').split('@')[0],
        owner: (info.owner || '@').split('@')[0],
        creator: (info.creator || '@').split('@')[0],
        creation: String(info.creation),
        participants: info.participants.map(el => ({
          ...el,
          jid: undefined,
          number: el.jid.split('@')[0]
        }))
      })
    }

    seed.redis.publish(panoptickey, JSON.stringify(notifysent))

    await delay(250 * (1 + Math.random()))
  }

  await seed.redis.ltrim(lastRawKey, 0, -2)
}

module.exports = mkGroupInfo
