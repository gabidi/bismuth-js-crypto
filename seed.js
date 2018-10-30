import _Crypto from "./lib/cryptojs";
import _SecureRandom from "./lib/securerandom";

module.exports = ({
                      Crypto = _Crypto(),
                      SecureRandom = _SecureRandom({Crypto}),
                  } = {}) => {


    // number of mouse movements to wait for
    const num = Crypto.util.randomBytes(12)[11];
    //return 200 + Math.floor(num);
    const seedLimit = 50 + Math.floor(num);

    let seedCount = 0; // counter
    let lastInputTime = new Date().getTime();
    let isStillSeeding = true;

    // const seedPoints = [];
    // const seederDependentWallets = ["singlewallet", "paperwallet", "bulkwallet", "vanitywallet", "splitwallet"];

    // seed function exists to wait for mouse movement to add more entropy before generating an address
    const seedFromMouseMovementEvent = ({clientX, clientY}) => {
        const timeStamp = new Date().getTime();
        // seeding is over now we generate and display the address
        if (seedCount === seedLimit) {
            seedCount++;
            seedingOver();
        }
        // seed mouse position X and Y when mouse movements are greater than 40ms apart.
        else if ((seedCount < seedLimit) && evt && (timeStamp - lastInputTime) > 40) {
            SecureRandom.seedTime();
            SecureRandom.seedInt16((clientX * clientY));
            // showPoint(clientX, clientY);
            seedCount++;
            lastInputTime = new Date().getTime();
            updateSeedStats();
        }
    }

    // seed function exists to wait for mouse movement to add more entropy before generating an address
    const seedFromKeyPress = (evt) => {
        // seeding is over now we generate and display the address
        if (seedCount === seedLimit) {
            seedCount++;
            seedingOver();
        }
        // seed key press character
        else if ((seedCount < seedLimit) && evt.which) {
            const timeStamp = new Date().getTime();
            // seed a bunch (minimum seedLimit) of times
            SecureRandom.seedTime();
            SecureRandom.seedInt8(evt.which);
            const keyPressTimeDiff = timeStamp - lastInputTime;
            SecureRandom.seedInt8(keyPressTimeDiff);
            seedCount++;
            lastInputTime = new Date().getTime();
            updateSeedStats();
        }
    }

    let poolHex,percentSeeded;

    /**
     * FIXME Move to VIEW
     */
    const updateSeedStats = function () {
        if (SecureRandom.poolCopyOnInit != null) {
            poolHex = Crypto.util.bytesToHex(SecureRandom.poolCopyOnInit);
            // document.getElementById("seedpool").innerHTML = poolHex;
            //document.getElementById("seedpooldisplay").innerHTML = poolHex;
        }
        else {
            poolHex = Crypto.util.bytesToHex(SecureRandom.pool);
            // document.getElementById("seedpool").innerHTML = poolHex;
            //document.getElementById("seedpooldisplay").innerHTML = poolHex;
        }
        percentSeeded = Math.round((seedCount / seedLimit) * 100) + "%";
        // document.getElementById("mousemovelimit").innerHTML = percentSeeded;
        /*for (var wIndex in ninja.seeder.seederDependentWallets) {
            document.getElementById(ninja.seeder.seederDependentWallets[wIndex]).innerHTML = percentSeeded;
        }*/
    }

/*
    const showPoint = function (x, y) {
        const div = document.createElement("div");
        const num = Math.floor((Math.random() * 6));
        div.setAttribute("class", "seedpoint" + num);
        div.style.top = y + "px";
        div.style.left = x + "px";
        document.body.appendChild(div);
        ninja.seeder.seedPoints.push(div);
    };
*/

/*    const removePoints = function () {
        for (let i = 0; i < ninja.seeder.seedPoints.length; i++) {
            document.body.removeChild(ninja.seeder.seedPoints[i]);
        }
        ninja.seeder.seedPoints = [];
    };*/

    const seedingOver = () => {
        isStillSeeding = false;

        // run sync unit tests
        //ninja.status.unitTests();
        // open selected tab
      /*  const walletType = null; //ninja.tab.whichIsOpen();
        if (walletType == null) {
            ninja.tab.select("singlewallet");
        } else {
            ninja.tab.select(walletType)
        }
        document.getElementById("generate").style.display = "none";
        document.getElementById("generated").style.display = "block";
        // update labels for dependent wallets
        const culture = (ninja.getQueryString()["culture"] == null ? "en" : ninja.getQueryString()["culture"]);
        //ninja.translator.translate(culture);
        removePoints();*/
    }

    return {
        seedFromMouseMovementEvent,
        seedFromKeyPress,
        isStillSeeding,
        poolHex,
        percentSeeded
    }
}