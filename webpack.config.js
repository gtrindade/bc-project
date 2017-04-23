/* eslint no-undef: 0*/

module.exports = {
  entry: {
    bundle: `./src/js/index.js`
  },
  output: {
    filename: `public/[name].js`
  },
  resolveLoader: {
    modulesDirectories: [
      `./node_modules`
    ]
  },
  module: {
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
