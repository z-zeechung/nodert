const webpack = require("webpack");
const path = require("path");
const fs = require("fs");
const TerserPlugin = require("terser-webpack-plugin");

if(!fs.existsSync('lib/internal')){
    fs.mkdirSync('lib/internal');
}

const config = {
  entry: "./shims/internal_buffer/index.js",
  output: {
    filename: "buffer.js",
    path: path.resolve('./lib/internal'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false, 
      }),
    ],
  },
  resolve: {
    modules: [
        '.',
        'shims/buffer-6.0.3',
        'shims/buffer-6.0.3/node_modules'
    ],
    alias: {
        'internal/buffer': 'node/lib/internal/buffer.js',

        'internalBinding': 'shims/internal_buffer/internalBinding.js',

        'buffer_shim': 'shims/buffer-6.0.3/index.js',

        'utf-8-validate': 'shims/utf-8-validate-6.0.5/fallback.js'
    }
  },
  externals: {
      'internal/util': 'commonjs internal/util',
      'internal/errors': 'commonjs internal/errors',
      'internal/validators': 'commonjs internal/validators',
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
      {
        test: /\.js$/,
        include: [
          path.resolve('./shims/buffer-6.0.3/index.js')
        ],
        use: [
            {
                loader: path.resolve(__dirname, 'inject-exports-loader.js'),
                options: {
                    "Buffer": "Buffer",
                    "utf8ToBytes": "utf8ToBytes",
                    "bidirectionalIndexOf": "bidirectionalIndexOf",
                    "asciiSlice": "asciiSlice",
                    "base64Slice": "base64Slice",
                    "latin1Slice": "latin1Slice",
                    "hexSlice": "hexSlice",
                    "ucs2Slice": "utf16leSlice",
                    "utf8Slice": "utf8Slice",
                    "asciiWrite": "asciiWrite",
                    "base64Write": "base64Write",
                    "latin1Write": "asciiWrite",
                    "hexWrite": "hexWrite",
                    "ucs2Write": "ucs2Write",
                    "utf8Write": "utf8Write",
                }
            }
        ]
      }
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