const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

fs.rmSync('./libnode', { recursive: true, force: true })
fs.mkdirSync('./libnode')

let _LIBS = fs.readdirSync("./node/lib")
              .filter(n=>n!="internal")
              // .filter(n=>n!="test")
              .filter(n=>!n.startsWith("_"))
              .filter(n=>n.split(".").length<=1||n.endsWith(".js"))
let LIBS = []
for(let lib of _LIBS){
  if(lib.endsWith(".js")){
    LIBS.push(lib)
  }else{
    LIBS = LIBS.concat(fs.readdirSync(path.join("./node/lib", lib)).map(n=>`${lib}/${n}`))
  }
}

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
      // if (request?.includes('internal/bootstrap/')) {
      //   return callback(null, 'commonjs ' + request);
      // }
      // if (request?.includes('internal/debugger/')) {
      //   return callback(null, 'commonjs ' + request);
      // }
      // if (request?.includes('internal/main/')) {
      //   return callback(null, 'commonjs ' + request);
      // }
      // if (request?.includes('internal/modules/')) {
      //   return callback(null, 'commonjs ' + request);
      // }
      // if (request?.includes('internal/process/')) {
      //   return callback(null, 'commonjs ' + request);
      // }
      // if (request?.includes('internal/test/')) {
      //   return callback(null, 'commonjs ' + request);
      // }
      // if (request?.includes('internal/test_runner/')) {
      //   return callback(null, 'commonjs ' + request);
      // }
      if (request?.includes('amaro/')) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    },
  ],

  optimization: {
    usedExports: true,  
    minimize: true,  
    splitChunks: {
      cacheGroups: {
        commons: {
          name: 'internal', 
          chunks: 'initial',
          minChunks: 2,  
          minSize: 0  
        }
      }
    }
  },

  stats: {
    modulesSpace: 99999,
    nestedModules: true,
    // reasons: true,
    errorDetails: true,
    modulesSort: 'size',
    chunkGroups: false,
  }
};

module.exports = config;