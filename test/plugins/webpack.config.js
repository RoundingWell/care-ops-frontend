const path = require('path');
const { jsRoot, outputPath } = require('../../config/webpack.env.js');

const {
  copyPlugin,
  definePlugin,
  fontAwesomePlugin,
  hbsIntlContextPlugin,
  htmlPlugin,
  momentContextPlugin,
} = require('../../config/webpack.plugins.js');

const {
  babelLoader,
  hbsLoader,
  eslintLoader,
  nullLoader,
  ymlLoader,
  resolveLoader,
} = require('../../config/webpack.rules.js');

babelLoader.use.options = {
  extends: path.resolve(process.cwd(), './.babelrc'),
  plugins: [
    ['istanbul'],
  ],
  cacheDirectory: true,
};

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  entry: path.resolve(process.cwd(), `${ jsRoot }/index.js`),
  output: {
    path: outputPath,
    filename: '[name].[hash].js',
  },
  module: {
    rules: [
      babelLoader,
      hbsLoader,
      eslintLoader,
      nullLoader,
      ymlLoader,
    ],
  },
  plugins: [
    copyPlugin,
    definePlugin,
    fontAwesomePlugin,
    hbsIntlContextPlugin,
    htmlPlugin,
    momentContextPlugin,
  ],
  resolve: {
    alias: {
      'marionette': 'backbone.marionette',
    },
    mainFields: ['module', 'main', 'browser'],
    modules: [
      'node_modules',
      path.resolve(process.cwd(), './src'),
      path.resolve(process.cwd(), './test/support'),
    ],
  },
  resolveLoader,
};
