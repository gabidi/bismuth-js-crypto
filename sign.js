const forge = require('node-forge')
const getSignedTxnBase64 = ({
  formatedTxnString,
  pemPublicKey,
  pemPrivateKey
}) => {
  const { sign } = forge.pki.privateKeyFromPem(pemPrivateKey)
  const { verify } = forge.pki.publicKeyFromPem(pemPublicKey)
  const md = forge.md.sha1.create()
  md.update(formatedTxnString, 'utf8')
  const signature = sign(md)
  if (!verify(md.digest().bytes(), signature, 'RSASSA-PKCS1-V1_5')) {
    throw new Error('Txn failed verification')
  }
  return forge.util.encode64(signature)
}
const formatTxn = ({
  timestamp,
  address,
  recipient,
  amount,
  openfield,
  operation
}) =>
  `(${[
    timestamp.toFixed(2),
    address,
    recipient,
    parseFloat(amount).toFixed(8),
    operation,
    openfield
  ]
    .map(x => `'${x}'`)
    .join(', ')})`
module.exports = { formatTxn, getSignedTxnBase64 }
