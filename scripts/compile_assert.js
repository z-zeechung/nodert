const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const config = {
  entry: "./shims/commonjs-assert-2.0.0/assert.js",
  output: {
    filename: "assert.corelib.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  resolve: {
    modules: [
      'shims/commonjs-assert-2.0.0',
      'shims/commonjs-assert-2.0.0/node_modules'
    ]
  },
};

webpack(config, (err, stats) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(
    stats.toString({
      colors: true, 
      chunks: false, 
      modules: false,
    })
  );

  fs.rmSync('lib/assert.corelib.js.LICENSE.txt')
});