const webpack = require("webpack");
const path = require("path");

const config = {
  entry: "./stream/index.js",
  output: {
    filename: "stream.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  resolve: {
    alias: {
      'emitter': path.resolve('./component-emitter/index.js'),
    },
  },
  optimization: {
    minimize: false,
    concatenateModules: false, 
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