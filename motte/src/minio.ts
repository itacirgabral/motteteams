import * as Minio from 'minio'

const endPoint = process.env.MINIO_END_POINT || 'localhost'
const port = Number(process.env.MINIO_PORT) || 9000
const useSSL = process.env.MINIO_USE_SSL === 'yes'
const accessKey = process.env.MINIO_ACCESS_KEY || ''
const secretKey = process.env.MINIO_SECRET_KEY || ''

const minio = new Minio.Client({
  endPoint,
  port,
  useSSL,
  accessKey,
  secretKey
})

export {
  minio
}