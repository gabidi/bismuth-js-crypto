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
    const pemPublic = forge.pki.publicKeyToPem(publicKey).replace(/\r\n/g, '\n')
    return {
      privateKey: forge.pki.privateKeyToPem(privateKey).replace(/\r\n/g, '\n'),
      publicKey: pemPublic,
      address: sha224(pemPublic)
    }
  }
  const generateKeysInSteps = async ({ bits = 4096, e = 0x10001 } = {}) => {
    // generate an RSA key pair in steps that attempt to run for a specified period
    // of time on the main JS thread
    const state = forge.pki.rsa.createKeyPairGenerationState(bits, e, { prng })
    const rsaKeysPromise = new Promise((res, rej) => {
      const step = () => {
        // run for 100 ms
        if (!forge.pki.rsa.stepKeyPairGenerationState(state, 100)) {
          setTimeout(step, 1)
        } else {
          clearTimeout(rsaStepTimeout)
          const { publicKey, privateKey } = state.keys
          const pemPublic = forge.pki.publicKeyToPem(publicKey).replace(/\r\n/g, '\n')
          res({
            privateKey: forge.pki.privateKeyToPem(privateKey).replace(/\r\n/g, '\n'),
            publicKey: pemPublic,
            address: sha224(pemPublic)
          })
        }
      }
      // turn on progress indicator, schedule generation to run
      const rsaStepTimeout = setTimeout(step)
    })
    return rsaKeysPromise
  }
  return { generateKeys, generateKeysInSteps }
}
