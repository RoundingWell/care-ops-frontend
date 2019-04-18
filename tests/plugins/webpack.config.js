const path = require('path');
const { jsRoot, outputPath } = require('../../config/webpack.env.js');

const {
  definePlugin,
  hbsIntlContext,
  htmlWebpackPlugin,
  momentContext,
} = require('../../config/webpack.plugins.js');

const {
  babelLoader,
  hbsLoader,
  eslintLoader,
  nullLoader,
  ymlLoader,
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
  devtool: false,
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
    definePlugin,
    hbsIntlContext,
    htmlWebpackPlugin,
    momentContext,
  ],
  resolve: {
    alias: {
      'marionette': 'backbone.marionette',
    },
    modules: ['node_modules', path.resolve(process.cwd(), './src')],
  },
  resolveLoader: {
    alias: {
      'i18n-sync': path.join(__dirname, './config/i18n-sync'),
    },
  },
};
