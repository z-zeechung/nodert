
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



process.nextTick(() => {
    console.log('hello')
})