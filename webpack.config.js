const path = require('path');
const { isProduction, jsRoot, outputPath, datePrefix, isTest } = require('./config/webpack.env.js');

const {
  copyPlugin,
  definePlugin,
  eslintPlugin,
  extractPlugin,
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

const styleLintPlugin = new StyleLintPlugin({ fix: true });

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'hidden-source-map' : 'eval',
  entry: path.resolve(process.cwd(), `${ jsRoot }/index.js`),
  output: {
    clean: true,
    publicPath: '/',
    path: outputPath,
    filename: `${ datePrefix }-[name]-[chunkhash].js`,
    chunkFilename: `${ datePrefix }-[name]-[chunkhash].js`,
  },
  target: 'browserslist',
  devServer: {
    allowedHosts: 'all',
    client: {
      overlay: {
        warnings: false,
        errors: true,
      },
    },
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
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    watchFiles: [path.join(__dirname, 'package.json')],
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
    copyPlugin,
    definePlugin,
    eslintPlugin,
    extractPlugin,
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
