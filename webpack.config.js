/* eslint no-undef: 0 */
/* eslint quotes: 0 */

const path = require('path')

module.exports = {
  entry: {
    bundle: `./src/js/index.js`
  },
  output: {
    filename: `public/[name].js`
  },
  module: {
    loaders: [{
      test: /\.js$/,
      include: [
        path.resolve(__dirname, `node_modules`)
      ],
      loader: `babel-loader`
    }],
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: `babel-loader`,
          options: {
            presets: [`env`, `es2015`]
          }
        }
      }
    ]
  }
}
