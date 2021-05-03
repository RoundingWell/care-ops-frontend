const path = require('path');
const webpack = require('webpack');
const { isProduction, isE2E, jsRoot, datePrefix, isCI } = require('./webpack.env.js');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const FontAwesomePlugin = require('./fontawesome-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const pkg = require('../package.json');

const definePlugin = new webpack.DefinePlugin({
  _PRODUCTION_: isProduction,
  _DEVELOP_: !isProduction,
  _E2E_: isE2E,
});

const extractPlugin = new MiniCssExtractPlugin({
  filename: `${ datePrefix }-[name]-[contenthash].css`,
});

// https://github.com/yahoo/handlebars-intl/tree/master/dist/locale-data
const hbsIntlContextPlugin = new webpack.ContextReplacementPlugin(/handlebars-intl[\/\\]dist[\/\\]locale-data/, /en|pt/);

const cleanPlugin = new CleanWebpackPlugin();

const copyPlugin = new CopyPlugin({
  patterns: [
    { from: 'src/assets' },
    {
      from: `${path.dirname(
        require.resolve(`@fortawesome/fontawesome-pro/package.json`)
      )}/webfonts`,
      to: 'webfonts',
    },
  ],
});

const htmlPlugin = new HtmlPlugin({
  template: `${ jsRoot }/views/globals/root.hbs`,
  filename: 'index.html',
  hash: true,
  inject: 'head',
});

const fontAwesomePlugin = new FontAwesomePlugin(pkg.fontawesome);

const eslintPlugin = new ESLintPlugin({
  fix: !isCI,
  failOnWarning: isCI,
  lintDirtyModulesOnly: !isCI,
});

module.exports = {
  cleanPlugin,
  copyPlugin,
  definePlugin,
  eslintPlugin,
  extractPlugin,
  fontAwesomePlugin,
  hbsIntlContextPlugin,
  htmlPlugin,
};
