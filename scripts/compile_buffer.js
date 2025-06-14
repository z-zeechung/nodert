const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const config = {
  entry: "./shims/buffer-6.0.3/index.js",
  output: {
    filename: "buffer.corelib.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  resolve: {
    modules: [
      'shims/buffer-6.0.3',
      'shims/buffer-6.0.3/node_modules'
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

  fs.rmSync('lib/buffer.corelib.js.LICENSE.txt')
});