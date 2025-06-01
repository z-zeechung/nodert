const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const config = {
  entry: "./node/lib/diagnostics_channel.js",
  output: {
    filename: "diagnostics_channel.corelib.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  // mode: "production",
  mode: "development",
  resolve: {
    modules: [path.resolve('.')],
    alias: {
        'internal/errors': 'shims/diagnostics_channel/errors.js',
        'internal/validators': 'shims/diagnostics_channel/validators.js',
        'internal/util': 'shims/diagnostics_channel/util.js',

        'internalBinding': 'shims/diagnostics_channel/internalBinding.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          path.resolve('./shims') 
        ],
        use: [
          {
            loader: path.resolve(__dirname, 'inject-internalBinding-loader.js'),
          },
        ],
        enforce: 'pre',
      },
    ],
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