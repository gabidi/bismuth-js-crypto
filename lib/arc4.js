module.exports = () => {
  let i = 0
  let j = 0
  let S = []

  // Initialize arcfour context from key, an array of ints, each from [0..255]
  const ARC4init = key => {
    let i, j, t
    for (i = 0; i < 256; ++i) S[i] = i
    j = 0
    for (i = 0; i < 256; ++i) {
      j = (j + S[i] + key[i % key.length]) & 255
      t = S[i]
      S[i] = S[j]
      S[j] = t
    }
    i = 0
    j = 0
  }
  const ARC4next = () => {
    let t
    i = (i + 1) & 255
    j = (j + S[i]) & 255
    t = S[i]
    S[i] = S[j]
    S[j] = t
    return S[(t + S[i]) & 255]
  }

  const nextBytesAsString = num => {
    const retBytes = []
    for (let i = 1; i <= num; i++) retBytes.push(ARC4next())
    return retBytes.join('')
  }
  return {
    init: ARC4init,
    next: ARC4next,
    nextBytesAsString,
    getBytesSync: nextBytesAsString
  }
}
