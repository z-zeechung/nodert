const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const config = {
  entry: "./node/lib/fs.js",
  output: {
    filename: "fs.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  optimization: {
    concatenateModules: false,
  },
  resolve: {
    modules: [
      '.',
    ],
    alias:{
        'internal/url': 'shims/fs/url.js',
        'internal/fs/utils': 'node/lib/internal/fs/utils.js',
        'internal/process/permission': 'shims/fs/permission.js',
        'internal/fs/read/context': 'node/lib/internal/fs/read/context.js',
        'internal/fs/cp/cp': 'node/lib/internal/fs/cp/cp.js',
        'internal/fs/cp/cp-sync': 'node/lib/internal/fs/cp/cp-sync.js',
        'internal/fs/rimraf': 'node/lib/internal/fs/rimraf.js',
        'internal/fs/watchers': 'node/lib/internal/fs/watchers.js',
            'internal/async_hooks': 'shims/fs/dummys.js',
        'internal/fs/recursive_watch': 'node/lib/internal/fs/recursive_watch.js',
        'internal/fs/streams': 'node/lib/internal/fs/streams.js',
            'internal/streams/destroy': 'shims/fs/dummys.js',
        'internal/fs/glob': 'node/lib/internal/fs/glob.js',
        'fs/promises': 'node/lib/fs/promises.js',
            'internal/fs/dir': 'node/lib/internal/fs/dir.js',
            'internal/streams/utils': 'shims/fs/dummys.js',
            'internal/readline/interface': 'shims/fs/dummys.js',
            'internal/worker/js_transferable': 'shims/fs/dummys.js',
            'internal/webstreams/readablestream': 'shims/fs/dummys.js',

        'internalBinding': 'shims/fs/internalBinding.js',
          'def_fs.js': 'shims/fs/def_fs.js',
    }
  },
  externals:{
    'internal/util/types': 'commonjs internal/util/types',
    'internal/blob': 'commonjs internal/blob',
    'internal/errors': 'commonjs internal/errors',
    'internal/util': 'commonjs internal/util',
    'internal/validators': 'commonjs internal/validators',
    'internal/assert': 'commonjs internal/assert',
    'internal/constants': 'commonjs internal/constants',
    'internal/event_target': 'commonjs internal/event_target',
    'internal/deps/minimatch/index': 'commonjs deps/minimatch.js',
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