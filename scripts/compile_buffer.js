const webpack = require("webpack");
const path = require("path");

const config = {
  entry: "./buffer/index.js",
  output: {
    filename: "buffer.js",
    path: path.resolve('./lib'),
  },
  target: 'node',
  mode: "production",
  optimization: {
    minimize: false,
    concatenateModules: false, 
  },
  resolve: {
    alias: {
      'ieee754': path.resolve('./ieee754/index.js'),
      'base64-js': path.resolve('./base64-js/index.js'),
    },
  }
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