const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

if(!fs.existsSync('lib/internal')){
    fs.mkdirSync('lib/internal');
}
if(!fs.existsSync('lib/internal/util')){
    fs.mkdirSync('lib/internal/util');
}

const config = {
  entry: "./node/lib/internal/util/types.js",
  output: {
    filename: "types.js",
    path: path.resolve('./lib/internal/util'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  optimization: {
    concatenateModules: false
  },
  resolve: {
    modules: [
      '.',
      'shims/node-util-0.12.4/node_modules',
      'shims/is-date-object-1.1.0/node_modules',
    ],
    alias: {
        'internal/crypto/keys': 'shims/internal_util_types/crypto.js',

        'internalBinding': 'shims/internal_util_types/internalBinding.js',

        'types': 'shims/node-util-0.12.4/support/types.js',
        'is-date': 'shims/is-date-object-1.1.0/index.js',
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