#!/bin/bash

echo 'Starting log spewer!!!'

LOG=/tmp/test.log

touch $LOG
echo '' > $LOG

while :
do

	echo `date` >> $LOG

	t=$((RANDOM % 5))
	echo "Slepping for $t"
	sleep $t
done

