const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const config = {
  entry: "./node/lib/events.js",
  output: {
    filename: "events.js",
    path: path.resolve('./lib'),
    libraryTarget: "umd",
  },
  target: 'node',
  mode: "production",
  resolve: {
    modules: [
      '.',
      'shims/zone.js-0.15.1/fesm2015'
    ],
    alias:{
      'internal/events/abort_listener': 'node/lib/internal/events/abort_listener.js',
      'internal/process/task_queues': 'shims/events/task_queues.js',
      'async_hooks': 'shims/events/async_hooks.js',
      'internal/fixed_queue': 'node/lib/internal/fixed_queue.js',
      'internal/events/symbols': 'node/lib/internal/events/symbols.js'
    }
  },
  externals:{
    'internal/util': 'commonjs internal/util',
    'internal/util/inspect': 'commonjs internal/util/inspect',
    'internal/errors': 'commonjs internal/errors',
    'internal/validators': 'commonjs internal/validators',
    'internal/event_target': 'commonjs internal/event_target',
  }
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