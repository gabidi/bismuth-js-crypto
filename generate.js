import _Crypto from "./lib/cryptojs";
import _SecureRandom from "./lib/securerandom";

module.exports = ({
                      Crypto = _Crypto(),
                      SecureRandom = _SecureRandom({Crypto}),
                      keySize = 4096,
                      crypt = new JSEncrypt({default_key_size: keySize}),
                  } = {}) => {
    const generateKeys = async () => {
        // TODO: hide button and show spinner
        let dt = new Date();
        let time = -(dt.getTime());

        //$('#time-report').text('.');
        return await new Promise(res, rej => {
            crypt.getKey(function () {
                dt = new Date();
                time += (dt.getTime());
                const privKey = crypt.getPrivateKey()
                const pubKey = crypt.getPublicKey();
                const address = Crypto.SHA224(crypt.getPublicKey()); // , { asBytes: true }
                return resolve({address, pubKey, privKey, genTime: time})

            });

        });
    }
    return {generateKeys}
}