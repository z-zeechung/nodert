const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const config = {
  entry: "./shims/util/util.js",
  output: {
    filename: "util.corelib.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  resolve: {
    modules: [
        '.',
        'shims/node-util-0.12.4/node_modules'
    ],
    alias: {
      'node_util': 'shims/node-util-0.12.4/util.js',
      'inherits': 'inherits/inherits_browser.js',

      // 'internal/util/inspect': 'node/lib/internal/util/inspect.js',
      //   'internal/util$': 'shims/util/internal.util.js',
      //   'internal/errors': 'shims/util/errors.js',
      //   'internal/util/types': 'node/lib/internal/util/types.js',
      //     'internal/crypto/keys': 'shims/util/crypto.js',
      //   'internal/assert': 'node/lib/internal/assert.js',
      //     // 'internal/errors'
      //   'internal/bootstrap/realm': 'shims/util/realm.js',
      //   'internal/validators': 'shims/util/validators.js',
      //   'internal/url': 'shims/util/internal.url.js',

      //   'internalBinding': 'shims/util/internalBinding.js'
    }
  },
  // module: {
  //     rules: [
  //       {
  //         test: /\.js$/,
  //         exclude: [
  //           path.resolve('./shims') 
  //         ],
  //         use: [
  //           {
  //             loader: path.resolve(__dirname, 'inject-internalBinding-loader.js'),
  //           },
  //         ],
  //         enforce: 'pre',
  //       },
  //     ],
  //   },
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