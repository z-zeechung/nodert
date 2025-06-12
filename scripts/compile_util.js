const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const config = {
  entry: "./node/lib/util.js",
  output: {
    filename: "util.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  optimization: {
    concatenateModules: false  // dotenv used some lib we don't currently support
  },
  resolve: {
    modules: [
        '.',
        'shims/dotenv-16.5.0/lib'
    ],
    alias: {
        'internal/streams/utils': 'shims/util/stream_utils.js',
        'internal/options': 'shims/util/options.js',
        'internal/abort_controller': 'shims/util/abort_controller.js',
        'internal/console/global': 'shims/util/global_console.js',
        'internal/source_map/source_map_cache': 'shims/util/source_map.js',
        'internal/util/comparisons': 'node/lib/internal/util/comparisons.js',
        'internal/url': 'shims/util/url.js',
        'internal/crypto/util': 'shims/util/crypto.js',

        'internalBinding': 'shims/util/internalBinding.js',

        'dotenv': 'shims/dotenv-16.5.0/lib/main.js',
        'dotenv-expand': 'shims/dotenv-expand-12.0.2/lib/main.js',
    }
  },
  externals: {
    'internal/errors': 'commonjs internal/errors',
    'internal/util/inspect': 'commonjs internal/util/inspect',
    'internal/util/debuglog': 'commonjs internal/util/debuglog',
    'internal/validators': 'commonjs internal/validators',
    'internal/util/types': 'commonjs internal/util/types',
    'internal/util/colors': 'commonjs internal/util/colors',
    'internal/util': 'commonjs internal/util',
    'internal/assert': 'commonjs internal/assert',
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