#!/bin/sh
echo "***************************************************************************"
echo "* This shell script will compact and reorganize the Horizon NRS database. *"
echo "* This process can take a long time.  Do not interrupt the script         *"
echo "* or shutdown the computer until it finishes.                             *"
echo "***************************************************************************"

java -Xmx768m -cp "classes:lib/*:conf" nxt.tools.CompactDatabase
exit $?
