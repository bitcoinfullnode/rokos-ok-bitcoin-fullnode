#!/bin/sh

# WARNING: java still bypasses the tor proxy when sending DNS queries and
# this can reveal the fact that you are running Horizon, however blocks and
# transactions will be sent over tor only. Requires a tor proxy running
# at localhost:9050. Set nxt.shareMyAddress=false when using tor.

java -DsocksProxyHost=localhost -DsocksProxyPort=9050 -cp classes:lib/*:conf nxt.Nxt

