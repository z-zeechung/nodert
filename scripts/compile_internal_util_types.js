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
    modules: ['.'],
    alias: {
        'internal/crypto/keys': 'shims/internal_util_types/crypto.js',

        'internalBinding': 'shims/internal_util_types/internalBinding.js'
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