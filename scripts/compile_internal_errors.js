const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

if(!fs.existsSync('lib/internal')){
    fs.mkdirSync('lib/internal');
}

const config = {
  entry: "./node/lib/internal/errors.js",
  output: {
    filename: "errors.js",
    path: path.resolve('./lib/internal'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  resolve: {
    modules: ['.'],
    alias: {
        'internal/util/inspect': 'shims/internal_errors/inspect.js',
        'internal/tty': 'node/lib/internal/tty.js',
        'internal/v8/startup_snapshot': 'shims/internal_errors/v8.js',

        'internalBinding': 'shims/internal_errors/internalBinding.js'
    }
  },
  externals: {
      'internal/assert': 'commonjs internal/assert',
      'internal/util': 'commonjs internal/util',
      'internal/validators': 'commonjs internal/validators',
      'internal/util/colors': 'commonjs internal/util/colors',
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