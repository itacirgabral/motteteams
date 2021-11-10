type Bread = { [key: string]: string; }

const stream2bread = function stream2bread ({ log }: { log: Array<string>}): Bread {
  const keys = log.filter((_el, i) => i % 2 === 0)
  const values = log.filter((_el, i) => i % 2 !== 0)

  const bread: Bread = {}
  for(let i = 0; i < keys.length; i++) {
    bread[keys[i] || ''] = values[i] || ''
  }

  return bread
}

export {
  stream2bread,
  Bread
}
