module.export = (entropyStr = '') => {
  // screen size and color depth: ~4.8 to ~5.4 bits
  entropyStr +=
    window.screen.height * window.screen.width * window.screen.colorDepth
  entropyStr +=
    window.screen.availHeight *
    window.screen.availWidth *
    window.screen.pixelDepth
  // time zone offset: ~4 bits
  const dateObj = new Date()
  entropyStr += dateObj.getTimezoneOffset()
  // user agent: ~8.3 to ~11.6 bits
  entropyStr += navigator.userAgent
  // browser plugin details: ~16.2 to ~21.8 bits
  let pluginsStr = ''
  for (let i = 0; i < navigator.plugins.length; i++) {
    pluginsStr +=
      navigator.plugins[i].name +
      ' ' +
      navigator.plugins[i].filename +
      ' ' +
      navigator.plugins[i].description +
      ' ' +
      navigator.plugins[i].version +
      ', '
  }
  let mimeTypesStr = ''
  for (let i = 0; i < navigator.mimeTypes.length; i++) {
    mimeTypesStr +=
      navigator.mimeTypes[i].description +
      ' ' +
      navigator.mimeTypes[i].type +
      ' ' +
      navigator.mimeTypes[i].suffixes +
      ', '
  }
  entropyStr += pluginsStr + mimeTypesStr
  // cookies and storage: 1 bit
  entropyStr +=
    navigator.cookieEnabled + typeof sessionStorage + typeof localStorage
  // language: ~7 bit
  entropyStr += navigator.language
  // history: ~2 bit
  entropyStr += window.history.length
  // location
  entropyStr += window.location
  return entropyStr
}
