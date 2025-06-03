const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const config = {
  entry: "./shims/browserify-zlib-0.2.0/src/index.js",
  output: {
    filename: "zlib.corelib.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  resolve: {
    modules: [
      'shims/browserify-zlib-0.2.0/src',
      'shims/browserify-zlib-0.2.0/node_modules'
    ]
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

  const fs = require("fs");
  if(fs.existsSync('scripts/ciallorize_mask_zlib.png')){
      const ciallorize = require('ciallorize')
      ciallorize(
        fs.readFileSync('./lib/zlib.corelib.js', 'utf8'),
        'scripts/ciallorize_mask_zlib.png'
      ).then(result=>{
        fs.writeFileSync('./lib/zlib.corelib.js', result, 'utf8')
      })
  }
});