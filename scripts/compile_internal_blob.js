const webpack = require("webpack");
const path = require("path");
const fs = require("fs");
const TerserPlugin = require("terser-webpack-plugin");

if(!fs.existsSync('lib/internal')){
    fs.mkdirSync('lib/internal');
}

const config = {
  entry: "./shims/internal_blob/index.js",
  output: {
    filename: "blob.js",
    path: path.resolve('./lib/internal'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  optimization: {
    concatenateModules: false,
    minimizer: [
      new TerserPlugin({
        extractComments: false, 
      }),
    ],
  },
  resolve: {
    modules: [
        '.',
    ],
    alias: {
        'fetch-blob': 'shims/fetch-blob-4.0.0/index.js'
    }
  },
  externals: {
      'internal/errors': 'commonjs internal/errors',
      'node:process': 'commonjs process',
      'node:stream/web': 'commonjs stream/web',
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