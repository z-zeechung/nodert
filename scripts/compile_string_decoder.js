const webpack = require("webpack");
const path = require("path");

const config = {
  entry: "./string_decoder/lib/string_decoder.js",
  output: {
    filename: "string_decoder.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  externals: {
    'safe-buffer': 'commonjs buffer.js',
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