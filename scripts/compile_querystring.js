const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const config = {
  entry: "./shims/querystring-0.2.0/index.js",
  output: {
    filename: "querystring.corelib.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  resolve: {
    modules: [
      'shims/querystring-0.2.0',
      'shims/querystring-0.2.0/node_modules'
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
});