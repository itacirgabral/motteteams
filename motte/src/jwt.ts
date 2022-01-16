import jsonwebtoken from 'jsonwebtoken'

const hardid = process.env.HARDID || ''

const makeMomToken = function makeMomToken({ mitochondria }: { mitochondria: string }) {
  return jsonwebtoken.sign(mitochondria, hardid)
}

const makeCountyToken = function makeCountyToken ({ shard }: { shard: string }) {
  return jsonwebtoken.sign(shard, hardid)
}

const verifyToken = function verifyToken ({ jwt }: { jwt: string }) {
  return jsonwebtoken.verify(jwt, hardid)
}

export {
  makeMomToken,
  makeCountyToken,
  verifyToken
}