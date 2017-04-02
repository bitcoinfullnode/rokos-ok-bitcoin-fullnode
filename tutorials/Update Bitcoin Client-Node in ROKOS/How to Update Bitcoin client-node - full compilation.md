#Compile the Bitcoin client into the ROKOS system

To compile the new Bitcoin client in the ROKOS type all the commands in the terminal:

## 1- Install dependency and clone Bitcoin github

sudo apt-get install libevent-dev

git clone -b 0.14 https://github.com/bitcoin/bitcoin 

## 2- Get in the Bitcoin directory and compile the client

cd bitcoin

export CPATH="/usr/local/BerkeleyDB.4.8/include"

export LIBRARY_PATH="/usr/local/BerkeleyDB.4.8/lib"

./autogen.sh

./configure --enable-upnp-default --with-gui

make

## 3- We install the compiled clients into the system

sudo make install

# Congratulations!
### You just compiled the latest Bitcoin Client-Node into your ROKOS OK Bitcoin Fullnode system.

#### If you need further support or want to say hi to the community you can join:
[![Discord Community](https://img.shields.io/badge/discord-bitcoinfullnode-blue.svg)](https://discord.io/bitcoin)
