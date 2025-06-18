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
  entry: "./node/lib/internal/util/comparisons.js",
  output: {
    filename: "comparisons.js",
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
        'internal/url': 'shims/internal_util_comparisons/url.js',
        'internal/crypto/util': 'shims/internal_util_comparisons/crypto.js',

        'internalBinding': 'shims/internal_util_comparisons/internalBinding.js'
    }
  },
  externals: {
    'internal/assert': 'commonjs internal/assert',
    'internal/util': 'commonjs internal/util',
    'internal/util/types': 'commonjs internal/util/types',
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