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

/* eslint-disable camelcase */
export interface GestorSistemasCompany {

}

const json2office = async function office ({ data, prefix, redis }: { data: Array<GestorSistemasOffice>; prefix: string; redis: Redis }) {
  const pipeline = redis.pipeline()
  for (const office of data) {
    const key = `${prefix}:office:${office.uuid}`
    pipeline.hmset(key, 'uuid', office.uuid, 'status', JSON.stringify(office.status))
    if (office.xNome) {
      pipeline.hset(key, 'xNome', office.xNome)
    } else {
      pipeline.hdel(key, 'xNome')
    }
    if (office.xFant) {
      pipeline.hset(key, 'xFant', office.xFant)
    } else {
      pipeline.hdel(key, 'xFant')
    }
    if (office.IE) {
      pipeline.hset(key, 'IE', office.IE)
    } else {
      pipeline.hdel(key, 'IE')
    }
    if (office.IEST) {
      pipeline.hset(key, 'IEST', office.IEST)
    } else {
      pipeline.hdel(key, 'IEST')
    }
    if (office.IM) {
      pipeline.hset(key, 'IM', office.IM)
    } else {
      pipeline.hdel(key, 'IM')
    }
    if (office.CNAE) {
      pipeline.hset(key, 'CNAE', office.CNAE)
    } else {
      pipeline.hdel(key, 'CNAE')
    }
    if (office.CRT) {
      pipeline.hset(key, 'CRT', office.CRT)
    } else {
      pipeline.hdel(key, 'CRT')
    }
    if (office.CNPJ) {
      pipeline.hset(key, 'CNPJ', office.CNPJ)
    } else {
      pipeline.hdel(key, 'CNPJ')
    }
    if (office.CPF) {
      pipeline.hset(key, 'CPF', office.CPF)
    } else {
      pipeline.hdel(key, 'CPF')
    }
    if (office.xLgr) {
      pipeline.hset(key, 'xLgr', office.xLgr)
    } else {
      pipeline.hdel(key, 'xLgr')
    }
    if (office.nro) {
      pipeline.hset(key, 'nro', office.nro)
    } else {
      pipeline.hdel(key, 'nro')
    }
    if (office.xCpl) {
      pipeline.hset(key, 'xCpl', office.xCpl)
    } else {
      pipeline.hdel(key, 'xCpl')
    }
    if (office.xBairro) {
      pipeline.hset(key, 'xBairro', office.xBairro)
    } else {
      pipeline.hdel(key, 'xBairro')
    }
    if (office.cMun) {
      pipeline.hset(key, 'cMun', office.cMun)
    } else {
      pipeline.hdel(key, 'cMun')
    }
    if (office.xMun) {
      pipeline.hset(key, 'xMun', office.xMun)
    } else {
      pipeline.hdel(key, 'xMun')
    }
    if (office.UF) {
      pipeline.hset(key, 'UF', office.UF)
    } else {
      pipeline.hdel(key, 'UF')
    }
    if (office.CEP) {
      pipeline.hset(key, 'CEP', office.CEP)
    } else {
      pipeline.hdel(key, 'CEP')
    }
    if (office.cPais) {
      pipeline.hset(key, 'cPais', office.cPais)
    } else {
      pipeline.hdel(key, 'cPais')
    }
    if (office.xPais) {
      pipeline.hset(key, 'xPais', office.xPais)
    } else {
      pipeline.hdel(key, 'xPais')
    }
    if (office.fone) {
      pipeline.hset(key, 'fone', office.fone)
    } else {
      pipeline.hdel(key, 'fone')
    }
    if (office.code) {
      pipeline.hset(key, 'code', office.code)
    } else {
      pipeline.hdel(key, 'code')
    }
    if (office.key_xml) {
      pipeline.hset(key, 'key_xml', office.key_xml)
    } else {
      pipeline.hdel(key, 'key_xml')
    }
    if (office.automation) {
      pipeline.hset(key, 'key_xml', JSON.stringify(office.automation))
    } else {
      pipeline.hdel(key, 'key_xml')
    }
    if (office.document) {
      pipeline.hset(key, 'document', office.document)
    } else {
      pipeline.hdel(key, 'document')
    }
  }

  return pipeline.exec()
}

export {
  json2office
}
