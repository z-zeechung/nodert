
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


import * as qos from "qjs:os"

var worker;

function test_worker()
{

    worker = new qos.Worker("lib/test.js");
    worker.postMessage({ type: "sab" });

    setInterval(()=>{print("?")}, 100)
}

test_worker();