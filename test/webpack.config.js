const path = require('path');
const { jsRoot, outputPath } = require('../config/webpack.env.js');

const {
  copyPlugin,
  definePlugin,
  eslintPlugin,
  fontPreloadPlugin,
  hbsIntlContextPlugin,
  htmlPlugin,
  injectManifestPlugin,
} = require('../config/webpack.plugins.js');

const {
  babelLoader,
  hbsLoader,
  nullLoader,
  ymlLoader,
  resolveLoader,
} = require('../config/webpack.rules.js');

babelLoader.use.options = {
  extends: path.resolve(process.cwd(), './.babelrc'),
  cacheDirectory: true,
};

module.exports = {
  mode: 'development',
  devtool: 'eval',
  entry: path.resolve(process.cwd(), `${ jsRoot }/index.js`),
  output: {
    path: outputPath,
    filename: '[name].[hash].js',
  },
  module: {
    rules: [
      // NOTE: babelLoader must be first as it is overridden in the plugin
      babelLoader,
      hbsLoader,
      nullLoader,
      ymlLoader,
    ],
  },
  plugins: [
    copyPlugin,
    definePlugin,
    eslintPlugin,
    fontPreloadPlugin,
    hbsIntlContextPlugin,
    htmlPlugin,
    injectManifestPlugin,
  ],
  resolve: {
    alias: {
      'marionette': 'backbone.marionette',
    },
    mainFields: ['module', 'main', 'browser'],
    modules: [
      'node_modules',
      path.resolve(process.cwd(), './src'),
      path.resolve(process.cwd(), './test'),
    ],
  },
  resolveLoader,
};
