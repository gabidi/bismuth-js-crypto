const seed = require('./seed')
const generate = require('./generate')
const browserEntropy = require('./browser_crypto')
module.exports = {
  seed,
  generate,
  browserEntropy
}
