const uniqueVal = Promise.resolve(Symbol('uniqueVal'))

const isPending = async p => {
  const first = await Promise.race([p, uniqueVal])

  return first === uniqueVal
}

module.exports = isPending
