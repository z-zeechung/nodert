const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

if(!fs.existsSync('lib/internal')){
    fs.mkdirSync('lib/internal');
}

const config = {
  entry: "./shims/internal_util/index.js",
  output: {
    filename: "util.js",
    path: path.resolve('./lib/internal'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  optimization: {
    // avoid hoisting require calls for non-existent modules to the top level
    concatenateModules: false
  },
  resolve: {
    modules: ['.'],
    alias: {
        'internal/util': 'node/lib/internal/util.js',
        'internal/options': 'shims/internal_util/options.js',
        'internal/process/warning': 'shims/internal_util/process_warning.js',
        'internal/url': 'shims/internal_util/url.js',

        'uv_errmap.json': 'shims/internal_util/uv_errmap.json',

        'w3c-domcore-errors.js': 'shims/w3c-domcore-errors-1.0.2/w3c-domcore-errors.js',

        'internalBinding': 'shims/internal_util/internalBindings.js'
    }
  },
  externals: {
    'internal/errors': 'commonjs internal/errors',
    'internal/validators': 'commonjs internal/validators',
    'internal/util/types': 'commonjs internal/util/types',

    // not exist
    'internal/process/execution': 'commonjs internal/process/execution',
    'internal/source_map/source_map_cache': 'commonjs internal/source_map/source_map_cache',
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

  fs.rmSync('lib/internal/util.js.LICENSE.txt')
});