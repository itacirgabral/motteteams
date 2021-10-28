import http from 'http'
import url from 'url'
import promClient from 'prom-client'


const mkProm = function mkProm () {
  const register = new promClient.Registry()
  promClient.collectDefaultMetrics({
    register,
    labels: {
      app: 'GMAPI2',
      hardid: process.env.HARDID
    }
  })

  const pomServer = http.createServer((req, res) => {
    const route = url.parse(req.url || '{"pathname":""}').pathname
    if (route === '/metrics') {
      res.setHeader('Content-Type', register.contentType)
      register.metrics().then(el => {
        res.end(el)
      })
    }
  })

  pomServer.listen(8080)

  return pomServer
}

export {
  mkProm
}