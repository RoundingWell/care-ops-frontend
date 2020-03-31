const path = require('path');
const { isProduction, jsRoot, outputPath } = require('./config/webpack.env.js');

const {
  cleanPlugin,
  copyPlugin,
  definePlugin,
  extractPlugin,
  fontAwesomePlugin,
  hbsIntlContextPlugin,
  htmlPlugin,
  momentContextPlugin,
} = require('./config/webpack.plugins.js');

const {
  babelLoader,
  hbsLoader,
  eslintLoader,
  sassExtractLoader,
  ymlLoader,
  resolveLoader,
} = require('./config/webpack.rules.js');

// Setup StyleLint here to get around Cypress issue
const StyleLintPlugin = require('stylelint-bare-webpack-plugin');

const styleLintPlugin = new StyleLintPlugin();

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: [
    'core-js/modules/es.promise',
    'core-js/modules/es.array.iterator',
    'core-js/modules/es.array.from',
    'core-js/modules/es.string.includes',
    path.resolve(process.cwd(), `${ jsRoot }/index.js`),
  ],
  output: {
    publicPath: '/',
    path: outputPath,
    filename: '[name].[hash].js',
    chunkFilename: '[name].[contenthash].bundle.js',
  },
  devServer: {
    disableHostCheck: true,
    index: 'index.html',
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    historyApiFallback: true,
    hot: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        pathRewrite: { '^/api': '' },
      },
    },
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
    cleanPlugin,
    copyPlugin,
    definePlugin,
    extractPlugin,
    fontAwesomePlugin,
    hbsIntlContextPlugin,
    htmlPlugin,
    momentContextPlugin,
    styleLintPlugin,
  ],
  resolve: {
    alias: {
      'marionette': 'backbone.marionette',
    },
    mainFields: ['module', 'main', 'browser'],
    modules: ['node_modules', path.resolve(process.cwd(), './src')],
  },
  resolveLoader,
  optimization: {
    noEmitOnErrors: false,
    splitChunks: {
      automaticNameDelimiter: '-',
    },
  },
};
