import { Redis } from 'ioredis'

/* eslint-disable camelcase */
export interface GestorSistemasOffice {
  uuid: string;
  status: boolean;
  xNome?: string;
  xFant?: string;
  IE?: string;
  IEST?: string;
  IM?: string;
  CNAE?: number;
  CRT?: number;
  CNPJ?: string;
  CPF?: string;
  xLgr?: string;
  nro?: string;
  xCpl?: string;
  xBairro?: string;
  cMun?: number;
  xMun?: string;
  UF?: string;
  CEP?: number;
  cPais?: number;
  xPais?: string;
  fone?: string;
  code?: string;
  key_xml?: string;
  automation?: boolean;
  document?: string;
}

const json2office = function office ({ data, prefix, redis }: { data: Array<GestorSistemasOffice>; prefix: string; redis: Redis }) {
  const pipeline = redis.pipeline()
  for (const office of data) {
    const key = `${prefix}:office:${office.uuid}`
    pipeline.hmset(key, 'uuid', office.uuid, 'status', JSON.stringify(office.status))
    if (office.xNome) {
      pipeline.hset(key, 'xNome', office.xNome)
    }
    if (office.xFant) {
      pipeline.hset(key, 'xFant', office.xFant)
    }
    if (office.IE) {
      pipeline.hset(key, 'IE', office.IE)
    }
    if (office.IEST) {
      pipeline.hset(key, 'IEST', office.IEST)
    }
    if (office.IM) {
      pipeline.hset(key, 'IM', office.IM)
    }
    if (office.CNAE) {
      pipeline.hset(key, 'CNAE', office.CNAE)
    }
    if (office.CRT) {
      pipeline.hset(key, 'CRT', office.CRT)
    }
    if (office.CNPJ) {
      pipeline.hset(key, 'CNPJ', office.CNPJ)
    }
    if (office.CPF) {
      pipeline.hset(key, 'CPF', office.CPF)
    }
    if (office.xLgr) {
      pipeline.hset(key, 'xLgr', office.xLgr)
    }
    if (office.nro) {
      pipeline.hset(key, 'nro', office.nro)
    }
    if (office.xCpl) {
      pipeline.hset(key, 'xCpl', office.xCpl)
    }
    if (office.xBairro) {
      pipeline.hset(key, 'xBairro', office.xBairro)
    }
    if (office.cMun) {
      pipeline.hset(key, 'cMun', office.cMun)
    }
    if (office.xMun) {
      pipeline.hset(key, 'xMun', office.xMun)
    }
    if (office.UF) {
      pipeline.hset(key, 'UF', office.UF)
    }
    if (office.CEP) {
      pipeline.hset(key, 'CEP', office.CEP)
    }
    if (office.cPais) {
      pipeline.hset(key, 'cPais', office.cPais)
    }
    if (office.xPais) {
      pipeline.hset(key, 'xPais', office.xPais)
    }
    if (office.fone) {
      pipeline.hset(key, 'fone', office.fone)
    }
    if (office.code) {
      pipeline.hset(key, 'code', office.code)
    }
    if (office.key_xml) {
      pipeline.hset(key, 'key_xml', office.key_xml)
    }
    if (office.automation) {
      pipeline.hset(key, 'key_xml', JSON.stringify(office.automation))
    }
    if (office.document) {
      pipeline.hset(key, 'document', office.document)
    }
  }

  return pipeline.exec()
}

export {
  json2office
}
