const delay = require('./delay')

const mkContactInfo = ({
  panoptickey,
  lastRawKey
}) => async ({ crumb, seed, healthcare }) => {
  if (seed.conn.contacts[crumb.jid]) {
    const { notify, vname } = seed.conn.contacts[crumb.jid]
    const [avatar, { status }] = await Promise.all([seed.conn.getProfilePicture(crumb.jid), seed.conn.getStatus(crumb.jid)])

    const notifysent = {
      type: 'sendhook',
      hardid: seed.hardid,
      shard: seed.shard,
      json: JSON.stringify({
        type: 'contact',
        from: seed.shard,
        number: crumb.jid.split('@s.whatsapp.net')[0],
        name: vname || notify,
        status: typeof status === 'string' ? status : undefined,
        avatar
      })
    }

    seed.redis.publish(panoptickey, JSON.stringify(notifysent))

    await delay(250 * (1 + Math.random()))
  }

  await seed.redis.ltrim(lastRawKey, 0, -2)
}

module.exports = mkContactInfo
