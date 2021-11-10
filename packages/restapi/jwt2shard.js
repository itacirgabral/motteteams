const jsonwebtoken = require('jsonwebtoken')

const jwtSecret = process.env.JWT_SECRET

const jwt2shard = (req, res, next) => {
  const authorization = req.headers.authorization || 'noops'
  const jwt = authorization.split('Bearer ')[1]
  let shard
  try {
    shard = jsonwebtoken.verify(jwt, jwtSecret)
  } catch (err) {
    shard = false
  }
  if (shard) {
    req.shard = shard
    next()
  } else {
    res.status(401).end()
    next('401')
  }
}

module.exports = jwt2shard
