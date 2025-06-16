const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const config = {
  entry: "./node/lib/console.js",
  output: {
    filename: "console.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  resolve: {
    modules: [path.resolve('.')],
    alias: {
        'internal/console/global': 'node/lib/internal/console/global.js',
        'internal/console/constructor': 'node/lib/internal/console/constructor.js',
            'internal/readline/callbacks': 'node/lib/internal/readline/callbacks.js',
                'internal/readline/utils': 'node/lib/internal/readline/utils.js',
            'internal/cli_table': 'node/lib/internal/cli_table.js',
            'internal/v8/startup_snapshot': 'shims/console/v8.js',

            'internalBinding': 'shims/console/internalBinding.js'
    }
  },
  externals: {
    'internal/errors': 'commonjs internal/errors',
    'internal/validators': 'commonjs internal/validators',
    'internal/util/inspect': 'commonjs internal/util/inspect',
    'internal/util/types': 'commonjs internal/util/types',
    'internal/constants': 'commonjs internal/constants',
    'internal/util/debuglog': 'commonjs internal/util/debuglog',
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