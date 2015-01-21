tall.tail
=========

Web application providing tail functionality. Written in Node.js


  Tall Tail Installation Guide
  Install node.js
  http://lmgtfy.com/?q=install+nodejs
  Build Tall.Tail
  Get the tall.tail source from https://github.com/bowmanmc/tall.tail
  Build it with ant.
  Install Tall.Tail
  Open a command prompt

  > mkdir /opt/node/
  > cd /opt/node
  > tar xvfz ./path to where you built tall.tail/dist/tall.tail-1.0-dev.tar.gz
  > cd tall.tail
  > npm install

  Configure Tall.Tail
  Open a command prompt

  > cd /opt/node/tall.tail
  > vi config.js

  /**
  * config.js
  * Tall Tail server-side configuration. TallTail.config in app/ttconfig.js
  * wraps this file and reloads it on change so that you can add files without
  * having to restart the service.
  */
  exports.port = 9000;

  exports.buffersize = 5000;

  exports.files = [
  '/usr/local/tomcat/logs/catalina.out',
  '/usr/local/activemq/data/activemq.log'
  ];

  To change the port, update the exports.port
  To add files to the list of monitored files, update the exports.files list
  DO NOT PUT THE TALL.TAIL LOG IN THE CONFIG FILE.  

  Start Tall.Tail
  Open a command prompt
  > cd /opt/node/tall.tail

  To start as a normal process
  > node ./app.js

  To start as a background process
  > node ./app.js &> tall.tail.log &

  To run as a service
  Creating a service wrapper for tall.tail ensures that the service restarts when the service does.  Warning:  The service runs as root.  
  Create the script /opt/node/tall.tail/tall-tale

  >vi /opt/node/tall.tail/tall-tale

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

  Make sure that the script has execute permission
  > chmod +x /opt/node/tall.tail/tall-tale

  Link it into the /etc/init.d directory
  > ln -s /opt/node/tall.tail/tall-tale /etc/init.d/tall-tale

  Create the service
  > chkconfig tall-tale --add
  Starting the service
  >service tall-tail start
  Stopping the service
  >service tall-tail start

  Use Tall.Tail
  Open browser and set to
  http://<server>:9000/tail
