const bip39 = require('bip39')
const _arc4 = require('../lib/arc4')
module.exports = {
  makeMnemonicFromEntropySha (entropySha) {
    return bip39.entropyToMnemonic(entropySha.slice(32))
  },
  makeSeededPrngFromMneomic (twelveWords, passphrase = null) {
    //  mix with user passphrase /salet
    const mnemonic = twelveWords + passphrase ? ` ${passphrase}` : ''
    const arc4Seed = bip39.mnemonicToSeed(mnemonic)
    //  feed RC4 as generator function to RSA
    const prng = _arc4()
    prng.init(arc4Seed)
    return prng
  }
}
