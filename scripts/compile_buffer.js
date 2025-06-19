const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const config = {
  entry: "./node/lib/buffer.js",
  output: {
    filename: "buffer.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  resolve: {
    modules: [
        '.',
    ],
    alias: {
        'internal/options': 'shims/buffer/options.js',

        'internalBinding': 'shims/buffer/internalBinding.js'
    }
  },
  externals: {
    'internal/util': 'commonjs internal/util',
    'internal/util/types': 'commonjs internal/util/types',
    'internal/util/inspect': 'commonjs internal/util/inspect',
    'internal/errors': 'commonjs internal/errors',
    'internal/validators': 'commonjs internal/validators',
    'internal/buffer': 'commonjs internal/buffer',
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