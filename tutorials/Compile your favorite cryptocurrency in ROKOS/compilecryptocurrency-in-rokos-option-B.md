# Compile any cryptocurrency in your ROKOS OK Bitcoin Fullnode system (Option A)

To compile your favorite cryptocurrency into the ROKOS system 
you can follow next steps.

*For this example we are using "favoritecoin" as your currency name
Type all the commands in the terminal:

## 1- We clone the coin repository

git clone https://github.com/myfavoritecoin/favoritecoin 

cd favoritecoin

## We link the proper bd library

export CPATH="/usr/local/BerkeleyDB.4.8/include"

export LIBRARY_PATH="/usr/local/BerkeleyDB.4.8/lib"

## We compile the daemon and graphical client and install to system.

./autogen.sh

./configure --enable-upnp-default --with-gui

make

sudo make install

## We go back to home directory and clean/remove the favoritecoin github.

cd

sudo rm -r favoritecoin

# Congratulations!
### You just compiled your favorite cryptocurrency Client/Node into your ROKOS OK Bitcoin Fullnode system.

#### If you need further support or want to say hi to the community you can join:
[![Discord Community](https://img.shields.io/badge/discord-bitcoinfullnode-blue.svg)](https://discord.io/bitcoin)
