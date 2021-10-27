import promClient from 'prom-client'

const promPushUrl = process.env.PROM_PUSH_URL || 'http://127.0.0.1:9091'

const collectDefaultMetrics = promClient.collectDefaultMetrics;
const Registry = promClient.Registry
const register = new Registry()

collectDefaultMetrics({
  register,
  labels: {
    resouce: process.env.HARDID || 'dev'
  }
})

const prom = new promClient.Pushgateway(promPushUrl)

export {
  prom
}