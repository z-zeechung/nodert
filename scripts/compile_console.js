const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const config = {
  entry: "./node/lib/console.js",
  output: {
    filename: "console.corelib.js",
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
            'internal/errors': 'shims/console/errors.js',
            'internal/validators': 'shims/console/validators.js',
            'internal/util/inspect': 'shims/console/util.js',
            'internal/util/types': 'shims/console/util.types.js',
            'internal/constants': 'node/lib/internal/constants.js',
            'internal/util/debuglog': 'node/lib/internal/util/debuglog.js',
                // 'internal/constants'
                // 'internal/util/inspect'
                'internal/util/colors': 'node/lib/internal/util/colors.js',
                    'internal/tty': 'node/lib/internal/tty.js',
            // 'internal/util/colors'
            'internal/readline/callbacks': 'node/lib/internal/readline/callbacks.js',
                // 'internal/errors'
                // 'internal/validators'
                'internal/readline/utils': 'node/lib/internal/readline/utils.js',
            'internal/cli_table': 'node/lib/internal/cli_table.js',
                // 'internal/util/inspect'
            'internal/v8/startup_snapshot': 'shims/console/v8.js',

            'internalBinding': 'shims/console/internalBinding.js'
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