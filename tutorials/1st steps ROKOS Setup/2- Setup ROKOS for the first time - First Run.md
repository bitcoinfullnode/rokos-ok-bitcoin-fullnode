# Steps for first boot into your ROKOS OK Bitcoin Fullnode

* Raspberry Pi, zero, 2, 3

## ROKOS accounts

User: **root** / Password: **raspberry** (use for initial configuration and **advanced changes**)

User: **pi** / Password: **raspberry** (**Main account** to use your OS and cryptocurrencies)

# First Steps

### 1- Login, set connection, change root account password, restart

* Login with username: root  /Password: raspberry

* Type: dietpi-config

In this new menu you need to:

a) Set your network connection details. 

b) change the root user account password, and restart.

### 2- Login, set time zone/keyboard/language, change pi user password, expand the file system, restart

* Login with username: root and the password you just set.

* Type: raspi-config

In this new menu you need to:

a) Set your Time Zone/Keyboard/Language. 

b) Change your pi user password. 

c) Expand the file system, and restart.

### 3- Login, boot the desktop for the first time, start using your ROKOS

* Login with your normal user account: **pi**  and the password you just set for it.

* Type:  "**startx**"   to start the desktop for the first time.

## Welcome to the ROKOS Desktop

### Final steps / OK BTC and integrated Cryptocurrency Clients

**Note:** Make sure you change the "datadir" location on the **config** file of your cryptocurrency before starting the client.

**Note2:** We recommend to save the chains on external devices (USB/HDD/SSD) to prevent MicroSD card corruption.

## Start your Cryptocurrency wallet.

* Go to Menu > Internet and Click on your favorite Cryptocurrency Wallet

This will open the Wallet and start sync.

**Note:** Some Cryptocurrencies might take some days to sync, wallets are fully usable after being fully Synchronized.

# Congratulations!
### Your OK Bitcoin Fullnode is ready for use, Keep Rocking with your ROK OS.

#### If you need further support or want to say hi to the community you can join:
[![Discord Community](https://img.shields.io/badge/discord-bitcoinfullnode-blue.svg)](https://discord.io/bitcoin)
