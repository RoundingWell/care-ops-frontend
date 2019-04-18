const path = require('path');
const { isProduction, jsRoot, outputPath } = require('./config/webpack.env.js');

const {
  cleanWebpackPlugin,
  definePlugin,
  extractPlugin,
  hbsIntlContext,
  htmlWebpackPlugin,
  momentContext,
  styleLintPlugin,
} = require('./config/webpack.plugins.js');

const {
  babelLoader,
  hbsLoader,
  eslintLoader,
  sassExtractLoader,
  ymlLoader,
} = require('./config/webpack.rules.js');

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: path.resolve(process.cwd(), `${ jsRoot }/index.js`),
  output: {
    path: outputPath,
    filename: '[name].[hash].js',
  },
  devServer: {
    index: 'index.html',
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    hot: true,
    writeToDisk: true,
  },
  module: {
    rules: [
      babelLoader,
      hbsLoader,
      eslintLoader,
      sassExtractLoader,
      ymlLoader,
    ],
  },
  plugins: [
    cleanWebpackPlugin,
    definePlugin,
    extractPlugin,
    hbsIntlContext,
    htmlWebpackPlugin,
    momentContext,
    styleLintPlugin,
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
  optimization: {
    noEmitOnErrors: false,
    splitChunks: {
      automaticNameDelimiter: '-',
      chunks: 'all',
      cacheGroups: {
        i18n: {
          test: /[\\/]i18n[\\/]/,
          reuseExistingChunk: true,
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
