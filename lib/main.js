
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



console.log("1");

new Promise((resolve, reject) => {
    resolve();
}).then(() => {
    console.log("2");
    new Promise((resolve, reject) => {
        resolve();
    }).then(() => {
        console.log("3");
    })
})

console.log("4");

new Promise((resolve, reject) => {
    resolve();
}).then(async () => {
    console.log("5");
    await(new Promise((resolve, reject) => {
        console.log("6");
        resolve();
    }))
    console.log("7");
})