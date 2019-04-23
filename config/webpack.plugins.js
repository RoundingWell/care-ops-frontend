const webpack = require('webpack');
const { isProduction, jsRoot } = require('./webpack.env.js');

const CleanPlugin = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const FontAwesomePlugin = require('./fontawesome-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const pkg = require('../package.json');

const definePlugin = new webpack.DefinePlugin({
  _PRODUCTION_: isProduction,
  _DEVELOP_: !isProduction,
});

const extractPlugin = new MiniCssExtractPlugin({
  filename: '[name].[hash].css',
});

// Moment loads en-us by default
// https://github.com/moment/moment/tree/develop/locale
const momentContextPlugin = new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /pt-br/);

// https://github.com/yahoo/handlebars-intl/tree/master/dist/locale-data
const hbsIntlContextPlugin = new webpack.ContextReplacementPlugin(/handlebars-intl[\/\\]dist[\/\\]locale-data/, /en|pt/);

const cleanPlugin = new CleanPlugin();

const copyPlugin = new CopyPlugin([
  { from: 'src/assets' },
]);

const htmlPlugin = new HtmlPlugin({
  template: `${ jsRoot }/views/globals/root.hbs`,
  filename: 'index.html',
  hash: true,
  inject: 'head',
});

const fontAwesomePlugin = new FontAwesomePlugin(pkg.fontawesome);

module.exports = {
  cleanPlugin,
  copyPlugin,
  definePlugin,
  extractPlugin,
  fontAwesomePlugin,
  hbsIntlContextPlugin,
  htmlPlugin,
  momentContextPlugin,
};
