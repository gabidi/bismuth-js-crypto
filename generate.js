const _Crypto = require('./lib/cryptojs')
const _SecureRandom = require('./lib/secureRandom')
const { JSEncrypt } = require('./lib/jsencrypt/src/')
module.exports = ({
  Crypto = _Crypto(),
  secureRandom = _SecureRandom({ Crypto }),
  keySize = 4096,
  crypt = new JSEncrypt({
    default_key_size: keySize,
    secureRandom: secureRandom
  })
} = {}) => {
  const generateKeys = async () => {
    let dt = new Date()
    let time = -dt.getTime()

    return new Promise((resolve, reject) => {
      crypt.getKey(() => {
        dt = new Date()
        time += dt.getTime()
        const privKey = crypt.getPrivateKey()
        const pubKey = crypt.getPublicKey()
        const address = Crypto.SHA224(crypt.getPublicKey()) // , { asBytes: true }
        return resolve({ address, pubKey, privKey, genTime: time })
      })
    })
  }
  return { generateKeys }
}
