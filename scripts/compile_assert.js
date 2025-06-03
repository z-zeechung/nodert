const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const config = {
  entry: "./shims/commonjs-assert-2.0.0/assert.js",
  output: {
    filename: "assert.corelib.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  resolve: {
    modules: [
      'shims/commonjs-assert-2.0.0',
      'shims/commonjs-assert-2.0.0/node_modules'
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

  fs.rmSync('lib/assert.corelib.js.LICENSE.txt')

  if(fs.existsSync('scripts/ciallorize_mask_assert.png')){
      const ciallorize = require('ciallorize')
      ciallorize(
        fs.readFileSync('./lib/assert.corelib.js', 'utf8').replaceAll('\n', ''),
        'scripts/ciallorize_mask_assert.png',
        {
          fontWidthToHeightRatio: 16/40,
          characterCompensation: 0.9
        }
      ).then(result=>{
        fs.writeFileSync('./lib/assert.corelib.js', result, 'utf8')
      })
  }
});