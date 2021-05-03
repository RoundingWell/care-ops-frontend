const path = require('path');
const { isProduction, jsRoot, outputPath, datePrefix, isTest } = require('./config/webpack.env.js');

const {
  cleanPlugin,
  copyPlugin,
  definePlugin,
  eslintPlugin,
  extractPlugin,
  fontAwesomePlugin,
  hbsIntlContextPlugin,
  htmlPlugin,
} = require('./config/webpack.plugins.js');

const {
  babelLoader,
  hbsLoader,
  sassExtractLoader,
  ymlLoader,
  resolveLoader,
  sourceMapLoader,
} = require('./config/webpack.rules.js');

// Setup StyleLint here to get around Cypress issue
const StyleLintPlugin = require('stylelint-bare-webpack-plugin');

const styleLintPlugin = new StyleLintPlugin();

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'hidden-source-map' : 'eval',
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
    filename: `${ datePrefix }-[name]-[chunkhash].js`,
    chunkFilename: `${ datePrefix }-[name]-[chunkhash].js`,
  },
  target: isProduction ? 'browserslist' : 'web',
  devServer: {
    disableHostCheck: true,
    index: 'index.html',
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    historyApiFallback: true,
    hot: !isTest,
    open: !isTest,
    port: isTest ? 8090 : 8081,
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
      sourceMapLoader,
      sassExtractLoader,
      ymlLoader,
    ],
  },
  plugins: [
    cleanPlugin,
    copyPlugin,
    definePlugin,
    eslintPlugin,
    extractPlugin,
    fontAwesomePlugin,
    hbsIntlContextPlugin,
    htmlPlugin,
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
    emitOnErrors: true,
  },
};
