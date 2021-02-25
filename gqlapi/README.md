# graphql api

## tokens graphql
| nome | numero | jwt |
| ---- | ---- | ---- |
| itacir | 556599375661 | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaGFyZCI6IjU1NjU5OTM3NTY2MSIsImlhdCI6MTYxNDI2NTgyMH0.q__Zov_tTDUXNhcSPSii3UL_hwaAEVf1C-qGvAWRq8c |
|  |  |
|  |  |
|  |  |
|  |  |
|  |  |
|  |  |

```javascript
// node -r dotenv/config
const jwtSecret = process.env.JWT_SECRET
const jsonwebtoken = require('jsonwebtoken')
const shard = '556599375661'

jsonwebtoken.sign({ shard }, jwtSecret)
```

- https://itnext.io/how-we-manage-live-1m-graphql-websocket-subscriptions-11e1880758b0