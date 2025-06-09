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
  entry: "./node/lib/internal/util/inspect.js",
  output: {
    filename: "inspect.js",
    path: path.resolve('./lib/internal/util'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  resolve: {
    modules: ['.'],
    alias: {
        'internal/bootstrap/realm': 'shims/internal_util_inspect/realm.js',
        'internal/url': 'shims/internal_util_inspect/url.js',

        'internalBinding': 'shims/internal_util_inspect/internalBinding.js'
    }
  },
  externals: {
    'internal/util': 'commonjs internal/util',
    'internal/errors': 'commonjs internal/errors',
    'internal/util/types': 'commonjs internal/util/types',
    'internal/assert': 'commonjs internal/assert',
    'internal/validators': 'commonjs internal/validators',
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