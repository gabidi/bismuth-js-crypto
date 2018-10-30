/*!
* Crypto-JS v2.5.4	SHA256.js
* http://code.google.com/p/crypto-js/
* Copyright (c) 2009-2013, Jeff Mott. All rights reserved.
* http://code.google.com/p/crypto-js/wiki/License
*
* sha 224 Version by @EggPool https://BISafe.net
*/
const _Crypto = require('./cryptojs')
module.exports = ({ crypto = _Crypto() } = {}) => {
  // Shortcuts
  const { charenc, util } = crypto
  const { UTF8, Binary } = charenc

  // Constants
  const K = [
    0x428a2f98,
    0x71374491,
    0xb5c0fbcf,
    0xe9b5dba5,
    0x3956c25b,
    0x59f111f1,
    0x923f82a4,
    0xab1c5ed5,
    0xd807aa98,
    0x12835b01,
    0x243185be,
    0x550c7dc3,
    0x72be5d74,
    0x80deb1fe,
    0x9bdc06a7,
    0xc19bf174,
    0xe49b69c1,
    0xefbe4786,
    0x0fc19dc6,
    0x240ca1cc,
    0x2de92c6f,
    0x4a7484aa,
    0x5cb0a9dc,
    0x76f988da,
    0x983e5152,
    0xa831c66d,
    0xb00327c8,
    0xbf597fc7,
    0xc6e00bf3,
    0xd5a79147,
    0x06ca6351,
    0x14292967,
    0x27b70a85,
    0x2e1b2138,
    0x4d2c6dfc,
    0x53380d13,
    0x650a7354,
    0x766a0abb,
    0x81c2c92e,
    0x92722c85,
    0xa2bfe8a1,
    0xa81a664b,
    0xc24b8b70,
    0xc76c51a3,
    0xd192e819,
    0xd6990624,
    0xf40e3585,
    0x106aa070,
    0x19a4c116,
    0x1e376c08,
    0x2748774c,
    0x34b0bcb5,
    0x391c0cb3,
    0x4ed8aa4a,
    0x5b9cca4f,
    0x682e6ff3,
    0x748f82ee,
    0x78a5636f,
    0x84c87814,
    0x8cc70208,
    0x90befffa,
    0xa4506ceb,
    0xbef9a3f7,
    0xc67178f2
  ]

  // Public API
  const SHA224 = (C.SHA224 = function (message, options) {
    const digestbytes = util.wordsToBytes(SHA224._sha224(message))
    return options && options.asBytes
      ? digestbytes
      : options && options.asString
        ? Binary.bytesToString(digestbytes)
        : util.bytesToHex(digestbytes)
  })

  // The core
  SHA224._sha224 = function (message) {
    // Convert to byte array
    if (message.constructor === String) message = UTF8.stringToBytes(message)
    /* else, assume byte array already */

    let m = util.bytesToWords(message)

    let l = message.length * 8

    let H = [
      0xc1059ed8,
      0x367cd507,
      0x3070dd17,
      0xf70e5939,
      0xffc00b31,
      0x68581511,
      0x64f98fa7,
      0xbefa4fa4
    ]

    let w = []

    let a

    let b

    let c

    let d

    let e

    let f

    let g

    let h

    let i

    let j

    let t1

    let t2

    // Padding
    m[l >> 5] |= 0x80 << (24 - (l % 32))
    m[(((l + 64) >> 9) << 4) + 15] = l

    for (i = 0; i < m.length; i += 16) {
      a = H[0]
      b = H[1]
      c = H[2]
      d = H[3]
      e = H[4]
      f = H[5]
      g = H[6]
      h = H[7]

      for (j = 0; j < 64; j++) {
        if (j < 16) w[j] = m[j + i]
        else {
          let gamma0x = w[j - 15]

          let gamma1x = w[j - 2]

          let gamma0 =
              ((gamma0x << 25) | (gamma0x >>> 7)) ^
              ((gamma0x << 14) | (gamma0x >>> 18)) ^
              (gamma0x >>> 3)

          let gamma1 =
              ((gamma1x << 15) | (gamma1x >>> 17)) ^
              ((gamma1x << 13) | (gamma1x >>> 19)) ^
              (gamma1x >>> 10)

          w[j] = gamma0 + (w[j - 7] >>> 0) + gamma1 + (w[j - 16] >>> 0)
        }

        let ch = (e & f) ^ (~e & g)

        let maj = (a & b) ^ (a & c) ^ (b & c)

        let sigma0 =
            ((a << 30) | (a >>> 2)) ^
            ((a << 19) | (a >>> 13)) ^
            ((a << 10) | (a >>> 22))

        let sigma1 =
            ((e << 26) | (e >>> 6)) ^
            ((e << 21) | (e >>> 11)) ^
            ((e << 7) | (e >>> 25))

        t1 = (h >>> 0) + sigma1 + ch + K[j] + (w[j] >>> 0)
        t2 = sigma0 + maj

        h = g
        g = f
        f = e
        e = (d + t1) >>> 0
        d = c
        c = b
        b = a
        a = (t1 + t2) >>> 0
      }

      H[0] += a
      H[1] += b
      H[2] += c
      H[3] += d
      H[4] += e
      H[5] += f
      H[6] += g
      H[7] += h
    }
    H.pop() //
    return H
  }

  // Package private blocksize
  SHA224._blocksize = 16

  SHA224._digestsize = 32

  return SHA224
}
