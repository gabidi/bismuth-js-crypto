const _Crypto = require('../lib/cryptojs')
const _SHA256 = require('../lib/cryptojs.sha256')
const _SHA244 = require('../lib/cryptojs.sha224')
const _SecureRandom = require('../lib/secureRandom')
const _seed = require('../seed')
const _generate = require('../generate')
const { JSEncrypt } = require('../lib/jsencrypt/src/')

const Crypto = _Crypto()
_SHA256({ Crypto })
_SHA244({ Crypto })
const SecureRandom = _SecureRandom({
  Crypto,
  entropyStr: 'this is a random string for a test of entropy'
})

it('Should be able to create a proper seed', () => {
  const Seeder = _seed({
    Crypto,
    SecureRandom
  })
  SecureRandom.seedTime()
  while (Seeder.isStillSeeding) {
    // Fake Random mouse
    Seeder.seed({
      XClient: Math.floor(Math.random() * 800),
      YClient: Math.floor(Math.random() * 600)
    })
  }
  console.log('seding done')
})

xit('Should be able to generate keys from a seed', async () => {
  const generator = _generate({
    Crypto,
    SecureRandom,
    keySize: 4096
  })
  const keys = await generator.generateKeys()
  console.log(keys)
})
