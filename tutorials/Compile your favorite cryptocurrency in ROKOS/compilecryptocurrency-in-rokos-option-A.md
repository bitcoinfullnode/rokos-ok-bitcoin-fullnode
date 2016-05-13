# Compile any cryptocurrency in your ROKOS OK Bitcoin Fullnode system (Option A)

To compile your favorite cryptocurrency into the ROKOS system 
you can follow next steps.

*For this example we are using "favoritecoin" as your currency name
Type all the commands in the terminal:

## 1- We clone the coin repository

git clone https://github.com/myfavoritecoin/favoritecoin 

cd favoritecoin

cd src

## 2- We link the proper bd library

export CPATH="/usr/local/BerkeleyDB.4.8/include"

export LIBRARY_PATH="/usr/local/BerkeleyDB.4.8/lib"

## 3- We compile the daemon, decrease its size and copy to system folders.(install)

make -f makefile.unix USE_UPNP=-

strip favoritecoind

sudo cp favoritecoind /usr/local/bin

## 4- We compile the graphical client, decrease its size and copy to system.

cd ..

qmake

make

strip favoritecoin-qt

sudo cp favoritecoin-qt /usr/local/bin

## 5- We go back to home directory and clean/remove the "favoritecoin" github.

cd

sudo rm -r favoritecoin

# Congratulations!
### You just compiled your favorite cryptocurrency Client/Node into your ROKOS OK Bitcoin Fullnode system.

#### If you need further support or want to say hi to the community you can join:
[![Slack Community](https://img.shields.io/badge/slack-okrokos-blue.svg)](https://okcash.herokuapp.com)
