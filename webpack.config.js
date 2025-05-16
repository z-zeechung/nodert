const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

fs.rmSync('./libnode', { recursive: true, force: true })
fs.mkdirSync('./libnode')

LIBS = [
  'os.js'
]

WHITELIST = [
  "./node/lib/internal/per_context/primordials.js",
  "./node/lib/os.js",
    'internal/errors',
    'internal/validators'
]

const config = {

  target: 'node',
  mode: 'production',

  entry: Object.fromEntries([
    ['primordials', './node/lib/internal/per_context/primordials.js'],
    ...LIBS.map(lib=>[
      lib.slice(0, -3), `./node/lib/${lib}`
    ])
  ]),
  
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'libnode'),
  },
  
  resolve: {
    modules: [
      path.resolve(__dirname, 'node/lib'), 
      path.resolve(__dirname, 'node/deps')
      // 'node_modules'
    ],

    alias: Object.fromEntries([
      ['internal/deps', path.resolve(__dirname, 'node/deps')],
    ]),
    
    extensions: ['.js', '.json']
  },

  externals: [
    ({ request }, callback) => {
      if (!WHITELIST.includes(request)) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    },
  ],

  // optimization: {
  //   usedExports: true,  
  //   minimize: true,  
  //   splitChunks: {
  //     cacheGroups: {
  //       commons: {
  //         name: 'internal', 
  //         chunks: 'initial',
  //         minChunks: 2,  
  //         minSize: 0  
  //       }
  //     }
  //   }
  // },

  // stats: {
  //   modulesSpace: 99999,
  //   nestedModules: true,
  //   // reasons: true,
  //   errorDetails: true,
  //   modulesSort: 'size',
  //   chunkGroups: false,
  // }
};

module.exports = config;