#!/bin/sh
VERSION=$1
if [ -x ${VERSION} ];
then
	echo VERSION not defined
	exit 1
fi
PACKAGE=hz-client-${VERSION}.zip
echo PACKAGE="${PACKAGE}"

FILES="changelogs classes conf html lib src resource"
FILES="${FILES} horizon.jar hzservice.jar"
FILES="${FILES} 3RD-PARTY-LICENSES.txt AUTHORS.txt COPYING.txt DEVELOPER-AGREEMENT.txt LICENSE.txt"
FILES="${FILES} DEVELOPERS-GUIDE.md README.txt"
FILES="${FILES} mint.bat mint.sh run.bat run.sh run-tor.sh run-desktop.sh compact.sh compact.bat sign.sh"
FILES="${FILES} Horizon_Wallet.url"
FILES="${FILES} compile.sh javadoc.sh jar.sh package.sh"
FILES="${FILES} win-compile.sh win-javadoc.sh win-package.sh"

echo compile
./win-compile.sh
echo jar
./jar.sh
echo javadoc
rm -rf html/doc/*
./win-javadoc.sh

rm -rf hz-client
rm -rf ${PACKAGE}
mkdir -p hz-client/
mkdir -p hz-client/logs
echo copy resources
cp -a ${FILES} hz-client
echo gzip
for f in `find hz-client/html -name *.html -o -name *.js -o -name *.css -o -name *.json -o -name *.ttf -o -name *.svg -o -name *.otf`
do
	gzip -9c "$f" > "$f".gz
done
echo zip
zip -q -X -r ${PACKAGE} hz-client -x \*/.idea/\* \*/.gitignore \*/.git/\* \*/\*.log \*.iml hz-client/conf/nhz.properties hz-client/conf/logging.properties
rm -rf hz-client
echo done
