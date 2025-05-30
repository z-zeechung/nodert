const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const config = {
  entry: "./node/lib/path.js",
  output: {
    filename: "path.corelib.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  resolve: {
    modules: ['.'],
    alias: {
        'internal/constants': 'node/lib/internal/constants.js',
        'internal/validators': 'shims/path/validators.js',
        'internal/util': 'shims/path/util.js',
        'internal/deps/minimatch/index': 'node/deps/minimatch/index.js',
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