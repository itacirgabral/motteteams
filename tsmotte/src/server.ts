import { redis } from './redis'
import { panoptickey } from './rediskeys'
import { trafficwand } from './trafficwand'

trafficwand({ redis, panoptickey }, (err, bread) => {
  if (err) {
    console.error(err)
  } else {
    console.dir(bread)
  }
})