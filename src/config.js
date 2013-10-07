/**
 * config.js
 * Tall Tail server-side configuration. TallTail.config in app/ttconfig.js 
 * wraps this file and reloads it on change so that you can add files without
 * having to restart the service. 
 */
exports.port = 9000;

exports.buffersize = 5000;

exports.files = [
    '/tmp/nasa.txt',
    '/tmp/access.log',
    '/tmp/fart.log',
    '/foo/bar/baz.log'
];
