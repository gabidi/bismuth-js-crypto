/*!
* Random number generator with ArcFour PRNG
*
* NOTE: For best results, put code like
* <body onclick='SecureRandom.seedTime();' onkeypress='SecureRandom.seedTime();'>
* in your main HTML document.
*
* Copyright Tom Wu, bitaddress.org  BSD License.
* http://www-cs-students.stanford.edu/~tjw/jsbn/LICENSE
*/
const _Crypto = require('./cryptojs')

module.exports = ({
  Crypto = _Crypto(),
  entropyStr = undefined,
  crypto = window.crypto
} = {}) => {
  // Constructor function of Global SecureRandom object
  const sr = {}

  // Properties
  /* sr.state;
     sr.pool;
     sr.pptr;
*/
  // Pool size must be a multiple of 4 and greater than 32.
  // An array of bytes the size of the pool will be passed to init()
  sr.poolSize = 256

  // --- object methods ---

  // public method
  // ba: byte array
  sr.nextBytes = function (ba) {
    let i
    if (crypto && crypto.getRandomValues && window.Uint8Array) {
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
    // WTF ? Circular Dep ?
    /* if (ninja.seeder.isStillSeeding) {
            alert("Premature initialisation of the random generator. Something is really wrong, do not generate wallets.");
            return NaN;
        } */

    if (sr.state == null) {
      sr.seedTime()
      sr.state = sr.ArcFour() // Plug in your RNG constructor here
      sr.state.init(sr.pool)
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
    sr.pool[sr.pptr++] ^= x & 255
    if (sr.pptr >= sr.poolSize) sr.pptr -= sr.poolSize
  }

  // Arcfour is a PRNG
  sr.ArcFour = function () {
    function Arcfour () {
      this.i = 0
      this.j = 0
      this.S = []
    }

    // Initialize arcfour context from key, an array of ints, each from [0..255]
    function ARC4init (key) {
      let i, j, t
      for (i = 0; i < 256; ++i) this.S[i] = i
      j = 0
      for (i = 0; i < 256; ++i) {
        j = (j + this.S[i] + key[i % key.length]) & 255
        t = this.S[i]
        this.S[i] = this.S[j]
        this.S[j] = t
      }
      this.i = 0
      this.j = 0
    }

    function ARC4next () {
      let t
      this.i = (this.i + 1) & 255
      this.j = (this.j + this.S[this.i]) & 255
      t = this.S[this.i]
      this.S[this.i] = this.S[this.j]
      this.S[this.j] = t
      return this.S[(t + this.S[this.i]) & 255]
    }

    Arcfour.prototype.init = ARC4init
    Arcfour.prototype.next = ARC4next

    return new Arcfour()
  }

  // Initialize the pool with junk if needed.
  if (sr.pool === null) {
    sr.pool = []
    sr.pptr = 0
    let t
    if (crypto && crypto.getRandomValues) {
      try {
        // Use webcrypto if available
        const ua = new Uint8Array(sr.poolSize)
        crypto.getRandomValues(ua)
        for (t = 0; t < sr.poolSize; ++t) sr.pool[sr.pptr++] = ua[t]
      } catch (e) {
        console.error(e)
      }
    }
    while (sr.pptr < sr.poolSize) {
      // extract some randomness from Math.random()
      t = Math.floor(65536 * Math.random())
      sr.pool[sr.pptr++] = t >>> 8
      sr.pool[sr.pptr++] = t & 255
    }
    sr.pptr = Math.floor(sr.poolSize * Math.random())
    sr.seedTime()

    let entropyBytes = Crypto.SHA256(entropyStr, { asBytes: true })
    for (let i = 0; i < entropyBytes.length; i++) {
      sr.seedInt8(entropyBytes[i])
    }
  }
  return sr
}
