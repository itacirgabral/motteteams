const minimist = require('minimist');

const arg = process.argv.slice(2)
console.dir({ arg })

const conf = minimist(arg)
console.dir(conf)