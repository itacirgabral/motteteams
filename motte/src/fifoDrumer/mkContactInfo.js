const delay = require('./delay')

const mkContactInfo = ({
  panoptickey,
  lastRawKey
}) => async ({ crumb, seed, healthcare }) => {
  if (seed.conn.contacts[crumb.jid]) {
    const { notify, name } = seed.conn.contacts[crumb.jid]
    const [avatar, { status }] = await Promise.all([
      seed.conn.getProfilePicture(crumb.jid).catch(() => undefined),
      seed.conn.getStatus(crumb.jid).catch(() => ({ status: undefined }))
    ])

    const notifysent = {
      type: 'sendhook',
      hardid: seed.hardid,
      shard: seed.shard,
      json: JSON.stringify({
        type: 'contact',
        from: seed.shard,
        number: crumb.jid.split('@s.whatsapp.net')[0],
        name,
        notify,
        status: typeof status === 'string' ? status : undefined,
        avatar
      })
    }

    seed.redis.publish(panoptickey, JSON.stringify(notifysent))

    await delay(250 * (1 + Math.random()))
  } else {
    const notifysent = {
      type: 'sendhook',
      hardid: seed.hardid,
      shard: seed.shard,
      json: JSON.stringify({
        type: 'contact',
        from: seed.shard,
        number: crumb.jid.split('@s.whatsapp.net')[0],
        name: '',
        status: '',
        avatar: ''
      })
    }

    seed.redis.publish(panoptickey, JSON.stringify(notifysent))
  }

  await seed.redis.ltrim(lastRawKey, 0, -2)
}

module.exports = mkContactInfo
