const path = require('path');
const { isProduction, jsRoot, outputPath, sassRoot } = require('./config/webpack.env.js');

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

const TerserPlugin = require('terser-webpack-plugin');

// Setup StyleLint here to get around Cypress issue
const StyleLintPlugin = require('stylelint-webpack-plugin');

const styleLintPlugin = new StyleLintPlugin({
  context: sassRoot,
});

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
    modules: ['node_modules', path.resolve(process.cwd(), './src')],
  },
  resolveLoader,
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
      }),
    ],
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
