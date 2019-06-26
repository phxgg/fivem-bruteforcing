import socket

class RCON:

    def __init__(self, ip, password, port=27960):
        self.ip = ip
        self.port = port
        self.password = password
        self.prefix = bytes([0xff, 0xff, 0xff, 0xff]) + b'rcon '
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    def send_command(self, command, response=True):

        cmd = f"{self.password} {command}".encode()
        query = self.prefix + cmd
        
        self.socket.connect((self.ip, self.port))
        self.socket.send(query)

        if response:
            self.socket.settimeout(3) # timeout seconds
            try:
                data = self.socket.recv(4096)
                return data
            except socket.timeout:
                return None
            except Exception:
                return 'conerr'

    def stop(self):
        self.socket.close()

if __name__ == "__main__":
    rcon = RCON('127.0.0.1', "secret")
    
    # If you don't need a response and 
    # don't want to wait 3 sec for the timeout
    
    rcon.send_command("say Hello, world!", response=False)
    
    # Regular response command.
    
    response = rcon.send_command("status")
    print(response)
   
