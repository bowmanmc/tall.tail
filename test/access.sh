#!/bin/bash

SRC=/tmp/nasa.txt
OUT=/tmp/access.log

while :
do
    cat $SRC | awk 'BEGIN { srand() } rand() >= 0.5 { print; exit }' >> $OUT
    #cat $SRC | sort -R | head -n 1 >> $OUT
    t=$((RANDOM % 5))
    echo "Slepping for $t"
    sleep $t
done

