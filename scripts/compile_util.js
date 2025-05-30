const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const config = {
  entry: "./shims/node-util-0.12.4/util.js",
  output: {
    filename: "util.corelib.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  resolve: {
    modules: [
        'shims/node-util-0.12.4',
      'shims/node-util-0.12.4/node_modules'
    ],
    alias: {
      'inherits': 'inherits/inherits_browser.js'
    }
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
});