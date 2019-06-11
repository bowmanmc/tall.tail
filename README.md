tall.tail
=========

A web application allowing you to view a 'tail-f' of files on your server.

Written in Node.js

# How to Use
- Build it.
- Install it.
- Configure it.
- Run it.
- Point your browser to http://\<your-server\>:9000/tail
  
# Prereqs
Install [node.js](http://lmgtfy.com/?q=install+nodejs)

Install ant : 'yum install ant'

# Build It

Clone this project
```
> git clone <this project>
> cd tall.tail
> ant
```
This will build the file dist/tall.tail-1.0-dev.tar.gz

# Install it
Figure out where you want to put it.  Default is /opt/node
```
> mkdir /opt/node
> cd /opt/node
> tar xzvf <the file you build above>
> cd tall.tail
> npm install
```

# Configure it
Edit the file config.js.  Change the port to the one you want.  Change the buffer size to something you feel is appropriate. Add files to the list of exported files.  NOTE:  tall.tail will just crash if the files you're monitoring dont exist or you dont have permission to view them.  Don't be that guy.
```
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

```

# Run it

## To start it as a normal process
```
> node ./app.js
```

## To start it as a background process
```
> node ./app.js &> tall.tail.log &
```


# Perhaps you want to run tall tail as a system service???

### To start it as a Linux service (for centos 6-)
Edit the file service.sh and make sure the paths are correct 

Make sure that the script has execute permission
```
  > chmod +x /opt/node/tall.tail/service.sh
```

Link it into the /etc/init.d directory
```
  > ln -s /opt/node/tall.tail/service.sh /etc/init.d/tall-tale
```
Create and start the service
```
> chkconfig tall-tale --add
> service tall-tail start
```

### To start it as a Systemd service (for centos7+)
Edit the file /opt/node/tall.tail/tall-tail and make sure the paths are correct, then copy or link the file to /etc/systemd/system.

Then enable tall-tail
```
systemctl enable tall-tail
```

Finally, start tall-tail
```
systemctl start tall-tail
```

##### Optional:  Systemd routes all of tall.tail's output to the syslog....and it can be a bit verbose.  You may want to send it to its own log file.  To do that:

Create the file /etc/rsyslog.d/tall-tail.conf and fill it with this:
```
if $programname == 'tall-tail' then /var/log/tall-tail.log
& stop
```
Then restart the system  logger
```
systemctl restart rsyslog
```
