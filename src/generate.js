const forge = require('node-forge')
const { sha224 } = require('../lib/cryptoUtils')()
const _arc4 = require('../lib/arc4')
module.exports = ({
  prng = _arc4(),
  generateKeyPair = forge.pki.rsa.generateKeyPair
} = {}) => {
  // prime prng by desposing first 300
  for (let i = 1; i <= 300; i++) prng.next()

  const generateKeys = async ({ bits = 4096 } = {}) => {
    const { privateKey, publicKey } = await new Promise((res, rej) => {
      generateKeyPair(
        {
          prng: {
            getBytesSync: prng.nextBytesAsString
          },
          bits
          //  workers: 4
        },
        (err, key) => (err ? rej(err) : res(key))
      )
    })
    const pemPublic = forge.pki.publicKeyToPem(publicKey).replace('\r\n', '\n')
    return {
      privateKey: forge.pki.privateKeyToPem(privateKey).replace('\r\n', '\n'),
      publicKey: pemPublic,
      address: sha224(pemPublic)
    }
  }
  return { generateKeys }
}
