const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

if(!fs.existsSync('lib/internal')){
    fs.mkdirSync('lib/internal');
}
if(!fs.existsSync('lib/internal/util')){
    fs.mkdirSync('lib/internal/util');
}

const config = {
  entry: "./node/lib/internal/util/colors.js",
  output: {
    filename: "colors.js",
    path: path.resolve('./lib/internal/util'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  optimization: {
    concatenateModules: false
  },
  resolve: {
    modules: ['.'],
    alias: {
        'internal/tty': 'node/lib/internal/tty.js',
    }
  },
  externals: {
    'internal/validators': 'commonjs internal/validators',
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