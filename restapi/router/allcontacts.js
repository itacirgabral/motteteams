const allcontacts = ({ redis, mkcontactskey }) => (req, res) => {
  const shard = req.shard
  redis.smembers(mkcontactskey(shard))
    .catch(() => {
      res.status(500).end()
    })
    .then(contacts => {
      res.status(200).json({
        type: 'allcontacts',
        contacts: contacts.map(el => el.split('@s.whatsapp.net')[0])
      })
    })
}

module.exports = allcontacts
