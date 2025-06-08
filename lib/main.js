
'use strict'

globalThis.global = globalThis

globalThis.primordials = {}
require('primordials')

globalThis.process = require('process');

globalThis.Buffer = require('buffer').Buffer;

globalThis.console = require('console').Console({
    stdout: process.stdout,
    stderr: process.stderr
});



require('fs').open(
    'lib/main.js',
    (err, fd)=>{
        print(err, fd)
        require('fs').close(fd, (err)=>{
            print(err)
        })
    }
)