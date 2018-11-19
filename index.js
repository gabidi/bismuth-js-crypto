const seed = require('./seed')
const generate = require('./generate')
const entropy = require('./entropy')
const browserEntropy = require('./browser_crypto')
module.exports = {
  seed,
  generate,
  entropy,
  browserEntropy
}
