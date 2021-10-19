import { redis } from './redis'
import { panoptickey } from './rediskeys'
import { trafficwand } from './trafficwand'

trafficwand({ redis, panoptickey }).subscribe({
  next(bread) {
    console.log(JSON.stringify(bread, null, 2))
  },
  error(err) { console.error('something wrong occurred: ' + err); },
  complete() { console.log('done'); }
});