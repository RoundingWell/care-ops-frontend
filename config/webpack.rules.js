const path = require('path');
const { isProduction, jsRoot, sassRoot } = require('./webpack.env.js');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const babelLoader = {
  test: /\.js?$/,
  exclude: /node_modules/,
  include: jsRoot,
  use: {
    loader: 'babel-loader',
    options: { cacheDirectory: !isProduction },
  },
};

const hbsLoader = {
  test: /\.hbs?$/,
  exclude: /node_modules/,
  include: jsRoot,
  loader: 'handlebars-template-loader',
};

const eslintLoader = {
  enforce: 'pre',
  test: /\.js$/,
  exclude: /node_modules/,
  loader: 'eslint-loader',
  options: { cache: false, fix: true },
};

const nullLoader = {
  test: /\.scss?$/,
  exclude: /node_modules/,
  loader: 'null-loader',
};

const cssLoader = {
  loader: 'css-loader',
  options: {
    sourceMap: !isProduction,
  },
};

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    sourceMap: !isProduction,
    plugins: [
      autoprefixer({ cascade: false }),
      cssnano({ preset: 'default' }),
    ],
  },
};

const sassLoader = {
  loader: 'sass-loader',
  options: {
    sourceMap: !isProduction,
    // Must import global variables/configs with each file
    // https://github.com/webpack-contrib/sass-loader/issues/218#issuecomment-266669156
    data: `@import \'${ sassRoot }/provider-variables.scss\';`,
  },
};

const sassExtractLoader = {
  test: /\.scss|\.css$/,
  include: [sassRoot, jsRoot, /node_modules/],
  use: [
    MiniCssExtractPlugin.loader,
    cssLoader,
    postcssLoader,
    sassLoader,
  ],
};

const ymlLoader = {
  test: /\.yml?$/,
  exclude: /node_modules/,
  include: jsRoot,
  use: ['i18n-sync-loader', 'yaml-loader'],
};

const resolveLoader = {
  alias: {
    'i18n-sync-loader': path.resolve(process.cwd(), './config/i18n-sync-loader'),
  },
};

module.exports = {
  babelLoader,
  hbsLoader,
  eslintLoader,
  nullLoader,
  sassExtractLoader,
  ymlLoader,
  resolveLoader,
};
