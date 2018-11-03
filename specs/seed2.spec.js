const crypto = require('crypto')
const _secureRandom = require('../lib/secureRandom')
const _seed = require('../seed')
const bip39 = require('bip39')
const sha256 = require('sha256')
const _arc4 = require('../lib/arc4')
const forge = require('node-forge')
const { expect } = require('chai')
const { spy } = require('sinon')
it('BIP 39 should generates the same seed/12 word seed result as python', async () => {
  [
    {
      index: 0,
      entropy: '3b13f9cb9ddea905883fa8d3ff7b1247',
      twelveWords:
        'deposit panther indicate desert tunnel lizard can vital stadium wink setup moment'
    },
    {
      index: 1,
      entropy: 'e1f9700dee95018fa20d47164fb5ed41',
      twelveWords:
        'tiger slide address tag exotic sick market pottery bind laundry kitten lonely'
    },
    {
      index: 2,
      entropy: 'ca1a79386919b745cefc0e50dec6afa3',
      twelveWords:
        'skate stable evoke split opinion pepper desk limb express wage program elder'
    }
  ].forEach(({ entropy, twelveWords }) => {
    expect(bip39.entropyToMnemonic(entropy)).to.be.equal(twelveWords)
    expect(bip39.mnemonicToEntropy(twelveWords).toString('hex')).to.be.equal(
      entropy
    )
  })
})
it('Should be able to generate entropy using user data and generate mixed BIP39 mnemonic', async () => {
  const secureRandom = _secureRandom({
    entropyStr: 'test',
    crypto
  })
  const seeder = _seed({
    secureRandom
  })
  secureRandom.seedTime()
  while (!seeder.seedingDone()) {
    // Fake Random mouse
    seeder.seedFromMouseMovementEvent({
      XClient: Math.floor(Math.random() * 800),
      YClient: Math.floor(Math.random() * 600)
    })
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  expect(secureRandom.pool.length).to.be.at.least(256)
  const seed = sha256(secureRandom.pool).slice(0, 32)
  expect(seed.length).to.be.equal(32)
  const twelveWords = bip39.entropyToMnemonic(seed)
  expect(twelveWords.split(' ').length).to.be.equal(12)
  return twelveWords
}).timeout(30000)
it('Should be able to take an mnemonic seed and make an RSA key and BIS address out of it', async () => {
  const mnemonic = {
    index: 0,
    entropy: '3b13f9cb9ddea905883fa8d3ff7b1247',
    twelvewords:
      'deposit panther indicate desert tunnel lizard can vital stadium wink setup moment'
  }
  //  mix with user passphrase /salet
  const arc4Seed = bip39.mnemonicToSeed(mnemonic + ' mypassphrase')
  //  feed RC4 as generator function to RSA
  const rng = _arc4()
  rng.init(arc4Seed)
  // dispose first 300 bytes
  for (let i = 1; i <= 300; i++) {
    expect(rng.next()).to.be.an('Number')
  }
  // Set up spy on arc4 next to make sure it gets called by Rsa via nextBytes interface
  const arc4Spy = spy(rng, 'nextBytesAsString')
  // Pass it to RSA
  const { privateKey, publicKey } = await new Promise((res, rej) => {
    forge.pki.rsa.generateKeyPair(
      {
        prng: {
          getBytesSync: rng.nextBytesAsString
        },
        bits: 4096,
        workers: 4
      },
      (err, key) => (err ? rej(err) : res(key))
    )
  })
  expect(arc4Spy.called).to.be.true
  expect(forge.pki.privateKeyToPem(privateKey)).to.be.contain(
    'BEGIN PRIVATE KEY'
  )
  expect(forge.pki.publicKeyToPem(publicKey)).to.be.contain('BEGIN PUBLIC KEY')
  const bisAddress = sha224(forge.pki.publicKeyToPem(publicKey))
  return bisAddress
}).timeout(360000)
