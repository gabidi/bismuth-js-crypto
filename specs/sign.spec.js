const forge = require('node-forge')
const { expect } = require('chai')
const testVectors1 = require('./test_vectors.json')
const testVectors2 = require('./test_vectors2.json')
const testWallet = require('./testWallet.json')
const { getSignedTxnBase64, formatTxn } = require('../sign')
it('Should be able to read a public and private key from der (pem format)', async () => {
  const { PrivateKey, PublicKey } = testWallet

  /*
   * @param privateKey format:
    n the modulus.
 *  e the public exponent.
 *  d the private exponent ((inverse of e) mod n).
 *  p the first prime.
 *  q the second prime.
 *  dP exponent1 (d mod (p-1)).
 *  dQ exponent2 (d mod (q-1)).
 *  qInv ((inverse of q) mod p) */
  const privateKey = forge.pki.privateKeyFromPem(PrivateKey)
  expect(privateKey.n).to.be.an('Object')
  expect(privateKey.e).to.be.an('Object')
  expect(privateKey.d).to.be.an('Object')
  expect(privateKey.p).to.be.an('Object')
  expect(privateKey.decrypt).to.be.a('Function')
  expect(privateKey.sign).to.be.a('Function')
  // We can also feed the private Key nto rsa to get sign and decrypt functions
  const rsa = forge.pki.rsa
  const { sign, decrypt } = rsa.setPrivateKey(privateKey)
  expect(sign).to.be.a('function')
  expect(decrypt).to.be.a('function')
  const { encrypt, verify } = forge.pki.publicKeyFromPem(PublicKey)
  expect(verify).to.be.a('function')
  expect(encrypt).to.be.a('function')
})
it('Should be able to format and stringify a txn', async () => {
  [...testVectors1, ...testVectors2].forEach(
    ({
      tx_to_sign: {
        timestamp,
        address,
        recipient,
        amount,
        operation,
        openfield
      },
      as_string
    }) => {
      expect(
        formatTxn({
          timestamp,
          address,
          recipient,
          amount,
          operation,
          openfield
        })
      ).to.equal(as_string)
    }
  )
})
it('Should be able to sign a transcation string and check its signature', async () => {
  const { PrivateKey, PublicKey } = testWallet;
  [...testVectors1, ...testVectors2].forEach(
    ({
      tx_to_sign: {
        timestamp,
        address,
        recipient,
        amount,
        operation,
        openfield
      },
      signature_b64: signatureB64,
      pubkey_b64: publicKeyB64
    }) => {
      const base64SignedTxn = getSignedTxnBase64({
        formatedTxnString: formatTxn({
          timestamp,
          address,
          recipient,
          amount,
          operation,
          openfield
        }),
        pemPublicKey: PublicKey,
        pemPrivateKey: PrivateKey
      })
      expect(signatureB64).to.equal(base64SignedTxn)
      expect(Buffer.from(PublicKey).toString('base64')).to.equal(publicKeyB64)
    }
  )
}).timeout(170000)
