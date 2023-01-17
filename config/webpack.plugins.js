const _ = require('underscore');
const path = require('path');
const webpack = require('webpack');
const { isProduction, isE2E, jsRoot, datePrefix, isCI } = require('./webpack.env.js');

const getFaIconSymbols = require('./fontawesome');
const CopyPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FontPreloadPlugin = require('webpack-font-preload-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');

const pkg = require('../package.json');

const definePlugin = new webpack.DefinePlugin({
  _PRODUCTION_: isProduction,
  _DEVELOP_: !isProduction,
  _E2E_: isE2E,
  _NOW_: Date.now(),
});

const extractPlugin = new MiniCssExtractPlugin({
  filename: `${ datePrefix }-[name]-[contenthash].css`,
});

// https://github.com/yahoo/handlebars-intl/tree/master/dist/locale-data
const hbsIntlContextPlugin = new webpack.ContextReplacementPlugin(/handlebars-intl[\/\\]dist[\/\\]locale-data/, /en|pt/);

const copyPlugin = new CopyPlugin({
  patterns: [
    { from: 'src/assets' },
    {
      from: `${ path.dirname(require.resolve('@fortawesome/fontawesome-pro/package.json')) }/webfonts`,
      to: 'webfonts',
    },
  ],
});

const htmlPlugin = new HtmlPlugin({
  template: `${ jsRoot }/views/globals/root.hbs`,
  filename: 'index.html',
  hash: true,
  inject: 'head',
  faIconSymbols: getFaIconSymbols(pkg.fontawesome),
});

const eslintPlugin = new ESLintPlugin({
  fix: !isCI,
  failOnWarning: isCI,
  lintDirtyModulesOnly: !isCI,
});


const fontPreloadPlugin = new FontPreloadPlugin({
  filter: 'ProximaSoft',
  extensions: ['woff2'],
  crossorigin: false,
});

const preCache = [
  /\.html$/,
  /\-main\-\S+\.js$/,
  /\.woff2$/,
  /site\.webmanifest$/,
];

const injectManifestPlugin = new InjectManifest({
  swSrc: './src/js/sw.js',
  include: isProduction ? preCache : _.rest(preCache),
  exclude: [/\.map$/, /\.DS_Store$/],
});

module.exports = {
  copyPlugin,
  definePlugin,
  eslintPlugin,
  extractPlugin,
  fontPreloadPlugin,
  hbsIntlContextPlugin,
  htmlPlugin,
  injectManifestPlugin,
};
