const sha256 = require('sha256')
const _secureRandom = require('./lib/secureRandom')
const { util } = require('./lib/cryptoUtils')()
module.exports = ({ secureRandom = _secureRandom() } = {}) => {
  // number of mouse movements to wait for
  const num = util.randomBytes(12)[11]
  // return 200 + Math.floor(num);
  const seedLimit = 50 + Math.floor(num)

  secureRandom.seedTime()

  let seedCount = 0 // counter
  let lastInputTime = new Date().getTime()
  let isStillSeeding = true
  // seed function exists to wait for mouse movement to add more entropy before generating an address
  const seedFromMouseMovementEvent = ({ clientX, clientY }) => {
    const timeStamp = new Date().getTime()
    // seeding is over now we generate and display the address
    if (seedCount === seedLimit) {
      seedCount++
      _seedingOver()
    }
    // seed mouse position X and Y when mouse movements are greater than 40ms apart.
    else if (seedCount < seedLimit && timeStamp - lastInputTime > 40) {
      secureRandom.seedTime()
      secureRandom.seedInt16(clientX * clientY)
      seedCount++
      lastInputTime = new Date().getTime()
      updateSeedStats()
    }
  }

  // seed function exists to wait for mouse movement to add more entropy before generating an address
  const seedFromKeyPress = evt => {
    // seeding is over now we generate and display the address
    if (seedCount === seedLimit) {
      seedCount++
      _seedingOver()
    }
    // seed key press character
    else if (seedCount < seedLimit && evt.which) {
      const timeStamp = new Date().getTime()
      // seed a bunch (minimum seedLimit) of times
      secureRandom.seedTime()
      secureRandom.seedInt8(evt.which)
      const keyPressTimeDiff = timeStamp - lastInputTime
      secureRandom.seedInt8(keyPressTimeDiff)
      seedCount++
      lastInputTime = new Date().getTime()
      updateSeedStats()
    }
  }

  let poolHex, percentSeeded

  const updateSeedStats = function () {
    if (secureRandom.poolCopyOnInit != null) {
      poolHex = util.bytesToHex(secureRandom.poolCopyOnInit)
    } else {
      poolHex = util.bytesToHex(secureRandom.pool)
    }
    percentSeeded = Math.round((seedCount / seedLimit) * 100) + '%'
  }

  const _seedingOver = () => {
    isStillSeeding = false
  }
  const seedingDone = () => !isStillSeeding
  const getSeedingPercent = () => percentSeeded
  const getPoolHex = () => poolHex
  const getPoolSha256 = () => seedingDone() && sha256(secureRandom.pool)
  return {
    seedFromMouseMovementEvent,
    seedFromKeyPress,
    seedingDone,
    getPoolHex,
    getSeedingPercent,
    getPoolSha256
  }
}
