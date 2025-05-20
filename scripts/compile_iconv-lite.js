const webpack = require("webpack");
const path = require("path");

const config = {
  entry: "./iconv-lite/lib/index.js",
  output: {
    filename: "iconv-lite.js",
    path: path.resolve('./lib'),
  },
  target: 'node',
  mode: "production",
  resolve: {
    modules: [
      'iconv-lite/lib'
    ]
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