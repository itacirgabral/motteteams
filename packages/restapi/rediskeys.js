'use strict'

const hardid = process.env.HARDID || 'dev'

const rediskeys = {
  panoptickey: `hardid:${hardid}:panoptic`,
  bornskey: `hardid:${hardid}:borns`,
  mkstmkey: ({ shard }) => `hardid:${hardid}:zap:${shard}:stm`,
  mktskey: ({ shard, type }) => `hardid:${hardid}:zap:${shard}:timeserie:${type}`,
  mkqrcodekey: ({ shard, qrcode }) => `hardid:${hardid}:zap:${shard}:qrcode:${qrcode}`,
  mkpongkey: ({ shard }) => `hardid:${hardid}:zap:${shard}:pong`,
  mkchatskey: ({ shard }) => `hardid:${hardid}:zap:${shard}:chats`,
  mkfifokey: ({ shard }) => `hardid:${hardid}:zap:${shard}:fifo`,
  mkofifkey: ({ shard }) => `hardid:${hardid}:zap:${shard}:ofif`
}

module.exports = rediskeys
