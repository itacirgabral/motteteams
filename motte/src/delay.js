const delay = dt => new Promise(resolve => {
  setTimeout(() => {
    resolve()
  }, dt)
})

module.exports = delay
