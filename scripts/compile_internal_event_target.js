const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

if(!fs.existsSync('lib/internal')){
    fs.mkdirSync('lib/internal');
}

const config = {
  entry: "./node/lib/internal/event_target.js",
  output: {
    filename: "event_target.js",
    path: path.resolve('./lib/internal'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  resolve: {
    modules: ['.'],
    alias: {
        'internal/perf/utils': 'shims/internal_event_target/performance.js'
    }
  },
  externals: {
    'internal/errors': 'commonjs internal/errors',
    'internal/validators': 'commonjs internal/validators',
    'internal/util': 'commonjs internal/util',
    'internal/webidl': 'commonjs internal/webidl',
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