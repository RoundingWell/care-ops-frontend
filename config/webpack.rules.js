const path = require('path');
const { isProduction, sassRoot, isCI } = require('./webpack.env.js');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const babelLoader = {
  test: /\.js?$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: { cacheDirectory: !isProduction },
  },
};

const hbsLoader = {
  test: /\.hbs?$/,
  exclude: /node_modules/,
  loader: 'handlebars-template-loader',
};

const eslintLoader = {
  enforce: 'pre',
  test: /\.js$/,
  exclude: /node_modules/,
  loader: 'eslint-loader',
  options: { cache: false, fix: !isCI, failOnWarning: isCI },
};

const nullLoader = {
  test: /\.scss|\.css$/,
  loader: 'null-loader',
};

const cssLoader = {
  loader: 'css-loader',
  options: {
    url: false,
  },
};

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: [
        ['autoprefixer', { cascade: false }],
        ['cssnano', { preset: 'default' }],
      ],
    }
  },
};

const sassLoader = {
  loader: 'sass-loader',
  options: {
    // Must import global variables/configs with each file
    // https://github.com/webpack-contrib/sass-loader/issues/218#issuecomment-266669156
    additionalData: `@import \'${ sassRoot }/provider-variables.scss\';`,
  },
};

const sassExtractLoader = {
  test: /\.scss|\.css$/,
  use: [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: !isProduction,
        reloadAll: true,
      },
    },
    cssLoader,
    postcssLoader,
    sassLoader,
  ],
};

const ymlLoader = {
  test: /\.yml?$/,
  exclude: /node_modules/,
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
