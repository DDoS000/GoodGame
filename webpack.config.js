const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

const isProd = process.argv.includes('production')

/**
 * Is build for Production
 * @type {boolean}
 */
if (!isProd) {
  require('./src/socket/socketIo')
}
module.exports = {

  /**
   * Minimal build setup.
   * Create your app bundle.
   */

  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'public', 'assets', 'scripts')
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './public/index.html',
      templateParameters: {
        // files: files(),
        isProd
      }
    }),
  ],

  /**
   * Minimal development setup.
   * Serves files in ./public folder.
   * Refresh browser automatically when your bundle changes.
   */

  devServer: {
    publicPath: '/assets/scripts/',
    contentBase: path.join(__dirname, 'public'),
    host: 'localhost',
    port: 8081
  }

};
