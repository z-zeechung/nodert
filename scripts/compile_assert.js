const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const config = {
  entry: "./node/lib/assert.js",
  output: {
    filename: "assert.js",
    path: path.resolve('./lib'),
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
        'internal/assert/myers_diff': 'node/lib/internal/assert/myers_diff.js',
        'internal/assert/assertion_error': 'node/lib/internal/assert/assertion_error.js',
        'internal/bootstrap/realm': 'shims/assert/realm.js',
        'internal/url': 'shims/assert/url.js',
        'internal/deps/acorn/acorn/dist/acorn': 'shims/assert/acorn.js',
        'internal/deps/acorn/acorn-walk/dist/walk': 'shims/assert/acorn-walk.js',
    }
  },
  externals: {
    'internal/util/comparisons': 'commonjs internal/util/comparisons',
    'internal/util': 'commonjs internal/util',
    'internal/util/types': 'commonjs internal/util/types',
    'internal/util/inspect': 'commonjs internal/util/inspect',
    'internal/util/colors': 'commonjs internal/util/colors',
    'internal/validators': 'commonjs internal/validators',
    'internal/errors': 'commonjs internal/errors',
    'internal/constants': 'commonjs internal/constants',
    'deps/acorn': 'commonjs deps/acorn',
    'deps/acorn-walk': 'commonjs deps/acorn-walk',
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