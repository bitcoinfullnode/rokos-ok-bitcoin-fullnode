Running the Horizon software:

Dependencies: Java 8 or later needs to be installed first. Only the Oracle JVM
has been tested and supported.

There is no installation needed. Unpack the hz-client.zip package and open a
shell in the resulting HZ directory. Execute the run.sh script if using Linux,
or run.bat if using Windows. This will start a java server process, which will
begin logging its activities to the console. The initialization takes a few
seconds. When it is ready, you should see the message "Horizon server started
successfully". Open a browser, without stopping the java process, and go to
http://localhost:7776 , where the HZ UI should now be available. To stop the
application, type Ctrl-C inside the console window.



Customization:

There are many configuration parameters that could be changed, but the defaults
are set so that normally you can run the program immediately after unpacking,
without any additional configuration. To see what options are there, open the
conf/nhz-default.properties file. All possible settings are listed, with
detailed explanation. If you decide to change any setting, do not edit
nhz-default.properties directly, but create a new conf/nhz.properties file
and only add to it the properties that need to be different from the default
values. You do not need to delete the defaults from nhz-default.properties, the
settings in nhz.properties override those in nhz-default.properties. This way,
when upgrading the software, you can safely overwrite nhz-default.properties
with the updated file from the new package, while your customizations remain
safe in the nhz.properties file.


How to contribute?

There are many ways to contribute to Horizon. Here are some examples:

 * create pull requests
 * review pull requests
 * review existing code
 * create issues (aka feature ideas, bug reports, documentation etc.)
 * answer issues


Technical details:

Horizon is a NXT clone. The software bases on the amazing work of the NXT developers.
The Horizon software is a client-server application. It consists of a java server
process, the one started by the run.sh script, and a javascript user interface
run in a browser. To run a node, forge, update the blockchain, interact with
peers, only the java process needs to be running, so you could logout and close
the browser but keep the java process running. If you want to keep forging, make
sure you do not click on "stop forging" when logging out. You can also just
close the browser without logging out.

The java process communicates with peers on port 7774 tcp by default. If you are
behind a router or a firewall and want to have your node accept incoming peer
connections, you should setup port forwarding. The server will still work though
even if only outgoing connections are allowed, so opening this port is optional.

The user interface is available on port 7776. This port also accepts http API
requests which other HZ client applications could use.

The blockchain is stored on disk using the H2 embedded database, inside the
nhz_db directory. When upgrading, you should not delete the old nhz_db
directory, upgrades always include code that can upgrade old database files to
the new version whenever needed. But there is no harm if you do delete the
nhz_db, except that it will take some extra time to download the blockchain
from scratch.

The default Horizon client does not store any wallet-type file on disk. Unlike
bitcoin, your password is the only thing you need to get access to your account,
and is the only piece of data you need to backup or remember. This also means
that anybody can get access to your account with only you password - so make
sure it is long and random. A weak password will result in your funds being
stolen immediately.

The java process logs its activities and error messages to the standard output
which you see in the console window, but also to a file nhz.log, which gets
overwritten at restart. In case of an error, the nhz.log file may contain
helpful information, so include its contents when submitting a bug report.

In addition to the default user interface at http://localhost:7776 , the
following urls are available:

http://localhost:7776/test - a list of all available http API requests, very
useful for client developers and for anyone who wants to execute commands
directly using the http interface without going through the browser UI.

http://localhost:7776/test?requestType=<specificRequestType> - same as above,
but only shows the form for the request type specified.

http://localhost:7776/doc - a javadoc documentation for client developers who
want to use the Java API directly instead of going through the http interface.

http://localhost:7776/admin.html - some more commonly used commands, using the
http interface.


Compiling:

The source is included in the src subdirectory. To compile it on linux, just
run the enclosed compile.sh script. This will compile all java classes and
put them under the classes subdirectory, which is already in the classpath
used by the run.sh startup script. The compiled class files can optionally be
packaged in a nhz.jar file using the enclosed jar.sh script, and then nhz.jar
should be included in the classpath instead of the classes subdirectory.