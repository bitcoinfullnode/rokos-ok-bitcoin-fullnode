#!/bin/sh
java -cp classes nxt.tools.ManifestGenerator
/bin/rm -f horizon.jar
jar cfm horizon.jar resource/horizon.manifest.mf -C classes . || exit 1
/bin/rm -f hzservice.jar
jar cfm hzservice.jar resource/hzservice.manifest.mf -C classes . || exit 1

echo "Horizon jar files generated successfully"