import _Crypto from "../lib/cryptojs";
import _SHA256 from "../lib/cryptojs.sha256";
import _SHA244 from "../lib/cryptojs.sha444";
import _SecureRandom from "../lib/securerandom";
import _seed from "../seed";
import _generate from "../generate";
import {JSEncrypt} from "../lib/jsencrypt";

const Crypto = _Crypto();
_SHA256({Crypto});
_SHA244({Crypto});
const SecureRandom = _SecureRandom({
    Crypto,
    entropyStr: "this is a random string for a test of entropy"
});

it("Should be able to create a proper seed", () => {
    const Seeder = _seed({
        Crypto,
        SecureRandom,
    });
    SecureRandom.seedTime();
    while (Seeder.isStillSeeding) {
        // Fake Random mouse
        Seeder.seed({
            XClient: Math.floor(Math.random() * 800),
            YClient: Math.floor(Math.random() * 600)
        })
    }
});


it("Should be able to generate keys from a seed", async() => {
    const generator = _generate({
        Crypto,
        SecureRandom,
        keySize : 4096,
    })
    const keys = await generator.generateKeys();
    console.log(keys);

});