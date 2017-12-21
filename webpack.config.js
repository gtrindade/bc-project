/* eslint no-undef: 0 */
/* eslint quotes: 0 */

const path = require('path')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry: [
    `./src/fe/main.js`,
    `./src/fe/main.scss`
  ],
  output: {
    filename: `./dist/public/[name].js`
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
            presets: [`env`, `es2015`],
            plugins: ['transform-class-properties']
          }
        }
      }, {
        test: /\.(sass|scss)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: './dist/public/[name].bundle.css',
      allChunks: true,
    }),
  ]
}
