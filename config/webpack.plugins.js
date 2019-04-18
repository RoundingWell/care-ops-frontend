const webpack = require('webpack');
const { isProduction, jsRoot } = require('./webpack.env.js');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const definePlugin = new webpack.DefinePlugin({
  _PRODUCTION_: isProduction,
  _DEVELOP_: !isProduction,
});

const extractPlugin = new MiniCssExtractPlugin({
  filename: '[name].[hash].css',
});

// Moment loads en-us by default
// https://github.com/moment/moment/tree/develop/locale
const momentContext = new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /pt-br/);

// https://github.com/yahoo/handlebars-intl/tree/master/dist/locale-data
const hbsIntlContext = new webpack.ContextReplacementPlugin(/handlebars-intl[\/\\]dist[\/\\]locale-data/, /en|pt/);

const cleanWebpackPlugin = new CleanWebpackPlugin();

const htmlWebpackPlugin = new HtmlWebpackPlugin({
  template: `${ jsRoot }/views/globals/root.hbs`,
  filename: 'index.html',
  hash: true,
  inject: 'head',
});

module.exports = {
  cleanWebpackPlugin,
  definePlugin,
  extractPlugin,
  hbsIntlContext,
  htmlWebpackPlugin,
  momentContext,
};
