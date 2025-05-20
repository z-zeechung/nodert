const webpack = require("webpack");
const path = require("path");

const config = {
  entry: "./iconv-lite/lib/index.js",
  output: {
    filename: "iconv-lite.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  resolve: {
    modules: [
      'iconv-lite/lib'
    ]
  },
  externals: {
    'string_decoder': 'commonjs string_decoder.js',
    'stream': 'commonjs stream.js',
    'safer-buffer': 'commonjs buffer.js',
  },
  optimization: {
    minimize: false,
    concatenateModules: false, 
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