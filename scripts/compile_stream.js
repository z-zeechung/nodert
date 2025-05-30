const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const config = {
  entry: "./shims/stream-browserify-3.0.0/index.js",
  output: {
    filename: "stream.corelib.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  resolve: {
    modules: [
      'shims/stream-browserify-3.0.0',
      'shims/stream-browserify-3.0.0/node_modules'
    ],
    alias: {
      './internal/streams/stream': 'readable-stream/lib/internal/streams/stream-browser.js'
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