/*!
* Random number generator with ArcFour PRNG
*
* NOTE: For best results, put code like
* <body onclick='SecureRandom.seedTime();' onkeypress='SecureRandom.seedTime();'>
* in your main HTML document.
*
* Copyright Tom Wu, bitaddress.org  BSD License.
* http://www-cs-students.stanford.edu/~tjw/jsbn/LICENSE

  @mod by gabidi@github to es6 module/isomorphic
*/
const sha256 = require('sha256')
const arc4 = require('./arc4')
module.exports = ({
  // An enytropy string to use when intiliazing an empty pool
  entropyStr = undefined,
  // Default to window crypto object, should be inject in node applications from crypto module
  crypto = (window && window.crypto) || undefined,
  // Pool size must be a multiple of 4 and greater than 32.
  // An array of bytes the size of the pool will be passed to init()
  poolSize = 256
} = {}) => {
  const pool = []
  const sr = {}

  // public method
  // ba: byte array
  sr.nextBytes = function (ba) {
    let i
    if (crypto && crypto.getRandomValues && Uint8Array) {
      try {
        const rvBytes = new Uint8Array(ba.length)
        crypto.getRandomValues(rvBytes)
        for (i = 0; i < ba.length; ++i) ba[i] = sr.getByte() ^ rvBytes[i]
        return
      } catch (e) {
        console.error(e)
      }
    }
    for (i = 0; i < ba.length; ++i) ba[i] = sr.getByte()
  }

  // --- static methods ---

  // Mix in the current time (w/milliseconds) into the pool
  // NOTE: this method should be called from body click/keypress event handlers to increase entropy
  sr.seedTime = function () {
    sr.seedInt(new Date().getTime())
  }

  sr.getByte = () => {
    if (sr.state == null) {
      sr.seedTime()
      sr.state = arc4() // Plug in your RNG constructor here
      sr.state.init(pool)
      sr.pptr = 0
    }
    // TODO: allow reseeding after first request
    return sr.state.next()
  }

  // Mix in a 32-bit integer into the pool
  sr.seedInt = function (x) {
    sr.seedInt8(x)
    sr.seedInt8(x >> 8)
    sr.seedInt8(x >> 16)
    sr.seedInt8(x >> 24)
  }

  // Mix in a 16-bit integer into the pool
  sr.seedInt16 = function (x) {
    sr.seedInt8(x)
    sr.seedInt8(x >> 8)
  }

  // Mix in a 8-bit integer into the pool
  sr.seedInt8 = function (x) {
    pool[sr.pptr++] ^= x & 255
    if (sr.pptr >= poolSize) sr.pptr -= poolSize
  }

  // HERE -> WRAP this in init function
  // Initialize the pool with junk if needed.
  const initPool = () => {
    sr.pptr = 0
    let t
    if (crypto && crypto.getRandomValues) {
      try {
        // Use webcrypto if available
        const ua = new Uint8Array(poolSize)
        crypto.getRandomValues(ua)
        for (t = 0; t < poolSize; ++t) pool[sr.pptr++] = ua[t]
      } catch (e) {
        console.error(e)
      }
    }
    while (sr.pptr < poolSize) {
      // extract some randomness from Math.random()
      t = Math.floor(65536 * Math.random())
      pool[sr.pptr++] = t >>> 8
      pool[sr.pptr++] = t & 255
    }
    sr.pptr = Math.floor(poolSize * Math.random())
    sr.seedTime()

    let entropyBytes = sha256(entropyStr, { asBytes: true })
    for (let i = 0; i < entropyBytes.length; i++) {
      sr.seedInt8(entropyBytes[i])
    }
  }
  if (!pool.length) {
    initPool()
  }
  return { ...sr, pool }
}
