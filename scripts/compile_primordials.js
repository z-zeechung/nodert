const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const config = {
  entry: "./node/lib/internal/per_context/primordials.js",
  output: {
    filename: "primordials.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
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