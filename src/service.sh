#!/bin/bash
#
# Tall Tail
#
# chkconfig: 2345 85 15
# description: Tall Tail service
# processname: node
# pidfile: /opt/node/tall.tail.pids/tall-tail.pid

DIR=/opt/node/tall.tail
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
NODE_PATH=/usr/local/lib/node_modules
DATE=`date +%y-%m-%d`
TIME=`date +%H:%M:%S`

cd $DIR

case $1 in
    start)
    echo $DATE $TIME " | STARTING..." >> $DIR/logs/tall-tail.log
    nohup "node" "$DIR/app.js" 1>>"$DIR/logs/tall-tail.log" 2>&1 &
    echo $! > "$DIR/pids/tall-tail.pid";
    ;;
    stop)
    echo $DATE $TIME " | STOPPING..." >> $DIR/logs/tall-tail.log
    kill `cat $DIR/pids/tall-tail.pid`
    ;;
    *)
    echo "usage: /etc/init.d/tall-tail {start|stop}"
    exit 0
    ;;
esac
exit $?
