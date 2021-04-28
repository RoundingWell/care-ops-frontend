const path = require('path');
const { isProduction, sassRoot } = require('./webpack.env.js');

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
    },
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

const sourceMapLoader = {
  test: /\.js$/,
  enforce: 'pre',
  use: [
    {
      loader: 'source-map-loader',
      options: {
        filterSourceMappingUrl(url, resourcePath) {
          if (resourcePath.includes('node_modules')) {
            return 'remove';
          }

          return true;
        },
      },
    },
  ],
};

module.exports = {
  babelLoader,
  hbsLoader,
  nullLoader,
  sassExtractLoader,
  ymlLoader,
  resolveLoader,
  sourceMapLoader,
};
