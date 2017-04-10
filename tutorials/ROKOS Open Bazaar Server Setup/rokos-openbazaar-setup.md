# ROKOS OK Bitcoin Fullnode

# OpenBazaar Setup

## Set a custom username and password

Open the `ob.cfg` file in your text editor of choice (`nano` comes preinstalled on Raspbian):
```
nano ob.cfg
```

Then uncomment and set the `USERNAME` and `PASSWORD` variables to values of your choice, like so.

Before changes:
```
#USERNAME = username
#PASSWORD = password
```
After changes:
```
USERNAME = joebloggs
PASSWORD = aVeryLong&C()mpl1cat3d5tringThatW1llBeVeryHardToGue$5
```

## Run the server
```
python openbazaard.py start -d -a 0.0.0.0

```

## Stop the server

It's preferred that this is done from the client UI:

"Account Icon" >> Settings >> Advanced >> Shut Down the Server

_______________________

# Step Four - Configure the client to communicate with the server

## Run the client on your desktop / laptop computer.

https://github.com/OpenBazaar/OpenBazaar-Client

These instructions do not cover the client setup, perhaps they will later.

## Let the loading / connection time out.

It's trying to connect to a "local" server.  And this server is not local, it's on a separate computer ( your raspberry pi ).  It should be on the same network though.

## Remember the IP address you used for SSH?

Earlier, you SSH'ed into the raspberry pi.  To do this you needed it's IP address, you're going to need that now to setup the connection from the client.

## Change the server connection config to meet your needs.

Now that the localhost connection has timed out.

* Click the avatar at the top right of the app.
* Click `Settings`
* Click `Advanced`
* Click the `Change` button in the Server Settings row.
* Set the IP to match that of your Raspberry Pi, and the username and password fields to match the values you entered into your `ob.cfg` file.
* Click `Save Changes`

_______________________

# Step Five - Configuring a static IP

You're probably going to want the Pi to maintain a static IP address on your home network.  This will help with:

* SSHing into the pi in the future
* Connecting to the Open Bazaar Server from your client running on another computer
* Port forwarding settings on your router

To set a custom IP, simply open `/etc/dhcpcd.conf` with the command `sudo nano /etc/dhcpcd.conf`.  Then add the following code to the bottom of the file:

```
# Static IP
interface eth0
static ip_address=192.168.1.7/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1
```

I used `192.168.1.7` because it happened to be the IP address that my Pi was already assigned.  I suggest you change it to match your assigned IP address.  So if your Pi is currently `192.168.2.13`, then your code should be:

```
# Static IP
interface eth0
static ip_address=192.168.2.13/24
static routers=192.168.2.1
static domain_name_servers=192.168.2.1
```

_______________________