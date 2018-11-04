const crypto = require('crypto')
const _secureRandom = require('../lib/secureRandom')
const _seed = require('../seed')
const _entropy = require('../entropy')
const _generate = require('../generate')
const bip39 = require('bip39')
const _arc4 = require('../lib/arc4')
const forge = require('node-forge')
const { expect } = require('chai')
const { spy } = require('sinon')
xit('BIP 39 should generates the same seed/12 word seed result as python', async () => {
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
xit('Should be able to generate entropy using user data', async () => {
  const secureRandom = _secureRandom({
    entropyStr: 'test',
    crypto
  })
  const entropy = _entropy({
    secureRandom
  })
  while (!entropy.seedingDone()) {
    // Fake Random mouse
    entropy.seedFromMouseMovementEvent({
      XClient: Math.floor(Math.random() * 800),
      YClient: Math.floor(Math.random() * 600)
    })
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  expect(secureRandom.pool.length).to.be.at.least(256)
  const entropySha = entropy.getPoolSha256()
  expect(entropySha).to.be.a('String')
  expect(entropySha.length).to.be.equal(64)
  console.log(entropySha)
}).timeout(30000)

it('Should be able to make a mnemonic seed from entropy', async () => {
  // HERE make seed.js FIXE take slice32from sha
  const entropySha =
    'd4f5e041a28182e9dbd810fee3375cfbd89bd137dbf95adb68087cf3198b780a'
  const makeMnemonicFromEntropySha = entropySha => {
    const twelveWords = bip39.entropyToMnemonic(entropySha.slice(32))
    return twelveWords
  }
  const makeSeededPrngFromMneomic = (twelveWords, passphrase = null) => {
    //  mix with user passphrase /salet
    const mnemonic = twelveWords + passphrase ? ` ${passphrase}` : ''
    const arc4Seed = bip39.mnemonicToSeed(mnemonic)
    //  feed RC4 as generator function to RSA
    const prng = _arc4()
    prng.init(arc4Seed)
    return prng
  }
  const twelveWords = makeMnemonicFromEntropySha(entropySha)
  expect(twelveWords.split(' ').length).to.be.equal(12)
  const prng = makeSeededPrngFromMneomic(twelveWords, 'mypass')
  expect(prng.next()).to.be.a('Number')
  expect(prng.nextBytesAsString(10).length).to.be.equal(10)
})
xit('Should be able to take an mnemonic seed and make an RSA key and BIS address out of it', async () => {
  const mnemonic = {
    index: 0,
    entropy: '3b13f9cb9ddea905883fa8d3ff7b1247',
    twelvewords:
      'deposit panther indicate desert tunnel lizard can vital stadium wink setup moment'
  }

  /// CHANGE THIS TO SEED fns
  //  mix with user passphrase /salet
  const arc4Seed = bip39.mnemonicToSeed(mnemonic + ' mypassphrase')
  //  feed RC4 as generator function to RSA
  const prng = _arc4()
  prng.init(arc4Seed)

  const arc4Spy = spy(prng, 'nextBytesAsString')
  const arc4SpyNext = spy(prng, 'next')
  const generateKeyPair = forge.pki.rsa.generateKeyPair
  const rsaSpy = spy(generateKeyPair)
  const { generateKeys } = _generate({
    prng,
    generateKeyPair
  })
  // prng should be primed on init
  expect(arc4SpyNext.callCount).to.equal(300)
  const { publicKey, privateKey, address } = await generateKeys({
    bits: 4096
  })
  expect(rsaSpy.called).to.be.true
  expect(arc4Spy.called).to.be.true
  expect(privateKey).to.contain('BEGIN RSA PRIVATE KEY')
  expect(publicKey).to.contain('BEGIN PUBLIC KEY')
  expect(address.length).to.equal(56)
  return address
}).timeout(360000)
