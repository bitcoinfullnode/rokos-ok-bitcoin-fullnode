#!/bin/sh
java -cp lib/h2*.jar org.h2.tools.Shell -url jdbc:h2:nhz_db/nhz -user sa -password sa
